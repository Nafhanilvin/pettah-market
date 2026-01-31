const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:categoryId', categoryController.getCategoryById);
router.get('/slug/:slug', categoryController.getCategoryBySlug);

// Admin routes (future: add admin middleware)
router.post('/', categoryController.createCategory);
router.put('/:categoryId', categoryController.updateCategory);
router.delete('/:categoryId', categoryController.deleteCategory);

module.exports = router;
