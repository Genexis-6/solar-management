
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { apiLimiter } = require('./middleware');
const { runReminders } = require('./notify');

const app = express();

// Trust the single proxy hop in front of this application.
// Verify this matches your Vercel deployment's proxy topology.
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Optional scheduled trigger protected by CRON_SECRET
app.get('/api/cron/reminders', async (req, res, next) => {
  if (
    !process.env.CRON_SECRET ||
    req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    res.json({ created: await runReminders() });
  } catch (e) {
    next(e);
  }
});

app.use('/api', apiLimiter, require('./routes'));

// Serves the built React app (frontend/dist) when it exists
const dist = path.join(__dirname, '..', '..', 'frontend', 'dist');

if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (req, res) =>
    res.sendFile(path.join(dist, 'index.html'))
  );
}

app.use((err, req, res, next) =>
  res.status(err.name === 'ValidationError' ? 400 : 500).json({
    error: err.message
  })
);



app.get('/api/health', async (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = states[mongoose.connection.readyState];

  try {
    // On serverless, the first request after a cold start may arrive
    // before the connection is ready, so connect first if needed.
    // (Replace with your own connect function if you have one.)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });
    }

    // A real round trip to the database
    await mongoose.connection.db.admin().ping();

    res.json({ status: 'ok', db: 'connected', state });
  } catch (e) {
    console.error('DB health check failed:', e.message);
    res.status(503).json({ status: 'error', db: 'unreachable', state });
  }
});


module.exports = app;
