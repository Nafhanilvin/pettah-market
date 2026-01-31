const Review = require('../models/Review');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const User = require('../models/User');

/**
 * Create a new review
 */
exports.createReview = async (req, res) => {
  try {
    const { targetId, targetType, rating, title, comment } = req.body;

    // Validate required fields
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

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if target exists
    let target;
    if (targetType === 'PRODUCT') {
      target = await Product.findById(targetId);
    } else {
      target = await Shop.findById(targetId);
    }

    if (!target) {
      return res.status(404).json({
        success: false,
        message: `${targetType.toLowerCase()} not found`
      });
    }

    // Check if user already reviewed this
    const existingReview = await Review.findOne({
      reviewerId: req.user.userId,
      targetId,
      targetType
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this'
      });
    }

    const review = new Review({
      reviewerId: req.user.userId,
      targetId,
      targetType,
      rating,
      title,
      comment
    });

    await review.save();

    // Update target rating
    const allReviews = await Review.find({ targetId, targetType });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    if (targetType === 'PRODUCT') {
      await Product.findByIdAndUpdate(targetId, {
        rating: avgRating,
        totalReviews: allReviews.length
      });
    } else {
      await Shop.findByIdAndUpdate(targetId, {
        rating: avgRating,
        totalReviews: allReviews.length
      });
    }

    // Populate reviewer info
    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'firstName lastName profileImage');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: populatedReview
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

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ targetId, targetType, status: 'APPROVED' })
      .populate('reviewerId', 'firstName lastName profileImage')
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort);

    const total = await Review.countDocuments({ targetId, targetType, status: 'APPROVED' });

    res.json({
      success: true,
      message: 'Reviews retrieved',
      data: {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
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
    const review = await Review.findById(req.params.reviewId)
      .populate('reviewerId', 'firstName lastName email profileImage');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review retrieved',
      data: review
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
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Verify ownership
    if (review.reviewerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this review'
      });
    }

    const allowedFields = ['rating', 'title', 'comment'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.reviewId,
      updateData,
      { new: true, runValidators: true }
    ).populate('reviewerId', 'firstName lastName profileImage');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
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
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Verify ownership
    if (review.reviewerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this review'
      });
    }

    await Review.findByIdAndDelete(req.params.reviewId);

    // Recalculate ratings
    const allReviews = await Review.find({ targetId: review.targetId, targetType: review.targetType });

    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      if (review.targetType === 'PRODUCT') {
        await Product.findByIdAndUpdate(review.targetId, {
          rating: avgRating,
          totalReviews: allReviews.length
        });
      } else {
        await Shop.findByIdAndUpdate(review.targetId, {
          rating: avgRating,
          totalReviews: allReviews.length
        });
      }
    }

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
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: review
    });
  } catch (err) {
    console.error('Mark helpful error:', err);
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
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ reviewerId: req.user.userId })
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await Review.countDocuments({ reviewerId: req.user.userId });

    res.json({
      success: true,
      message: 'Your reviews retrieved',
      data: {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
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

    const reviews = await Review.find({ targetId, targetType });

    const summary = {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
      ratingDistribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length
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
