const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// Spin wheel
const spinWheel = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Check if user spun today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastSpin = await prisma.spinRecord.findFirst({
      where: {
        userId,
        spunAt: { gte: today }
      }
    });

    if (lastSpin) {
      throw new AppError('You already spun today! Come back tomorrow 🎡', 400);
    }

    // Spin outcomes with weights
    const outcomes = [
      { item: 'coins', amount: 5, weight: 30 },
      { item: 'coins', amount: 10, weight: 25 },
      { item: 'coins', amount: 20, weight: 15 },
      { item: 'coins', amount: 30, weight: 8 },
      { item: 'coins', amount: 50, weight: 4 },
      { item: 'xp_boost', amount: 1, weight: 10 },
      { item: 'streak_freeze', amount: 1, weight: 5 },
      { item: 'nothing', amount: 0, weight: 3 }
    ];

    // Weighted random selection
    const totalWeight = outcomes.reduce((sum, o) => sum + o.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedOutcome = outcomes[0];

    for (const outcome of outcomes) {
      random -= outcome.weight;
      if (random <= 0) {
        selectedOutcome = outcome;
        break;
      }
    }

    // Apply reward
    let message = '';
    let xpBoost = false;
    let streakFreeze = false;

    if (selectedOutcome.item === 'coins') {
      await prisma.user.update({
        where: { id: userId },
        data: { coins: { increment: selectedOutcome.amount } }
      });
      message = `You won ${selectedOutcome.amount} coins! 🪙`;
    } else if (selectedOutcome.item === 'xp_boost') {
      // Mark XP boost active (could add a separate table for active boosts)
      xpBoost = true;
      message = 'XP Boost activated for your next session! 🚀';
    } else if (selectedOutcome.item === 'streak_freeze') {
      streakFreeze = true;
      message = 'Streak Freeze earned! ❄️';
    } else {
      message = 'Better luck next time! 🍀';
    }

    // Record spin
    await prisma.spinRecord.create({
      data: {
        userId,
        wonItem: selectedOutcome.item,
        wonAmount: selectedOutcome.amount
      }
    });

    res.json({
      success: true,
      message,
      data: {
        outcome: selectedOutcome,
        xpBoost,
        streakFreeze,
        newCoins: selectedOutcome.item === 'coins' ? user.coins + selectedOutcome.amount : user.coins
      }
    });
  } catch (error) {
    next(error);
  }
};

// Speed Match Game
const speedMatchStart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user's skills
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { user: { select: { id: true, username: true } } }
    });

    if (userSkills.length < 2) {
      throw new AppError('Add at least 2 skills to play Speed Match! 🎮', 400);
    }

    // Generate a match challenge (simulated)
    const challenge = {
      roundId: `round_${Date.now()}`,
      skills: userSkills.slice(0, 6).map(s => ({
        id: s.id,
        name: s.skillName,
        type: s.skillType,
        opponent: s.user.username
      })),
      timeLimit: 30 // seconds
    };

    res.json({
      success: true,
      data: challenge
    });
  } catch (error) {
    next(error);
  }
};

const speedMatchSubmit = async (req, res, next) => {
  try {
    const { roundId, matches, timeTaken } = req.body;
    const userId = req.user.id;

    // Calculate score based on correct matches and time
    let correctMatches = 0;
    // Simulate match validation (in real app, verify against actual matches)
    matches.forEach(match => {
      if (match.teachSkill && match.learnSkill) {
        correctMatches++;
      }
    });

    const baseXp = correctMatches * 15;
    const timeBonus = timeTaken < 15 ? 20 : (timeTaken < 25 ? 10 : 0);
    const totalXp = baseXp + timeBonus;
    const coinsWon = correctMatches * 10;

    // Award XP and coins
    if (totalXp > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: totalXp },
          coins: { increment: coinsWon }
        }
      });

      await prisma.xpLog.create({
        data: {
          userId,
          xpAmount: totalXp,
          source: 'speed_match',
          referenceId: roundId
        }
      });
    }

    res.json({
      success: true,
      message: correctMatches > 0 
        ? `Great job! ${correctMatches} matches! +${totalXp} XP, +${coinsWon} coins! 🏆`
        : 'No matches this time. Try again!',
      data: {
        correctMatches,
        xpEarned: totalXp,
        coinsEarned: coinsWon
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user stats
const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [user, sessionsCompleted, achievements, xpLogs] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          xp: true,
          level: true,
          coins: true,
          streakDays: true
        }
      }),
      prisma.session.count({
        where: {
          OR: [
            { teacherId: userId, status: 'completed' },
            { learnerId: userId, status: 'completed' }
          ]
        }
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true }
      }),
      prisma.xpLog.groupBy({
        by: ['source'],
        where: { userId },
        _sum: { xpAmount: true },
        _count: true
      })
    ]);

    // Calculate level progress
    const levels = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000];
    const currentLevelIndex = levels.findIndex(l => l > user.xp) - 1;
    const currentLevelXp = levels[Math.max(0, currentLevelIndex)];
    const nextLevelXp = levels[Math.min(levels.length - 1, currentLevelIndex + 1)];
    const progress = ((user.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

    res.json({
      success: true,
      data: {
        xp: user.xp,
        level: user.level,
        coins: user.coins,
        streakDays: user.streakDays,
        sessionsCompleted,
        achievements: achievements.length,
        levelProgress: Math.min(100, Math.max(0, progress)),
        nextLevelXp,
        xpToNextLevel: nextLevelXp - user.xp,
        xpSources: xpLogs.map(log => ({
          source: log.source,
          totalXp: log._sum.xpAmount || 0,
          count: log._count
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    const { type = 'xp', page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let orderBy;
    switch (type) {
      case 'coins':
        orderBy = { coins: 'desc' };
        break;
      case 'streak':
        orderBy = { streakDays: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      default:
        orderBy = { xp: 'desc' };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          level: true,
          xp: true,
          coins: true,
          streakDays: true,
          rating: true,
          _count: {
            select: {
              taughtSessions: { where: { status: 'completed' } }
            }
          }
        },
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count()
    ]);

    // Add rank
    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      ...user,
      totalSessions: user._count.taughtSessions
    }));

    res.json({
      success: true,
      data: {
        leaderboard,
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

module.exports = {
  spinWheel,
  speedMatchStart,
  speedMatchSubmit,
  getStats,
  getLeaderboard
};
