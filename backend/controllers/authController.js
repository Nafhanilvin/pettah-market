const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { generateToken, generateTokens } = require('../utils/jwt');
const { registerValidation, loginValidation, createOwnerWithShopValidation } = require('../utils/validation');
const { toPublicUser, normalizeUserType } = require('../utils/normalizers');

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerValidation(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(err => ({
          field: err.path[0],
          message: err.message
        }))
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: value.email }
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(value.password, 10);

    const requestedUserType = normalizeUserType(value.userType);
    if (requestedUserType !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Only customer registration is allowed. Admin must create shop-owner accounts.'
      });
    }

    const user = await prisma.user.create({
      data: {
      email: value.email,
      password: hashedPassword,
      firstName: value.firstName,
      lastName: value.lastName,
      userType: 'customer'
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: toPublicUser(user),
        accessToken,
        refreshToken
      }
    });
  } catch (err) {
    console.error('Register error:', err);

    const isDbConnectivityError =
      err?.name === 'PrismaClientInitializationError' ||
      err?.code === 'P1001' ||
      err?.code === 'P1000';

    res.status(500).json({
      success: false,
      message: isDbConnectivityError
        ? 'Database temporarily unavailable. Please try again in a moment.'
        : 'Registration failed'
    });
  }
};

/**
 * Admin creates owner and initial shop in one operation
 */
exports.createOwnerWithShop = async (req, res) => {
  try {
    const { error, value } = createOwnerWithShopValidation(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    const ownerEmail = value.owner.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: ownerEmail } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(value.owner.password, 10);

    const result = await prisma.$transaction(async (transaction) => {
      const owner = await transaction.user.create({
        data: {
          firstName: value.owner.firstName,
          lastName: value.owner.lastName,
          email: ownerEmail,
          password: hashedPassword,
          userType: 'shop-owner'
        }
      });

      const shop = await transaction.shop.create({
        data: {
          ownerId: owner.id,
          name: value.shop.name,
          description: value.shop.description || null,
          category: value.shop.category,
          contact: {
            phone: value.shop.phone,
            email: value.shop.email,
            website: value.shop.website || null
          },
          address: {
            street: value.shop.street,
            city: value.shop.city,
            district: value.shop.district,
            postalCode: value.shop.postalCode || null
          },
          about: value.shop.about || null,
          isActive: true
        }
      });

      return { owner, shop };
    });

    return res.status(201).json({
      success: true,
      message: 'Shop owner and initial shop created successfully',
      data: {
        owner: toPublicUser(result.owner),
        shop: result.shop
      }
    });
  } catch (err) {
    console.error('Create owner with shop error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create owner and shop'
    });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginValidation(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(err => ({
          field: err.path[0],
          message: err.message
        }))
      });
    }

    // Find user by email and select password
    const user = await prisma.user.findUnique({
      where: { email: value.email }
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(value.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: toPublicUser(user),
        accessToken,
        refreshToken
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: err.message
    });
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User profile retrieved',
      data: toPublicUser(user)
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: err.message
    });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone', 'address'];
    const updateData = {};

    // Only allow specific fields to be updated
    allowedFields.forEach(field => {
      if (req.body[field]) {
        updateData[field] = req.body[field];
      }
    });

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User profile updated successfully',
      data: toPublicUser(user)
    });
  } catch (err) {
    console.error('Update profile error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: err.message
    });
  }
};

/**
 * Logout user (can be used to invalidate tokens on frontend)
 */
exports.logout = (req, res) => {
  res.json({
    success: true,
    message: 'User logged out successfully'
  });
};

/**
 * Refresh access token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken: newAccessToken,
        refreshToken
      }
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      error: err.message
    });
  }
};
