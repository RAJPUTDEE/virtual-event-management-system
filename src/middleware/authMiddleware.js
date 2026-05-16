const jwt = require('jsonwebtoken');
const { findUserById } = require('../services/authService');

function authenticateRequest(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'authorization token required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'development-secret');
    const user = findUserById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: 'invalid token' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
}

module.exports = {
  authenticateRequest
};