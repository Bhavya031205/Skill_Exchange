const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Find matches
router.post('/find', matchController.findMatches);

// Get my matches
router.get('/', matchController.getMyMatches);

// Accept match
router.post('/:id/accept', matchController.acceptMatch);

// Decline match
router.post('/:id/decline', matchController.declineMatch);

module.exports = router;
