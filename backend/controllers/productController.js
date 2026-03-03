const prisma = require('../config/prisma');
const { withMongoId } = require('../utils/normalizers');

const parseSort = (sort) => {
  if (!sort || typeof sort !== 'string') return { createdAt: 'desc' };

  const direction = sort.startsWith('-') ? 'desc' : 'asc';
  const key = sort.replace(/^-/, '');
  const allowed = ['createdAt', 'updatedAt', 'rating', 'price', 'name'];

  if (!allowed.includes(key)) {
    return { createdAt: 'desc' };
  }

  return { [key]: direction };
};

const withPopulatedFields = (product) => {
  if (!product) return product;

  const { shop, category, ...rest } = product;
  return {
    ...rest,
    shopId: shop || rest.shopId,
    categoryId: category || rest.categoryId
  };
};

/**
 * Create a new product
 */
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      categoryId,
      price,
      discountPrice,
      quantity,
      sku,
      images,
      tags,
      weight,
      dimensions
    } = req.body;

    if (!name || !description || !categoryId || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, category, and price are required'
      });
    }

    const shop = await prisma.shop.findFirst({
      where: { ownerId: req.user.userId }
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'You must have a shop to add products'
      });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const product = await prisma.product.create({
      data: {
        shopId: shop.id,
        name,
        description,
        categoryId,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        quantity: quantity ? Number(quantity) : 0,
        sku: sku || `${shop.id}-${Date.now()}`,
        images: Array.isArray(images) ? images.filter(Boolean) : null,
        tags: Array.isArray(tags) ? tags.filter(Boolean) : null,
        weight: weight !== undefined && weight !== null && weight !== '' ? Number(weight) : null,
        dimensions: dimensions && typeof dimensions === 'object' ? dimensions : null
      }
    });

    await prisma.shop.update({
      where: { id: shop.id },
      data: { totalProducts: { increment: 1 } }
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: withMongoId(product)
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

    const pageNumber = Number.parseInt(page, 10) || 1;
    const pageLimit = Number.parseInt(limit, 10) || 10;

    const where = {
      isActive: true,
      ...(categoryId ? { categoryId } : {}),
      ...(shopId ? { shopId } : {}),
      ...(inStock === 'true' ? { inStock: true } : {}),
      ...((minPrice || maxPrice)
        ? {
            price: {
              ...(minPrice ? { gte: Number(minPrice) } : {}),
              ...(maxPrice ? { lte: Number(maxPrice) } : {})
            }
          }
        : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } }
            ]
          }
        : {})
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          shop: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, slug: true } }
        },
        skip: (pageNumber - 1) * pageLimit,
        take: pageLimit,
        orderBy: parseSort(sort)
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products: withMongoId(products.map(withPopulatedFields)),
        pagination: {
          total,
          page: pageNumber,
          limit: pageLimit,
          pages: Math.ceil(total / pageLimit)
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
    const product = await prisma.product.findUnique({
      where: { id: req.params.productId },
      include: {
        shop: true,
        category: true
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { views: { increment: 1 } }
    });

    const updated = {
      ...product,
      views: product.views + 1
    };

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: withMongoId(withPopulatedFields(updated))
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

    const pageNumber = Number.parseInt(page, 10) || 1;
    const pageLimit = Number.parseInt(limit, 10) || 10;

    const where = { shopId, isActive: true };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true }
          }
        },
        skip: (pageNumber - 1) * pageLimit,
        take: pageLimit
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Shop products retrieved',
      data: {
        products: withMongoId(products.map(withPopulatedFields)),
        pagination: {
          total,
          page: pageNumber,
          limit: pageLimit,
          pages: Math.ceil(total / pageLimit)
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
    const shop = await prisma.shop.findFirst({
      where: { ownerId: req.user.userId }
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'You do not have a shop'
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Number.parseInt(page, 10) || 1;
    const pageLimit = Number.parseInt(limit, 10) || 10;

    const where = { shopId: shop.id };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true }
          }
        },
        skip: (pageNumber - 1) * pageLimit,
        take: pageLimit
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Your products retrieved',
      data: {
        products: withMongoId(products.map(withPopulatedFields)),
        pagination: {
          total,
          page: pageNumber,
          limit: pageLimit,
          pages: Math.ceil(total / pageLimit)
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
    const product = await prisma.product.findUnique({
      where: { id: req.params.productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const shop = await prisma.shop.findUnique({ where: { id: product.shopId } });
    if (!shop || shop.ownerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this product'
      });
    }

    const allowedFields = ['name', 'description', 'price', 'discountPrice', 'quantity', 'inStock', 'categoryId', 'tags', 'images', 'weight', 'dimensions', 'sku'];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }

    if (updateData.discountPrice !== undefined) {
      updateData.discountPrice = updateData.discountPrice === null ? null : Number(updateData.discountPrice);
    }

    if (updateData.quantity !== undefined) {
      updateData.quantity = Number(updateData.quantity);
    }

    if (updateData.weight !== undefined) {
      updateData.weight = updateData.weight === null || updateData.weight === '' ? null : Number(updateData.weight);
    }

    if (updateData.images !== undefined) {
      updateData.images = Array.isArray(updateData.images) ? updateData.images.filter(Boolean) : null;
    }

    if (updateData.tags !== undefined) {
      updateData.tags = Array.isArray(updateData.tags) ? updateData.tags.filter(Boolean) : null;
    }

    if (updateData.dimensions !== undefined && (!updateData.dimensions || typeof updateData.dimensions !== 'object')) {
      updateData.dimensions = null;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.productId },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: withMongoId(updatedProduct)
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
    const product = await prisma.product.findUnique({
      where: { id: req.params.productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const shop = await prisma.shop.findUnique({ where: { id: product.shopId } });
    if (!shop || shop.ownerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this product'
      });
    }

    await prisma.product.delete({ where: { id: req.params.productId } });

    await prisma.shop.update({
      where: { id: shop.id },
      data: {
        totalProducts: Math.max(0, (shop.totalProducts || 0) - 1)
      }
    });

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
    const pageLimit = Number.parseInt(limit, 10) || 20;

    const products = await prisma.product.findMany({
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
        ...(categoryId ? { categoryId } : {}),
        ...((minPrice || maxPrice)
          ? {
              price: {
                ...(minPrice ? { gte: Number(minPrice) } : {}),
                ...(maxPrice ? { lte: Number(maxPrice) } : {})
              }
            }
          : {})
      },
      take: pageLimit,
      select: {
        id: true,
        name: true,
        price: true,
        discountPrice: true,
        categoryId: true,
        shopId: true,
        rating: true,
        images: true
      }
    });

    res.json({
      success: true,
      message: 'Products found',
      data: withMongoId(products)
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
    const pageLimit = Number.parseInt(limit, 10) || 10;

    const products = await prisma.product.findMany({
      where: { isActive: true, isHighlighted: true },
      take: pageLimit,
      orderBy: { rating: 'desc' },
      include: {
        shop: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Featured products retrieved',
      data: {
        products: withMongoId(products.map(withPopulatedFields))
      }
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

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Number(rating),
        totalReviews: Number(totalReviews)
      }
    });

    res.json({
      success: true,
      message: 'Product rating updated',
      data: withMongoId(product)
    });
  } catch (err) {
    console.error('Update rating error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update product rating',
      error: err.message
    });
  }
};
