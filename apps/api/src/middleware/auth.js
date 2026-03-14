const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Middleware to validate Bearer token on every protected request.
 * Attaches the decoded payload to req.user on success.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret);
    req.user = decoded; // { id, email, role }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
    });
  }
};

module.exports = authenticate;
