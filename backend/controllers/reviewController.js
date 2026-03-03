const prisma = require('../config/prisma');
const { withMongoId } = require('../utils/normalizers');

const parseSort = (sort) => {
  if (!sort || typeof sort !== 'string') return { createdAt: 'desc' };

  const direction = sort.startsWith('-') ? 'desc' : 'asc';
  const key = sort.replace(/^-/, '');
  const allowed = ['createdAt', 'updatedAt', 'rating', 'helpful'];

  if (!allowed.includes(key)) {
    return { createdAt: 'desc' };
  }

  return { [key]: direction };
};

const withReviewerAsReviewerId = (review) => {
  if (!review || !review.reviewer) return review;

  const { reviewer, ...rest } = review;
  return {
    ...rest,
    reviewerId: reviewer
  };
};

const recalculateTargetRating = async (targetId, targetType) => {
  const allReviews = await prisma.review.findMany({
    where: { targetId, targetType }
  });

  const reviewCount = allReviews.length;
  const avgRating = reviewCount > 0
    ? allReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0;

  if (targetType === 'PRODUCT') {
    await prisma.product.update({
      where: { id: targetId },
      data: {
        rating: avgRating,
        totalReviews: reviewCount
      }
    });
  } else {
    await prisma.shop.update({
      where: { id: targetId },
      data: {
        rating: avgRating,
        totalReviews: reviewCount
      }
    });
  }
};

/**
 * Create a new review
 */
exports.createReview = async (req, res) => {
  try {
    const { targetId, targetType, rating, title, comment } = req.body;

    if (!targetId || !targetType || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Target ID, type, rating, title, and comment are required'
      });
    }

    if (!['PRODUCT', 'SHOP'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Target type must be PRODUCT or SHOP'
      });
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (targetType === 'PRODUCT') {
      const product = await prisma.product.findUnique({ where: { id: targetId } });
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'product not found'
        });
      }
    } else {
      const shop = await prisma.shop.findUnique({ where: { id: targetId } });
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'shop not found'
        });
      }
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: req.user.userId,
        targetId,
        targetType
      }
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this'
      });
    }

    const review = await prisma.review.create({
      data: {
        reviewerId: req.user.userId,
        targetId,
        targetType,
        rating: Number(rating),
        title,
        comment
      }
    });

    await recalculateTargetRating(targetId, targetType);

    const populatedReview = await prisma.review.findUnique({
      where: { id: review.id },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: withMongoId(withReviewerAsReviewerId(populatedReview))
    });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: err.message
    });
  }
};

/**
 * Get reviews for a product or shop
 */
exports.getReviews = async (req, res) => {
  try {
    const { targetId, targetType } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    if (!['PRODUCT', 'SHOP'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Target type must be PRODUCT or SHOP'
      });
    }

    const pageNumber = Number.parseInt(page, 10) || 1;
    const pageLimit = Number.parseInt(limit, 10) || 10;

    const where = {
      targetId,
      targetType,
      status: 'APPROVED'
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          }
        },
        skip: (pageNumber - 1) * pageLimit,
        take: pageLimit,
        orderBy: parseSort(sort)
      }),
      prisma.review.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Reviews retrieved',
      data: {
        reviews: withMongoId(reviews.map(withReviewerAsReviewerId)),
        pagination: {
          total,
          page: pageNumber,
          limit: pageLimit,
          pages: Math.ceil(total / pageLimit)
        }
      }
    });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: err.message
    });
  }
};

/**
 * Get review by ID
 */
exports.getReviewById = async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.reviewId },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true
          }
        }
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review retrieved',
      data: withMongoId(withReviewerAsReviewerId(review))
    });
  } catch (err) {
    console.error('Get review error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review',
      error: err.message
    });
  }
};

/**
 * Update review
 */
exports.updateReview = async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.reviewId }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.reviewerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this review'
      });
    }

    const allowedFields = ['rating', 'title', 'comment'];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (updateData.rating !== undefined) {
      updateData.rating = Number(updateData.rating);
    }

    const updatedReview = await prisma.review.update({
      where: { id: req.params.reviewId },
      data: updateData,
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      }
    });

    await recalculateTargetRating(updatedReview.targetId, updatedReview.targetType);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: withMongoId(withReviewerAsReviewerId(updatedReview))
    });
  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: err.message
    });
  }
};

/**
 * Delete review
 */
exports.deleteReview = async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.reviewId }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.reviewerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this review'
      });
    }

    await prisma.review.delete({ where: { id: req.params.reviewId } });

    await recalculateTargetRating(review.targetId, review.targetType);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: err.message
    });
  }
};

/**
 * Mark review as helpful
 */
exports.markHelpful = async (req, res) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.reviewId },
      data: { helpful: { increment: 1 } }
    });

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: withMongoId(review)
    });
  } catch (err) {
    console.error('Mark helpful error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to mark review',
      error: err.message
    });
  }
};

/**
 * Get reviews by user
 */
exports.getMyReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number.parseInt(page, 10) || 1;
    const pageLimit = Number.parseInt(limit, 10) || 10;

    const where = { reviewerId: req.user.userId };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: (pageNumber - 1) * pageLimit,
        take: pageLimit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Your reviews retrieved',
      data: {
        reviews: withMongoId(reviews),
        pagination: {
          total,
          page: pageNumber,
          limit: pageLimit,
          pages: Math.ceil(total / pageLimit)
        }
      }
    });
  } catch (err) {
    console.error('Get my reviews error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: err.message
    });
  }
};

/**
 * Get rating summary
 */
exports.getRatingSummary = async (req, res) => {
  try {
    const { targetId, targetType } = req.params;

    const reviews = await prisma.review.findMany({
      where: { targetId, targetType }
    });

    const summary = {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0,
      ratingDistribution: {
        5: reviews.filter(review => review.rating === 5).length,
        4: reviews.filter(review => review.rating === 4).length,
        3: reviews.filter(review => review.rating === 3).length,
        2: reviews.filter(review => review.rating === 2).length,
        1: reviews.filter(review => review.rating === 1).length
      }
    };

    res.json({
      success: true,
      message: 'Rating summary retrieved',
      data: summary
    });
  } catch (err) {
    console.error('Get rating summary error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rating summary',
      error: err.message
    });
  }
};
