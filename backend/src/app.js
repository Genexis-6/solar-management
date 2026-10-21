require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // add this
const path = require('path');
const fs = require('fs');
const { apiLimiter } = require('./middleware');
const { runReminders } = require('./notify');

const app = express();

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Health check: must come BEFORE the /api router
app.get('/api/health', async (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });
    }

    await mongoose.connection.db.admin().ping();

    res.json({
      status: 'ok',
      db: 'connected',
      state: states[mongoose.connection.readyState]
    });
  } catch (e) {
    console.error('DB health check failed:', e.message);
    res.status(503).json({
      status: 'error',
      db: 'unreachable',
      state: states[mongoose.connection.readyState]
    });
  }
});

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

const dist = path.join(__dirname, '..', '..', 'frontend', 'dist');

if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (req, res) =>
    res.sendFile(path.join(dist, 'index.html'))
  );
}

// Error handler goes last
app.use((err, req, res, next) =>
  res.status(err.name === 'ValidationError' ? 400 : 500).json({
    error: err.message
  })
);

module.exports = app;