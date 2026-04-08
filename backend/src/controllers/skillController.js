const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// Get all skills (for browsing/explore)
const getAllSkills = async (req, res, next) => {
  try {
    const { type, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (type && ['teach', 'learn'].includes(type)) {
      where.skillType = type;
    }

    if (search) {
      where.skillName = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const [skills, total] = await Promise.all([
      prisma.userSkill.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              rating: true,
              level: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userSkill.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        skills,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's skills
const getMySkills = async (req, res, next) => {
  try {
    const skills = await prisma.userSkill.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: skills
    });
  } catch (error) {
    next(error);
  }
};

// Add skill
const addSkill = async (req, res, next) => {
  try {
    const { skillName, skillType, proficiency, description, availability } = req.body;

    if (!['teach', 'learn'].includes(skillType)) {
      throw new AppError('Invalid skill type. Must be "teach" or "learn"', 400);
    }

    if (proficiency < 1 || proficiency > 5) {
      throw new AppError('Proficiency must be between 1 and 5', 400);
    }

    const skill = await prisma.userSkill.create({
      data: {
        userId: req.user.id,
        skillName,
        skillType,
        proficiency: parseInt(proficiency),
        description,
        availability: availability ? JSON.parse(availability) : null
      }
    });

    res.status(201).json({
      success: true,
      message: `${skillType === 'teach' ? 'Skill to teach' : 'Skill to learn'} added!`,
      data: skill
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return next(new AppError('You already have this skill listed', 400));
    }
    next(error);
  }
};

// Update skill
const updateSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { skillName, proficiency, description, availability } = req.body;

    const existingSkill = await prisma.userSkill.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existingSkill) {
      throw new AppError('Skill not found', 404);
    }

    const skill = await prisma.userSkill.update({
      where: { id },
      data: {
        ...(skillName && { skillName }),
        ...(proficiency && { proficiency: parseInt(proficiency) }),
        ...(description !== undefined && { description }),
        ...(availability && { availability: JSON.parse(availability) })
      }
    });

    res.json({
      success: true,
      message: 'Skill updated!',
      data: skill
    });
  } catch (error) {
    next(error);
  }
};

// Delete skill
const deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingSkill = await prisma.userSkill.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existingSkill) {
      throw new AppError('Skill not found', 404);
    }

    await prisma.userSkill.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Skill removed'
    });
  } catch (error) {
    next(error);
  }
};

// Search skills with user info
const searchSkills = async (req, res, next) => {
  try {
    const { q, type } = req.query;

    if (!q) {
      throw new AppError('Search query required', 400);
    }

    const where = {
      skillName: {
        contains: q,
        mode: 'insensitive'
      }
    };

    if (type && ['teach', 'learn'].includes(type)) {
      where.skillType = type;
    }

    const skills = await prisma.userSkill.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            rating: true,
            level: true,
            xp: true
          }
        }
      },
      take: 50,
      orderBy: { user: { rating: 'desc' } }
    });

    // Group by user
    const usersWithSkills = {};
    skills.forEach(skill => {
      if (!usersWithSkills[skill.userId]) {
        usersWithSkills[skill.userId] = {
          user: skill.user,
          skills: []
        };
      }
      usersWithSkills[skill.userId].skills.push(skill);
    });

    res.json({
      success: true,
      data: Object.values(usersWithSkills)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSkills,
  getMySkills,
  addSkill,
  updateSkill,
  deleteSkill,
  searchSkills
};
