const Shop = require('../models/Shop');
const User = require('../models/User');
const { createShopValidation, updateShopValidation } = require('../utils/validation');

/**
 * Create a new shop
 */
exports.createShop = async (req, res) => {
  try {
    // Validate input
    const { error, value } = createShopValidation(req.body);
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

    // Check if user already has a shop
    const existingShop = await Shop.findOne({ ownerId: req.user.userId });
    if (existingShop) {
      return res.status(409).json({
        success: false,
        message: 'You already have a shop. Please update the existing one.'
      });
    }

    // Create shop object
    const shopData = {
      ownerId: req.user.userId,
      name: value.name,
      description: value.description,
      category: value.category,
      contact: {
        phone: value.phone,
        email: value.email,
        website: value.website
      },
      address: {
        street: value.street,
        city: value.city,
        district: value.district,
        postalCode: value.postalCode
      },
      about: value.about
    };

    // Create shop
    const shop = new Shop(shopData);
    await shop.save();

    // Update user type to SHOP_OWNER
    await User.findByIdAndUpdate(req.user.userId, { userType: 'SHOP_OWNER' });

    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: shop
    });
  } catch (err) {
    console.error('Create shop error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create shop',
      error: err.message
    });
  }
};

/**
 * Get all shops with filtering
 */
exports.getAllShops = async (req, res) => {
  try {
    const { category, city, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (city) {
      filter['address.city'] = city;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch shops
    const shops = await Shop.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('ownerId', 'firstName lastName email phone');

    // Get total count
    const total = await Shop.countDocuments(filter);

    res.json({
      success: true,
      message: 'Shops retrieved successfully',
      data: {
        shops,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (err) {
    console.error('Get all shops error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shops',
      error: err.message
    });
  }
};

/**
 * Get shop by ID
 */
exports.getShopById = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await Shop.findById(shopId)
      .populate('ownerId', 'firstName lastName email phone profileImage');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.json({
      success: true,
      message: 'Shop retrieved successfully',
      data: shop
    });
  } catch (err) {
    console.error('Get shop error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop',
      error: err.message
    });
  }
};

/**
 * Get shop by owner ID (current user's shop)
 */
exports.getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.userId })
      .populate('ownerId', 'firstName lastName email phone profileImage');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'You do not have a shop yet'
      });
    }

    res.json({
      success: true,
      message: 'Your shop retrieved successfully',
      data: shop
    });
  } catch (err) {
    console.error('Get my shop error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your shop',
      error: err.message
    });
  }
};

/**
 * Update shop
 */
exports.updateShop = async (req, res) => {
  try {
    // Validate input
    const { error, value } = updateShopValidation(req.body);
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

    // Find shop by ID and verify ownership
    const shop = await Shop.findById(req.params.shopId);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (shop.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this shop'
      });
    }

    // Prepare update data
    const updateData = {};

    // Simple fields
    if (value.name) updateData.name = value.name;
    if (value.description) updateData.description = value.description;
    if (value.category) updateData.category = value.category;
    if (value.about) updateData.about = value.about;

    // Contact info
    if (value.phone || value.email || value.website) {
      updateData.contact = {
        phone: value.phone || shop.contact.phone,
        email: value.email || shop.contact.email,
        website: value.website || shop.contact.website
      };
    }

    // Address info
    if (value.street || value.city || value.district || value.postalCode) {
      updateData.address = {
        street: value.street || shop.address.street,
        city: value.city || shop.address.city,
        district: value.district || shop.address.district,
        postalCode: value.postalCode || shop.address.postalCode,
        coordinates: shop.address.coordinates
      };
    }

    // Opening hours
    if (value.openingHours) {
      updateData.openingHours = value.openingHours;
    }

    // Update shop
    const updatedShop = await Shop.findByIdAndUpdate(
      req.params.shopId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Shop updated successfully',
      data: updatedShop
    });
  } catch (err) {
    console.error('Update shop error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update shop',
      error: err.message
    });
  }
};

/**
 * Delete shop
 */
exports.deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (shop.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this shop'
      });
    }

    await Shop.findByIdAndDelete(req.params.shopId);

    // Reset user type to CUSTOMER
    await User.findByIdAndUpdate(req.user.userId, { userType: 'CUSTOMER' });

    res.json({
      success: true,
      message: 'Shop deleted successfully'
    });
  } catch (err) {
    console.error('Delete shop error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete shop',
      error: err.message
    });
  }
};

/**
 * Search shops
 */
exports.searchShops = async (req, res) => {
  try {
    const { query, category, city, limit = 10 } = req.query;

    const filter = { isActive: true };

    if (query) {
      filter.$text = { $search: query };
    }

    if (category) {
      filter.category = category;
    }

    if (city) {
      filter['address.city'] = city;
    }

    const shops = await Shop.find(filter)
      .limit(parseInt(limit))
      .select('name category address.city rating totalReviews');

    res.json({
      success: true,
      message: 'Search results',
      data: shops
    });
  } catch (err) {
    console.error('Search shops error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to search shops',
      error: err.message
    });
  }
};

/**
 * Get shops by category
 */
exports.getShopsByCategory = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const shops = await Shop.find({ category, isActive: true })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Shop.countDocuments({ category, isActive: true });

    res.json({
      success: true,
      message: `Shops in ${category} category`,
      data: {
        shops,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (err) {
    console.error('Get shops by category error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shops',
      error: err.message
    });
  }
};

/**
 * Get shops in a specific city
 */
exports.getShopsByCity = async (req, res) => {
  try {
    const { city, page = 1, limit = 10 } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City is required'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const shops = await Shop.find({ 'address.city': city, isActive: true })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Shop.countDocuments({ 'address.city': city, isActive: true });

    res.json({
      success: true,
      message: `Shops in ${city}`,
      data: {
        shops,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (err) {
    console.error('Get shops by city error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shops',
      error: err.message
    });
  }
};

/**
 * Update shop rating
 */
exports.updateShopRating = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { rating, totalReviews } = req.body;

    const shop = await Shop.findByIdAndUpdate(
      shopId,
      { rating, totalReviews },
      { new: true }
    );

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.json({
      success: true,
      message: 'Shop rating updated',
      data: shop
    });
  } catch (err) {
    console.error('Update rating error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update shop rating',
      error: err.message
    });
  }
};
