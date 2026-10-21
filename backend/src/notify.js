const { Maintenance, Notification } = require('./models');
const { statusOf } = require('./util');

// Creates one notification per maintenance item per window (30, 7, 1, 0 days, overdue). Safe to run repeatedly.
exports.runReminders = async () => {
  const list = await Maintenance.find({ state: { $ne: 'completed' } })
    .populate({ path: 'installation', populate: { path: 'customer', select: 'name' } });
  let created = 0;
  for (const m of list) {
    if (!m.installation || !m.installation.customer) continue;
    const d = statusOf(m).daysRemaining;
    const bucket = d < 0 ? 'overdue' : [0, 1, 7, 30].find((w) => d <= w);
    if (bucket === undefined) continue;
    const text = d < 0 ? `${-d} days overdue` : d === 0 ? 'due today' : `${d} days remaining`;
    const i = m.installation;
    try {
      await Notification.create({
        key: `${m._id}:${bucket}:${m.dueDate.toISOString().slice(0, 10)}`,
        maintenance: m._id,
        level: d < 0 ? 'danger' : d <= 7 ? 'warning' : 'info',
        message: `${i.customer.name}, ${i.capacityKw} kW system in ${i.location}: maintenance ${text}`,
      });
      created++;
    } catch (e) { if (e.code !== 11000) throw e; }
  }
  return created;
};
