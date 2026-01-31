const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: err.message
    });
  }
};

/**
 * Middleware to check if user is shop owner
 */
const shopOwnerMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    // Check user type from database would be done here
    // For now, we'll implement basic check
    next();
  });
};

/**
 * Middleware to check if user is admin
 */
const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    // Check if user is admin (implementation pending)
    next();
  });
};

module.exports = {
  authMiddleware,
  shopOwnerMiddleware,
  adminMiddleware
};
