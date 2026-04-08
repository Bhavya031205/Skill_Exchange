const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Get shop items
router.get('/items', shopController.getShopItems);

// Purchase item
router.post('/purchase', shopController.purchaseItem);

// Get my inventory
router.get('/inventory', shopController.getInventory);

module.exports = router;
