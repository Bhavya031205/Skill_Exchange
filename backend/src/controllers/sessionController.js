const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// Get all sessions for user
const getMySessions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const userId = req.user.id;

    const where = {
      OR: [
        { teacherId: userId },
        { learnerId: userId }
      ]
    };

    if (status) {
      where.status = status;
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            rating: true,
            level: true
          }
        },
        learner: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            rating: true,
            level: true
          }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

// Create session (after match accepted)
const createSession = async (req, res, next) => {
  try {
    const { matchId, scheduledAt, duration, skillName } = req.body;
    const userId = req.user.id;

    // Get match info
    const match = await prisma.skillMatch.findUnique({
      where: { id: matchId },
      include: {
        user1: true,
        user2: true
      }
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // Determine teacher and learner
    const teacherId = match.user1Id === userId ? match.user2Id : match.user1Id;
    const learnerId = userId;

    const session = await prisma.session.create({
      data: {
        teacherId,
        learnerId,
        skillName: skillName || match.teacherSkill?.skillName,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 60
      },
      include: {
        teacher: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        },
        learner: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    // Update match status
    await prisma.skillMatch.update({
      where: { id: matchId },
      data: { status: 'accepted' }
    });

    // Create notification for the other user
    const otherUser = match.user1Id === userId ? match.user2 : match.user1;
    await prisma.notification.create({
      data: {
        userId: otherUser.id,
        type: 'session',
        title: 'New Session Scheduled! 🎉',
        message: `A session has been scheduled with ${req.user.username}`
      }
    });

    res.status(201).json({
      success: true,
      message: 'Session created successfully!',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// Get session by ID
const getSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            rating: true,
            level: true
          }
        },
        learner: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            rating: true,
            level: true
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50
        }
      }
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Check authorization
    if (session.teacherId !== userId && session.learnerId !== userId) {
      throw new AppError('Not authorized to view this session', 403);
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// Update session status
const updateSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, scheduledAt, meetingLink } = req.body;
    const userId = req.user.id;

    const session = await prisma.session.findUnique({
      where: { id }
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Only teacher or learner can update
    if (session.teacherId !== userId && session.learnerId !== userId) {
      throw new AppError('Not authorized', 403);
    }

    const updated = await prisma.session.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(meetingLink && { meetingLink })
      },
      include: {
        teacher: { select: { id: true, username: true } },
        learner: { select: { id: true, username: true } }
      }
    });

    res.json({
      success: true,
      message: 'Session updated',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// Complete session and award XP/coins
const completeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.user.id;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        teacher: true,
        learner: true
      }
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.status !== 'confirmed') {
      throw new AppError('Session must be confirmed before completing', 400);
    }

    // Update session with rating
    const isTeacher = session.teacherId === userId;
    
    if (isTeacher) {
      await prisma.session.update({
        where: { id },
        data: {
          status: 'completed',
          teacherRating: rating,
          learnerFeedback: feedback
        }
      });

      // Award XP to teacher
      await prisma.user.update({
        where: { id: session.teacherId },
        data: {
          xp: { increment: 50 },
          coins: { increment: 25 }
        }
      });

      // Log XP
      await prisma.xpLog.create({
        data: {
          userId: session.teacherId,
          xpAmount: 50,
          source: 'session_complete',
          referenceId: id
        }
      });

      // Award XP to learner
      await prisma.user.update({
        where: { id: session.learnerId },
        data: {
          xp: { increment: 30 },
          coins: { increment: 15 }
        }
      });

      await prisma.xpLog.create({
        data: {
          userId: session.learnerId,
          xpAmount: 30,
          source: 'session_complete',
          referenceId: id
        }
      });
    }

    // Update learner rating for teacher
    const newRating = rating;
    const teacher = session.teacher;
    const newTotalRatings = teacher.totalRatings + 1;
    const updatedRating = ((teacher.rating * teacher.totalRatings) + newRating) / newTotalRatings;

    await prisma.user.update({
      where: { id: session.teacherId },
      data: {
        totalRatings: newTotalRatings,
        rating: updatedRating
      }
    });

    // Check for achievements
    const completedSessions = await prisma.session.count({
      where: {
        OR: [
          { teacherId: session.teacherId, status: 'completed' },
          { learnerId: session.teacherId, status: 'completed' }
        ]
      }
    });

    const achievements = await prisma.achievement.findMany();
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.teacherId }
    });
    const unlockedNames = userAchievements.map(ua => ua.achievementId);

    for (const achievement of achievements) {
      if (unlockedNames.includes(achievement.id)) continue;

      let shouldUnlock = false;

      if (achievement.name === 'First Steps' && completedSessions >= 1) shouldUnlock = true;
      if (achievement.name === 'Quick Learner' && completedSessions >= 5) shouldUnlock = true;
      if (achievement.name === 'Skill Master' && completedSessions >= 25) shouldUnlock = true;

      if (shouldUnlock) {
        await prisma.userAchievement.create({
          data: {
            userId: session.teacherId,
            achievementId: achievement.id
          }
        });

        await prisma.user.update({
          where: { id: session.teacherId },
          data: {
            xp: { increment: achievement.xpReward },
            coins: { increment: achievement.coinReward }
          }
        });

        await prisma.notification.create({
          data: {
            userId: session.teacherId,
            type: 'achievement',
            title: 'Achievement Unlocked! 🎉',
            message: `${achievement.icon} ${achievement.name}: ${achievement.description}`
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Session completed! XP and coins earned! 💰'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMySessions,
  createSession,
  getSession,
  updateSession,
  completeSession
};
