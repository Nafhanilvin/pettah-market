const prisma = require('../config/prisma');
const { withMongoId } = require('../utils/normalizers');

const slugify = (name) =>
  String(name)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');

/**
 * Get all categories
 */
exports.getAllCategories = async (req, res) => {
  try {
    const { parentOnly, page = 1, limit = 20 } = req.query;

    const pageNumber = Number.parseInt(page, 10) || 1;
    const pageLimit = Number.parseInt(limit, 10) || 20;

    const where = {
      isActive: true,
      ...(parentOnly === 'true' ? { parentCategoryId: null } : {})
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip: (pageNumber - 1) * pageLimit,
        take: pageLimit,
        orderBy: { name: 'asc' }
      }),
      prisma.category.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Categories retrieved',
      data: {
        categories: withMongoId(categories),
        pagination: {
          total,
          page: pageNumber,
          limit: pageLimit,
          pages: Math.ceil(total / pageLimit)
        }
      }
    });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: err.message
    });
  }
};

/**
 * Get category by ID
 */
exports.getCategoryById = async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.categoryId }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category retrieved',
      data: withMongoId(category)
    });
  } catch (err) {
    console.error('Get category error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: err.message
    });
  }
};

/**
 * Get category by slug
 */
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category retrieved',
      data: withMongoId(category)
    });
  } catch (err) {
    console.error('Get category by slug error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: err.message
    });
  }
};

/**
 * Create category (shop owner/admin)
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon, parentCategoryId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const normalizedName = String(name).trim();

    const existingCategory = await prisma.category.findFirst({
      where: { name: normalizedName }
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const category = await prisma.category.create({
      data: {
        name: normalizedName,
        slug: slugify(normalizedName),
        description: description || null,
        icon: icon || null,
        parentCategoryId: parentCategoryId || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: withMongoId(category)
    });
  } catch (err) {
    console.error('Create category error:', err);
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Category already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: err.message
    });
  }
};

/**
 * Update category (shop owner/admin)
 */
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, icon, parentCategoryId } = req.body;

    const updateData = {};
    if (name) {
      updateData.name = String(name).trim();
      updateData.slug = slugify(name);
    }
    if (description !== undefined) updateData.description = description || null;
    if (icon !== undefined) updateData.icon = icon || null;
    if (parentCategoryId !== undefined) updateData.parentCategoryId = parentCategoryId || null;

    const category = await prisma.category.update({
      where: { id: req.params.categoryId },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: withMongoId(category)
    });
  } catch (err) {
    console.error('Update category error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Category already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: err.message
    });
  }
};

/**
 * Delete category (shop owner/admin)
 */
exports.deleteCategory = async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: req.params.categoryId }
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (err) {
    console.error('Delete category error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: err.message
    });
  }
};
