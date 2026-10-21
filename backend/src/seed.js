require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Customer, Installation, Maintenance } = require('./models');
const { addMonths } = require('./util');

const names = ['ABC Residence', 'Adebayo Household', 'Okafor Farms', 'Lagoon Clinic', 'Green Crest School', 'Musa Bakery', 'Nnamdi Hotel', 'Ife Cold Rooms', 'Zaria Telecom Hub', 'Chika Pharmacy', 'Bello Residence', 'Eko Print Works'];
const places = ['Abuja', 'Lagos', 'Enugu', 'Port Harcourt', 'Kano', 'Ibadan', 'Kaduna', 'Benin City'];
const types = ['residential', 'commercial', 'industrial'];
const sizes = [3, 5, 5, 10, 10, 15, 20];
const pick = (a, i) => a[i % a.length];
const comps = (kw) => [
  { type: 'panel', brand: 'Jinko', model: 'Tiger Neo 550W', quantity: Math.ceil((kw * 1000) / 550) },
  { type: 'battery', brand: 'Pylontech', model: 'US5000', quantity: Math.ceil(kw / 4) },
  { type: 'inverter', brand: 'Growatt', model: `SPF ${kw}K`, quantity: 1 },
  { type: 'charge_controller', brand: 'Victron', model: 'MPPT 150/70', quantity: 1 },
  { type: 'cable', brand: 'Generic', model: '6mm PV cable', quantity: 100 },
  { type: 'protection', brand: 'Schneider', model: 'DC breaker + SPD', quantity: 2 },
  { type: 'mounting', brand: 'Generic', model: 'Aluminium rail', quantity: 1 },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([User, Customer, Installation, Maintenance].map((m) => m.deleteMany({})));
  const hash = await bcrypt.hash('Password123!', 10);
  const [admin, t1, t2] = await User.create([
    { name: 'Admin User', email: 'admin@solar.test', password: hash, role: 'admin' },
    { name: 'Tunde Technician', email: 'tech1@solar.test', password: hash, role: 'technician' },
    { name: 'Amina Technician', email: 'tech2@solar.test', password: hash, role: 'technician' },
  ]);
  await User.create({ name: 'View Only', email: 'viewer@solar.test', password: hash, role: 'viewer' });
  const techs = [t1, t2];
  let n = 0;
  for (const [i, name] of names.entries()) {
    const tech = pick(techs, i), place = pick(places, i), kw = pick(sizes, i);
    const installed = addMonths(new Date(), -(2 + i * 2)); // staggered so statuses vary
    const c = await Customer.create({
      name, phone: `0803${String(1000000 + i * 7919).slice(0, 7)}`, email: `${name.toLowerCase().replace(/\W+/g, '.')}@example.com`,
      address: `${10 + i} Solar Avenue, ${place}`, installationDate: installed, installationType: pick(types, i), technician: tech._id,
    });
    const ins = await Installation.create({
      code: `SOL-${String(++n).padStart(4, '0')}`, customer: c._id, location: place, capacityKw: kw, installationDate: installed,
      technician: tech._id, warrantyMonths: i % 3 === 0 ? 36 : 24, status: i === 5 ? 'faulty' : 'active', intervalMonths: 6, components: comps(kw),
    });
    const rows = [1, 2, 3, 4].map((k) => ({ installation: ins._id, dueDate: addMonths(installed, k * 6) }));
    rows.forEach((r) => { if (r.dueDate < new Date(Date.now() - 20 * 864e5)) { r.state = 'completed'; r.completedAt = r.dueDate; } });
    if (i === 0) rows[0].dueDate = new Date(); // one due today
    if (i === 1) { rows[1].state = 'rescheduled'; rows[1].rescheduledFrom = rows[1].dueDate; }
    await Maintenance.insertMany(rows);
  }
  await require('./notify').runReminders();
  console.log('Seeded. Login: admin@solar.test / Password123! (also tech1@, tech2@, viewer@)');
  process.exit(0);
})();
