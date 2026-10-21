const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Customer, Installation, Maintenance, Notification } = require('./models');
const { runReminders } = require('./notify');
const { authenticate, requireRole, loginLimiter } = require('./middleware');
const { statusOf, addMonths } = require('./util');

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const write = requireRole('admin', 'technician');
const admin = requireRole('admin');

// Auth
router.post('/auth/login', loginLimiter, wrap(async (req, res) => {
  const u = await User.findOne({ email: String(req.body.email || '').toLowerCase() });
  if (!u || !(await bcrypt.compare(String(req.body.password || ''), u.password)))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: u._id, role: u.role, name: u.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '8h' });
  res.json({ token, user: { id: u._id, name: u.name, role: u.role } });
}));
router.post('/auth/register', authenticate, admin, wrap(async (req, res) => {
  const { name, email, password, role } = req.body;
  const u = await User.create({ name, email, role, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ id: u._id, name: u.name, role: u.role });
}));

router.use(authenticate);
router.get('/users', wrap(async (req, res) => res.json(await User.find({}, 'name email role'))));

// Customers (search with ?q=)
router.get('/customers', wrap(async (req, res) => {
  const q = req.query.q ? new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;
  const filter = q ? { $or: [{ name: q }, { email: q }, { phone: q }, { address: q }] } : {};
  res.json(await Customer.find(filter).populate('technician', 'name').sort('-createdAt'));
}));
router.get('/customers/:id', wrap(async (req, res) => {
  const c = await Customer.findById(req.params.id).populate('technician', 'name');
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json({ customer: c, installations: await Installation.find({ customer: c._id }) });
}));
router.post('/customers', write, wrap(async (req, res) => res.status(201).json(await Customer.create(req.body))));
router.put('/customers/:id', write, wrap(async (req, res) => res.json(await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true }))));
router.delete('/customers/:id', admin, wrap(async (req, res) => {
  const ins = await Installation.find({ customer: req.params.id }, '_id');
  await Maintenance.deleteMany({ installation: { $in: ins.map((i) => i._id) } });
  await Installation.deleteMany({ customer: req.params.id });
  await Customer.findByIdAndDelete(req.params.id);
  res.status(204).end();
}));

// Installations (creating one auto-generates its maintenance schedule)
router.get('/installations', wrap(async (req, res) =>
  res.json(await Installation.find().populate('customer', 'name').populate('technician', 'name').sort('-installationDate'))));
router.get('/installations/:id', wrap(async (req, res) => {
  const i = await Installation.findById(req.params.id).populate('customer').populate('technician', 'name');
  if (!i) return res.status(404).json({ error: 'Not found' });
  const m = await Maintenance.find({ installation: i._id }).sort('dueDate');
  res.json({ installation: i, maintenance: m.map((x) => ({ ...x.toObject(), ...statusOf(x) })) });
}));
router.post('/installations', write, wrap(async (req, res) => {
  const count = await Installation.countDocuments();
  const i = await Installation.create({ code: `SOL-${String(count + 1).padStart(4, '0')}`, ...req.body });
  const rows = [1, 2, 3, 4].map((n) => ({ installation: i._id, dueDate: addMonths(i.installationDate, n * i.intervalMonths) }));
  await Maintenance.insertMany(rows);
  res.status(201).json(i);
}));
router.put('/installations/:id', write, wrap(async (req, res) => res.json(await Installation.findByIdAndUpdate(req.params.id, req.body, { new: true }))));
router.delete('/installations/:id', admin, wrap(async (req, res) => {
  await Maintenance.deleteMany({ installation: req.params.id });
  await Installation.findByIdAndDelete(req.params.id);
  res.status(204).end();
}));

// Maintenance
const enrich = async (filter = {}) => {
  const list = await Maintenance.find(filter).populate({ path: 'installation', populate: { path: 'customer', select: 'name' } }).sort('dueDate');
  return list.filter((m) => m.installation).map((m) => ({ ...m.toObject(), ...statusOf(m) }));
};
router.get('/maintenance', wrap(async (req, res) => {
  const all = await enrich();
  res.json(req.query.status ? all.filter((m) => m.status === req.query.status) : all);
}));
router.patch('/maintenance/:id/complete', write, wrap(async (req, res) => {
  const m = await Maintenance.findById(req.params.id).populate('installation');
  if (!m) return res.status(404).json({ error: 'Not found' });
  m.state = 'completed'; m.completedAt = new Date(); m.notes = req.body.notes || m.notes;
  await m.save();
  await Maintenance.create({ installation: m.installation._id, dueDate: addMonths(m.dueDate, 4 * m.installation.intervalMonths) });
  res.json(m);
}));
router.patch('/maintenance/:id/reschedule', write, wrap(async (req, res) => {
  const m = await Maintenance.findById(req.params.id);
  if (!m || !req.body.dueDate) return res.status(400).json({ error: 'dueDate required' });
  m.rescheduledFrom = m.dueDate; m.dueDate = new Date(req.body.dueDate); m.state = 'rescheduled';
  await m.save();
  res.json(m);
}));

