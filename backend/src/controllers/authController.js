const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { AppError } = require('../middleware/errorHandler');

// Register new user
const register = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      throw new AppError('Email or username already exists', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        xp: 0,
        level: 1,
        coins: 100 // Starting bonus
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        bio: true,
        xp: true,
        level: true,
        coins: true,
        streakDays: true,
        rating: true,
        createdAt: true
      }
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to SkillSwap! 🎉',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login and check streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
    
    let newStreakDays = user.streakDays;
    let bonusCoins = 0;
    let bonusXp = 0;

    if (lastLogin) {
      lastLogin.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day
        newStreakDays = user.streakDays + 1;
        
        // Streak bonuses
        if (newStreakDays >= 30) {
          bonusCoins = 200;
          bonusXp = 50;
        } else if (newStreakDays >= 7) {
          bonusCoins = 50;
          bonusXp = 20;
        } else if (newStreakDays >= 3) {
          bonusCoins = 10;
          bonusXp = 10;
        }
      } else if (diffDays > 1) {
        // Streak broken
        newStreakDays = 1;
      }
      // Same day - no change
    } else {
      newStreakDays = 1;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        streakDays: newStreakDays,
        ...(bonusCoins > 0 && { coins: user.coins + bonusCoins }),
        ...(bonusXp > 0 && { xp: user.xp + bonusXp })
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        bio: true,
        xp: true,
        level: true,
        coins: true,
        streakDays: true,
        rating: true,
        createdAt: true
      }
    });

    // Log XP if bonus earned
    if (bonusXp > 0) {
      await prisma.xpLog.create({
        data: {
          userId: user.id,
          xpAmount: bonusXp,
          source: 'daily_login',
          referenceId: `streak_${newStreakDays}`
        }
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      message: bonusCoins > 0 
        ? `Welcome back! 🔥 ${newStreakDays}-day streak! +${bonusCoins} coins, +${bonusXp} XP!`
        : 'Login successful!',
      data: {
        user: updatedUser,
        accessToken,
        refreshToken,
        streakBonus: bonusCoins > 0 ? { coins: bonusCoins, xp: bonusXp, streak: newStreakDays } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        bio: true,
        xp: true,
        level: true,
        coins: true,
        streakDays: true,
        rating: true,
        totalRatings: true,
        createdAt: true,
        skills: true,
        _count: {
          select: {
            taughtSessions: { where: { status: 'completed' } },
            learnedSessions: { where: { status: 'completed' } },
            achievements: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile by ID
const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
        xp: true,
        level: true,
        rating: true,
        totalRatings: true,
        streakDays: true,
        createdAt: true,
        skills: true,
        achievements: {
          include: { achievement: true }
        },
        _count: {
          select: {
            taughtSessions: { where: { status: 'completed' } },
            learnedSessions: { where: { status: 'completed' } }
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getMe,
  getUserProfile
};
