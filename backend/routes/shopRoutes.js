const express = require('express');
const shopController = require('../controllers/shopController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', shopController.getAllShops);
router.get('/search', shopController.searchShops);
router.get('/category/:category', shopController.getShopsByCategory);
router.get('/city/:city', shopController.getShopsByCity);
router.get('/:shopId', shopController.getShopById);

// Protected routes (shop owner only)
router.post('/', authMiddleware, shopController.createShop);
router.get('/user/my-shop', authMiddleware, shopController.getMyShop);
router.put('/:shopId', authMiddleware, shopController.updateShop);
router.delete('/:shopId', authMiddleware, shopController.deleteShop);

// Admin routes (for rating updates)
router.patch('/:shopId/rating', shopController.updateShopRating);

module.exports = router;
