const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

exports.authenticate = (req, res, next) => {
  const h = req.headers.authorization || '';
  try {
    req.user = jwt.verify(h.startsWith('Bearer ') ? h.slice(7) : '', process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid or missing token' }); }
};
exports.requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });

exports.apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false });
exports.loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, message: { error: 'Too many login attempts, try later' } });
