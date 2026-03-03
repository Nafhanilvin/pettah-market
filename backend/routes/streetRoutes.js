const express = require('express');
const router = express.Router();
const streetController = require('../controllers/streetController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', streetController.getAllStreets);
router.get('/stats', streetController.getStreetsWithStats);
router.get('/:id', streetController.getStreet);

// Admin routes
router.post('/', protect, adminOnly, streetController.createStreet);
router.put('/:id', protect, adminOnly, streetController.updateStreet);
router.delete('/:id', protect, adminOnly, streetController.deleteStreet);

module.exports = router;
