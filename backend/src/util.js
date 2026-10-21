const DAY = 86400000;
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
exports.addMonths = (d, n) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; };
// Derives display status from stored state and due date.
exports.statusOf = (m) => {
  if (m.state === 'completed') return { status: 'completed', daysRemaining: null };
  const days = Math.round((startOfDay(m.dueDate) - startOfDay(new Date())) / DAY);
  if (days < 0) return { status: 'overdue', daysRemaining: days };
  if (days === 0) return { status: 'due today', daysRemaining: 0 };
  return { status: m.state === 'rescheduled' ? 'rescheduled' : 'upcoming', daysRemaining: days };
};
