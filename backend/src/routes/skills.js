const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const skillController = require('../controllers/skillController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Get all skills (with filters)
router.get('/', skillController.getAllSkills);

// Search skills
router.get('/search', skillController.searchSkills);

// Get my skills
router.get('/my', skillController.getMySkills);

// Add skill
router.post('/',
  [
    body('skillName').notEmpty().trim().withMessage('Skill name required'),
    body('skillType').isIn(['teach', 'learn']).withMessage('Must be "teach" or "learn"'),
    body('proficiency').isInt({ min: 1, max: 5 }).withMessage('Proficiency 1-5 required')
  ],
  skillController.addSkill
);

// Update skill
router.put('/:id', skillController.updateSkill);

// Delete skill
router.delete('/:id', skillController.deleteSkill);

module.exports = router;
