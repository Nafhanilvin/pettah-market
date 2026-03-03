const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect, shopOwnerOnly } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:categoryId', categoryController.getCategoryById);
router.get('/slug/:slug', categoryController.getCategoryBySlug);

// Shop owner/admin routes
router.post('/', protect, shopOwnerOnly, categoryController.createCategory);
router.put('/:categoryId', protect, shopOwnerOnly, categoryController.updateCategory);
router.delete('/:categoryId', protect, shopOwnerOnly, categoryController.deleteCategory);

module.exports = router;
