const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { authMiddleware } = require('../middleware/auth');
const { gameLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(authMiddleware);

// Spin wheel (once per day)
router.post('/spin', gameLimiter, gameController.spinWheel);

// Speed Match game
router.post('/speed-match/start', gameController.speedMatchStart);
router.post('/speed-match/submit', gameController.speedMatchSubmit);

// Get user stats
router.get('/stats', gameController.getStats);

// Leaderboard
router.get('/leaderboard', gameController.getLeaderboard);

module.exports = router;
