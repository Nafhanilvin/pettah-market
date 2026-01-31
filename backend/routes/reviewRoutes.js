const express = require('express');
const reviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/:targetType/:targetId', reviewController.getReviews);
router.get('/summary/:targetType/:targetId', reviewController.getRatingSummary);
router.get('/item/:reviewId', reviewController.getReviewById);

// Protected routes
router.post('/', authMiddleware, reviewController.createReview);
router.put('/:reviewId', authMiddleware, reviewController.updateReview);
router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);
router.get('/user/my-reviews', authMiddleware, reviewController.getMyReviews);

// Helpful mark
router.patch('/:reviewId/helpful', reviewController.markHelpful);

module.exports = router;
