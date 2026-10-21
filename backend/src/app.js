require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { connect } = require('./db'); // your existing connection logic
const { apiLimiter } = require('./middleware');
const { runReminders } = require('./notify');

const app = express();

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Connect (once, cached) before any route runs. Needed on Vercel,
// where server.js never executes.
let connectionPromise = null;

function ensureConnected() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!connectionPromise) {
    connectionPromise = Promise.resolve(connect()).catch((err) => {
      connectionPromise = null; // retry on the next request
      throw err;
    });
  }
  return connectionPromise;
}

app.use(async (req, res, next) => {
  try {
    await ensureConnected();
    next();
  } catch (e) {
    console.error('DB connection failed:', e.message);
    res.status(503).json({ error: 'Database unavailable' });
  }
});

// Health check: no connect logic of its own, so it tests the real path
app.get('/api/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'ok', db: mongoose.connection.name });
  } catch (e) {
    console.error('Health check failed:', e.message);
    res.status(503).json({ status: 'error' });
  }
});

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

app.use((err, req, res, next) =>
  res.status(err.name === 'ValidationError' ? 400 : 500).json({
    error: err.message
  })
);

module.exports = app;