// Reminders: pending items due within ?days (default 30), including overdue
router.get('/reminders', wrap(async (req, res) => {
  const days = Number(req.query.days) || 30;
  const out = (await enrich({ state: { $ne: 'completed' } }))
    .filter((m) => m.daysRemaining <= days)
    .map((m) => ({
      id: m._id, installationId: m.installation._id, customer: m.installation.customer.name, system: `${m.installation.capacityKw} kW Solar Installation`,
      location: m.installation.location, maintenanceDate: m.dueDate, status: m.status, daysRemaining: m.daysRemaining,
      message: m.daysRemaining < 0 ? `${-m.daysRemaining} days overdue` : m.daysRemaining === 0 ? 'Due today' : `${m.daysRemaining} days remaining`,
    }));
  res.json(out);
}));

router.get('/dashboard', wrap(async (req, res) => {
  const all = await enrich();
  const counts = all.reduce((a, m) => ((a[m.status] = (a[m.status] || 0) + 1), a), {});
  res.json({ customers: await Customer.countDocuments(), installations: await Installation.countDocuments(), maintenance: counts });
}));

router.post('/maintenance', write, wrap(async (req, res) => {
  const { installation, dueDate, notes } = req.body;
  if (!installation || !dueDate) return res.status(400).json({ error: 'installation and dueDate required' });
  res.status(201).json(await Maintenance.create({ installation, dueDate, notes }));
}));
router.delete('/maintenance/:id', admin, wrap(async (req, res) => { await Maintenance.findByIdAndDelete(req.params.id); res.status(204).end(); }));

// Users (admin)
router.patch('/users/:id', admin, wrap(async (req, res) => {
  const { name, role } = req.body;
  if (role && !['admin', 'technician', 'viewer'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  res.json(await User.findByIdAndUpdate(req.params.id, { name, role }, { new: true, select: 'name email role' }));
}));
router.delete('/users/:id', admin, wrap(async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account' });
  await User.findByIdAndDelete(req.params.id);
  res.status(204).end();
}));

// Notifications
router.get('/notifications', wrap(async (req, res) =>
  res.json({ items: await Notification.find().sort('-createdAt').limit(50), unread: await Notification.countDocuments({ read: false }) })));
router.patch('/notifications/read', wrap(async (req, res) => { await Notification.updateMany({ read: false }, { read: true }); res.json({ ok: true }); }));
router.post('/notifications/run', write, wrap(async (req, res) => res.json({ created: await runReminders() })));

// Mailing simulation / future provider integration
const mailHistory = [
  {
    id: 'mail-1',
    recipient: 'adebayo.household@example.com',
    customer: 'Adebayo Household',
    subject: 'Upcoming Solar Maintenance Inspection — 5 kW Solar System',
    status: 'delivered',
    sentAt: new Date(Date.now() - 3600000 * 4),
  },
  {
    id: 'mail-2',
    recipient: 'abc.residence@example.com',
    customer: 'ABC Residence',
    subject: 'Urgent: Solar Maintenance Inspection Due — 10 kW System',
    status: 'delivered',
    sentAt: new Date(Date.now() - 86400000 * 2),
  }
];

router.get('/mail/history', wrap(async (req, res) => res.json(mailHistory)));

router.post('/mail/send', write, wrap(async (req, res) => {
  const { recipient, customer, subject, message } = req.body;
  if (!recipient || !subject) return res.status(400).json({ error: 'recipient and subject required' });
  const entry = {
    id: 'mail-' + Date.now(),
    recipient,
    customer: customer || recipient,
    subject,
    message,
    status: 'delivered',
    sentAt: new Date(),
  };
  mailHistory.unshift(entry);
  res.status(201).json({ ok: true, entry });
}));

module.exports = router;

