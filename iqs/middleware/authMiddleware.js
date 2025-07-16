const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');

// Middleware: Authenticate user and set req.user
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  // Set language from Accept-Language header (default en)
  req.lang = req.headers['accept-language']?.split(',')[0] || 'en';
  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// Middleware: Authorize user by role
const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// Helper: Allow if user is self or has required role
const isSelfOrRole = (req, targetUserId, roles=[]) => {
  return req.user.id === targetUserId || roles.includes(req.user.role);
};

module.exports = { authenticate, authorize, isSelfOrRole };

