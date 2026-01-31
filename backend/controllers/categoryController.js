const Category = require('../models/Category');

/**
 * Get all categories
 */
exports.getAllCategories = async (req, res) => {
  try {
    const { parentOnly, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };
    if (parentOnly === 'true') {
      filter.parentCategoryId = null;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const categories = await Category.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort('name');

    const total = await Category.countDocuments(filter);

    res.json({
      success: true,
      message: 'Categories retrieved',
      data: {
        categories,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
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
    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category retrieved',
      data: category
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
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category retrieved',
      data: category
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
 * Create category (admin only)
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

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: name.toLowerCase() });
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const category = new Category({
      name,
      description,
      icon,
      parentCategoryId: parentCategoryId || null
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: err.message
    });
  }
};

/**
 * Update category (admin only)
 */
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, icon, parentCategoryId } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (icon) updateData.icon = icon;
    if (parentCategoryId !== undefined) updateData.parentCategoryId = parentCategoryId || null;

    const category = await Category.findByIdAndUpdate(
      req.params.categoryId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: err.message
    });
  }
};

/**
 * Delete category (admin only)
 */
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: err.message
    });
  }
};
