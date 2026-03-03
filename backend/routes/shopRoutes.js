const express = require('express');
const shopController = require('../controllers/shopController');
const { authMiddleware, shopOwnerMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', shopController.getAllShops);
router.get('/search', shopController.searchShops);
router.get('/category/:category', shopController.getShopsByCategory);
router.get('/city/:city', shopController.getShopsByCity);

// Protected routes (shop owner only)
router.post('/', authMiddleware, shopOwnerMiddleware, shopController.createShop);
router.get('/user/my-shop', authMiddleware, shopController.getMyShop);
router.put('/:shopId', authMiddleware, shopController.updateShop);
router.delete('/:shopId', authMiddleware, shopController.deleteShop);

// Keep dynamic route last
router.get('/:shopId', shopController.getShopById);

// Admin routes (for rating updates)
router.patch('/:shopId/rating', shopController.updateShopRating);

module.exports = router;
