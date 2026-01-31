const express = require('express');
const productController = require('../controllers/productController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productController.searchProducts);
router.get('/:productId', productController.getProductById);
router.get('/shop/:shopId', productController.getProductsByShop);

// Protected routes (shop owner)
router.post('/', authMiddleware, productController.createProduct);
router.get('/user/my-products', authMiddleware, productController.getMyProducts);
router.put('/:productId', authMiddleware, productController.updateProduct);
router.delete('/:productId', authMiddleware, productController.deleteProduct);

// Admin routes (for rating updates)
router.patch('/:productId/rating', productController.updateProductRating);

module.exports = router;
