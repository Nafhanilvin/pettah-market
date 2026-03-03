const prisma = require('../config/prisma');
const { withMongoId } = require('../utils/normalizers');

const toStreetWithShops = async (streetId) => {
  const street = await prisma.street.findUnique({
    where: { id: streetId }
  });

  if (!street) {
    return null;
  }

  const shops = await prisma.shop.findMany({
    where: { streetId: street.id },
    orderBy: { createdAt: 'desc' }
  });

  return {
    ...street,
    shops
  };
};

/**
 * Get all streets
 */
exports.getAllStreets = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;

    const pageNumber = Number.parseInt(page, 10) || 1;
    const pageLimit = Number.parseInt(limit, 10) || 20;

    const where = {
      ...(isActive !== undefined ? { isActive: isActive === 'true' } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } }
            ]
          }
        : {})
    };

    const [streets, total] = await Promise.all([
      prisma.street.findMany({
        where,
        orderBy: { name: 'asc' },
        take: pageLimit,
        skip: (pageNumber - 1) * pageLimit
      }),
      prisma.street.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        streets: withMongoId(streets),
        pagination: {
          total,
          page: pageNumber,
          pages: Math.ceil(total / pageLimit)
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streets',
      error: err.message
    });
  }
};

/**
 * Get single street
 */
exports.getStreet = async (req, res) => {
  try {
    const street = await toStreetWithShops(req.params.id);

    if (!street) {
      return res.status(404).json({
        success: false,
        message: 'Street not found'
      });
    }

    res.json({
      success: true,
      data: withMongoId(street)
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch street',
      error: err.message
    });
  }
};

/**
 * Create street (Admin only)
 */
exports.createStreet = async (req, res) => {
  try {
    const street = await prisma.street.create({
      data: {
        name: req.body.name,
        description: req.body.description || null,
        location: req.body.location || null,
        isActive: req.body.isActive ?? true,
        shopCount: req.body.shopCount ?? 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Street created successfully',
      data: withMongoId(street)
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Street with this name already exists'
      });
    }

    res.status(400).json({
      success: false,
      message: 'Failed to create street',
      error: err.message
    });
  }
};

/**
 * Update street (Admin only)
 */
exports.updateStreet = async (req, res) => {
  try {
    const street = await prisma.street.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({
      success: true,
      message: 'Street updated successfully',
      data: withMongoId(street)
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Street not found'
      });
    }

    res.status(400).json({
      success: false,
      message: 'Failed to update street',
      error: err.message
    });
  }
};

/**
 * Delete street (Admin only)
 */
exports.deleteStreet = async (req, res) => {
  try {
    const street = await prisma.street.findUnique({ where: { id: req.params.id } });

    if (!street) {
      return res.status(404).json({
        success: false,
        message: 'Street not found'
      });
    }

    const shopCount = await prisma.shop.count({ where: { streetId: req.params.id } });
    if (shopCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete street with ${shopCount} shops. Please remove or reassign shops first.`
      });
    }

    await prisma.street.delete({ where: { id: req.params.id } });

    res.json({
      success: true,
      message: 'Street deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete street',
      error: err.message
    });
  }
};

/**
 * Get streets with shop count
 */
exports.getStreetsWithStats = async (req, res) => {
  try {
    const streets = await prisma.street.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { shops: true }
        }
      }
    });

    const data = streets.map((street) => ({
      ...street,
      shopCount: street._count.shops,
      _count: undefined
    }));

    res.json({
      success: true,
      data: withMongoId(data)
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streets',
      error: err.message
    });
  }
};
