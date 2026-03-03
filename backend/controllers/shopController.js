const prisma = require('../config/prisma');
const { createShopValidation, updateShopValidation } = require('../utils/validation');
const { withMongoId } = require('../utils/normalizers');

const parseSort = (sort) => {
  if (!sort || typeof sort !== 'string') return { createdAt: 'desc' };

  const direction = sort.startsWith('-') ? 'desc' : 'asc';
  const key = sort.replace(/^-/, '');
  const allowed = ['createdAt', 'updatedAt', 'rating', 'name'];

  if (!allowed.includes(key)) {
    return { createdAt: 'desc' };
  }

  return { [key]: direction };
};

const withOwnerAsOwnerId = (shop) => {
  if (!shop || !shop.owner) return shop;

  const { owner, ...rest } = shop;
  return {
    ...rest,
    ownerId: owner
  };
};

const cityOf = (shop) => {
  if (!shop || !shop.address || typeof shop.address !== 'object') return null;
  return shop.address.city || null;
};

/**
 * Create a new shop
 */
exports.createShop = async (req, res) => {
  try {
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

    const existingShop = await prisma.shop.findFirst({
      where: { ownerId: req.user.userId }
    });

    if (existingShop) {
      return res.status(409).json({
        success: false,
        message: 'You already have a shop. Please update the existing one.'
      });
    }

    const shop = await prisma.shop.create({
      data: {
        ownerId: req.user.userId,
        name: value.name,
        description: value.description || null,
        category: value.category,
        contact: {
          phone: value.phone,
          email: value.email,
          website: value.website || null
        },
        address: {
          street: value.street,
          city: value.city,
          district: value.district,
          postalCode: value.postalCode || null
        },
        about: value.about || null
      }
    });

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { userType: 'shop-owner' }
    });

    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: withMongoId(shop)
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

    const pageNumber = Number.parseInt(page, 10) || 1;
    const pageLimit = Number.parseInt(limit, 10) || 10;

    const where = {
      isActive: true,
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } }
            ]
          }
        : {})
    };

    const [fetchedShops, totalBeforeCityFilter] = await Promise.all([
      prisma.shop.findMany({
        where,
        orderBy: parseSort(sort),
        skip: city ? 0 : (pageNumber - 1) * pageLimit,
        take: city ? undefined : pageLimit,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        }
      }),
      prisma.shop.count({ where })
    ]);

    const cityFiltered = city
      ? fetchedShops.filter((shop) => String(cityOf(shop) || '').toLowerCase() === String(city).toLowerCase())
      : fetchedShops;

    const shops = city
      ? cityFiltered.slice((pageNumber - 1) * pageLimit, pageNumber * pageLimit)
      : cityFiltered;

    const total = city ? cityFiltered.length : totalBeforeCityFilter;

    res.json({
      success: true,
      message: 'Shops retrieved successfully',
      data: {
        shops: withMongoId(shops.map(withOwnerAsOwnerId)),
        pagination: {
          total,
          page: pageNumber,
          limit: pageLimit,
          pages: Math.ceil(total / pageLimit)
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
    const shop = await prisma.shop.findUnique({
      where: { id: req.params.shopId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true
          }
        }
      }
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.json({
      success: true,
      message: 'Shop retrieved successfully',
      data: withMongoId(withOwnerAsOwnerId(shop))
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
    const shop = await prisma.shop.findFirst({
      where: { ownerId: req.user.userId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true
          }
        }
      }
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'You do not have a shop yet'
      });
    }

    res.json({
      success: true,
      message: 'Your shop retrieved successfully',
      data: withMongoId(withOwnerAsOwnerId(shop))
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

    const shop = await prisma.shop.findUnique({
      where: { id: req.params.shopId }
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (shop.ownerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this shop'
      });
    }

    const updateData = {};

    if (value.name) updateData.name = value.name;
    if (value.description) updateData.description = value.description;
    if (value.category) updateData.category = value.category;
    if (value.about) updateData.about = value.about;

    if (value.phone || value.email || value.website) {
      const contact = shop.contact || {};
      updateData.contact = {
        phone: value.phone || contact.phone,
        email: value.email || contact.email,
        website: value.website || contact.website || null
      };
    }

    if (value.street || value.city || value.district || value.postalCode) {
      const address = shop.address || {};
      updateData.address = {
        ...address,
        street: value.street || address.street,
        city: value.city || address.city,
        district: value.district || address.district,
        postalCode: value.postalCode || address.postalCode || null
      };
    }

    if (value.openingHours) {
      updateData.openingHours = value.openingHours;
    }

    const updatedShop = await prisma.shop.update({
      where: { id: req.params.shopId },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Shop updated successfully',
      data: withMongoId(updatedShop)
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
    const shop = await prisma.shop.findUnique({
      where: { id: req.params.shopId }
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (shop.ownerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this shop'
      });
    }

    await prisma.shop.delete({ where: { id: req.params.shopId } });

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { userType: 'customer' }
    });

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
    const pageLimit = Number.parseInt(limit, 10) || 10;

    const shops = await prisma.shop.findMany({
      where: {
        isActive: true,
        ...(query
          ? {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } }
              ]
            }
          : {}),
        ...(category ? { category } : {}),
        ...(city ? {} : {})
      },
      take: pageLimit,
      select: {
        id: true,
        name: true,
        category: true,
        address: true,
        rating: true,
        totalReviews: true
      }
    });

    const filteredShops = city
      ? shops.filter((shop) => String(cityOf(shop) || '').toLowerCase() === String(city).toLowerCase())
      : shops;

    res.json({
      success: true,
      message: 'Search results',
      data: withMongoId(filteredShops)
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
    const { page = 1, limit = 10 } = req.query;
    const category = req.params.category || req.query.category;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    const pageNumber = Number.parseInt(page, 10) || 1;
    const pageLimit = Number.parseInt(limit, 10) || 10;

    const where = { category, isActive: true };

    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        skip: (pageNumber - 1) * pageLimit,
        take: pageLimit
      }),
      prisma.shop.count({ where })
    ]);

    res.json({
      success: true,
      message: `Shops in ${category} category`,
      data: {
        shops: withMongoId(shops),
        pagination: {
          total,
          page: pageNumber,
          limit: pageLimit,
          pages: Math.ceil(total / pageLimit)
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
    const { page = 1, limit = 10 } = req.query;
    const city = req.params.city || req.query.city;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City is required'
      });
    }

    const pageNumber = Number.parseInt(page, 10) || 1;
    const pageLimit = Number.parseInt(limit, 10) || 10;

    const allCityShops = await prisma.shop.findMany({
      where: { isActive: true }
    });

    const cityFiltered = allCityShops.filter((shop) => String(cityOf(shop) || '').toLowerCase() === String(city).toLowerCase());
    const total = cityFiltered.length;
    const shops = cityFiltered.slice((pageNumber - 1) * pageLimit, pageNumber * pageLimit);

    res.json({
      success: true,
      message: `Shops in ${city}`,
      data: {
        shops: withMongoId(shops),
        pagination: {
          total,
          page: pageNumber,
          limit: pageLimit,
          pages: Math.ceil(total / pageLimit)
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

    const shop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        rating: Number(rating),
        totalReviews: Number(totalReviews)
      }
    });

    res.json({
      success: true,
      message: 'Shop rating updated',
      data: withMongoId(shop)
    });
  } catch (err) {
    console.error('Update rating error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update shop rating',
      error: err.message
    });
  }
};
