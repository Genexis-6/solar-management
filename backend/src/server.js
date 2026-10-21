const app = require('./app');
const { connect } = require('./db');
const { runReminders } = require('./notify');
const port = process.env.PORT || 4000;
connect().then(() => {
  app.listen(port, () => console.log('Running on http://localhost:' + port));
  const tick = () => runReminders().catch((e) => console.error('Reminder run failed', e.message));
  tick(); setInterval(tick, 60 * 60 * 1000); // hourly automatic reminder check
});
