const Product = require('../models/Product');
const Shop = require('../models/Shop');
const Category = require('../models/Category');

/**
 * Create a new product
 */
exports.createProduct = async (req, res) => {
  try {
    const { name, description, categoryId, price, discountPrice, quantity, sku } = req.body;

    // Validate required fields
    if (!name || !description || !categoryId || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, category, and price are required'
      });
    }

    // Verify shop exists and belongs to user
    const shop = await Shop.findOne({ ownerId: req.user.userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'You must have a shop to add products'
      });
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const product = new Product({
      shopId: shop._id,
      name,
      description,
      categoryId,
      price,
      discountPrice: discountPrice || null,
      quantity: quantity || 0,
      sku: sku || `${shop._id}-${Date.now()}`
    });

    await product.save();

    // Update shop total products
    shop.totalProducts += 1;
    await shop.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: err.message
    });
  }
};

/**
 * Get all products with filters
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { categoryId, shopId, search, minPrice, maxPrice, inStock, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const filter = { isActive: true };

    if (categoryId) filter.categoryId = categoryId;
    if (shopId) filter.shopId = shopId;
    if (inStock === 'true') filter.inStock = true;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .populate('shopId', 'name')
      .populate('categoryId', 'name slug')
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (err) {
    console.error('Get all products error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: err.message
    });
  }
};

/**
 * Get product by ID
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate('shopId')
      .populate('categoryId');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment views
    product.views += 1;
    await product.save();

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: err.message
    });
  }
};

/**
 * Get products by shop
 */
exports.getProductsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find({ shopId, isActive: true })
      .populate('categoryId', 'name')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments({ shopId, isActive: true });

    res.json({
      success: true,
      message: 'Shop products retrieved',
      data: {
        products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (err) {
    console.error('Get shop products error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: err.message
    });
  }
};

/**
 * Get my products (shop owner)
 */
exports.getMyProducts = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'You do not have a shop'
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find({ shopId: shop._id })
      .populate('categoryId', 'name')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments({ shopId: shop._id });

    res.json({
      success: true,
      message: 'Your products retrieved',
      data: {
        products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (err) {
    console.error('Get my products error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: err.message
    });
  }
};

/**
 * Update product
 */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Verify ownership
    const shop = await Shop.findById(product.shopId);
    if (shop.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this product'
      });
    }

    const allowedFields = ['name', 'description', 'price', 'discountPrice', 'quantity', 'inStock', 'categoryId', 'tags'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: err.message
    });
  }
};

/**
 * Delete product
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Verify ownership
    const shop = await Shop.findById(product.shopId);
    if (shop.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this product'
      });
    }

    await Product.findByIdAndDelete(req.params.productId);

    // Update shop total products
    shop.totalProducts = Math.max(0, shop.totalProducts - 1);
    await shop.save();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: err.message
    });
  }
};

/**
 * Search products
 */
exports.searchProducts = async (req, res) => {
  try {
    const { query, categoryId, minPrice, maxPrice, limit = 20 } = req.query;

    const filter = { isActive: true };

    if (query) {
      filter.$text = { $search: query };
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .limit(parseInt(limit))
      .select('name price discountPrice categoryId shopId rating images');

    res.json({
      success: true,
      message: 'Products found',
      data: products
    });
  } catch (err) {
    console.error('Search products error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: err.message
    });
  }
};

/**
 * Get featured products
 */
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.find({ isActive: true, isHighlighted: true })
      .limit(parseInt(limit))
      .sort('-rating')
      .populate('shopId', 'name');

    res.json({
      success: true,
      message: 'Featured products retrieved',
      data: products
    });
  } catch (err) {
    console.error('Get featured products error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: err.message
    });
  }
};

/**
 * Update product rating
 */
exports.updateProductRating = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, totalReviews } = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      { rating, totalReviews },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product rating updated',
      data: product
    });
  } catch (err) {
    console.error('Update rating error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update product rating',
      error: err.message
    });
  }
};
