const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const sessionController = require('../controllers/sessionController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Get my sessions
router.get('/', sessionController.getMySessions);

// Create session (after match accepted)
router.post('/',
  [
    body('matchId').notEmpty().withMessage('Match ID required'),
    body('scheduledAt').isISO8601().withMessage('Valid date required')
  ],
  sessionController.createSession
);

// Get session by ID
router.get('/:id', sessionController.getSession);

// Update session
router.put('/:id', sessionController.updateSession);

// Complete session (with rating)
router.post('/:id/complete',
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating 1-5 required'),
    body('feedback').optional().isString()
  ],
  sessionController.completeSession
);

module.exports = router;
