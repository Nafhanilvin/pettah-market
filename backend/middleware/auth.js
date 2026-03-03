const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { normalizeUserType } = require('../utils/normalizers');

/**
 * Middleware to verify JWT token
 */
const protect = async (req, res, next) => {
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
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Attach user to request
    req.user = {
      ...user,
      userType: normalizeUserType(user.userType),
      userId: user.id
    };
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
const shopOwnerOnly = (req, res, next) => {
  const role = normalizeUserType(req.user.userType);
  if (role !== 'shop-owner' && role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Shop owner role required.'
    });
  }
  next();
};

/**
 * Middleware to check if user is admin
 */
const adminOnly = (req, res, next) => {
  const role = normalizeUserType(req.user.userType);
  if (role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

/**
 * Middleware to check if user is customer
 */
const customerOnly = (req, res, next) => {
  const role = normalizeUserType(req.user.userType);
  if (role !== 'customer' && role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Customer role required.'
    });
  }
  next();
};

module.exports = {
  protect,
  shopOwnerOnly,
  adminOnly,
  customerOnly,
  // Legacy exports for backward compatibility
  authMiddleware: protect,
  shopOwnerMiddleware: shopOwnerOnly,
  adminMiddleware: adminOnly
};
