const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// Find matches for user
const findMatches = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user's skills
    const userSkills = await prisma.userSkill.findMany({
      where: { userId }
    });

    if (userSkills.length === 0) {
      throw new AppError('Add some skills first to find matches! 🎯', 400);
    }

    // Find complementary skills (user wants to learn = others teach, and vice versa)
    const teachSkills = userSkills.filter(s => s.skillType === 'teach');
    const learnSkills = userSkills.filter(s => s.skillType === 'learn');

    // Find users who want to learn what user teaches
    const teacherMatches = await prisma.userSkill.findMany({
      where: {
        userId: { not: userId },
        skillType: 'learn',
        skillName: { in: teachSkills.map(s => s.skillName) }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true,
            rating: true,
            level: true,
            xp: true,
            streakDays: true
          }
        }
      }
    });

    // Find users who teach what user wants to learn
    const learnerMatches = await prisma.userSkill.findMany({
      where: {
        userId: { not: userId },
        skillType: 'teach',
        skillName: { in: learnSkills.map(s => s.skillName) }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true,
            rating: true,
            level: true,
            xp: true,
            streakDays: true
          }
        }
      }
    });

    // Calculate match scores
    const scoredTeacherMatches = teacherMatches.map(match => ({
      ...match,
      matchScore: calculateMatchScore(req.user, match.user),
      matchType: 'teach'
    }));

    const scoredLearnerMatches = learnerMatches.map(match => ({
      ...match,
      matchScore: calculateMatchScore(req.user, match.user),
      matchType: 'learn'
    }));

    // Combine and sort by score
    const allMatches = [...scoredTeacherMatches, ...scoredLearnerMatches]
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);

    res.json({
      success: true,
      data: {
        matches: allMatches,
        summary: {
          potentialTeachers: scoredLearnerMatches.length,
          potentialLearners: scoredTeacherMatches.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Calculate match score (multi-factor algorithm)
function calculateMatchScore(user1, user2) {
  let score = 0;

  // Factor 1: Rating (max 30 points)
  const user1Rating = user1.rating || 0;
  const user2Rating = user2.rating || 0;
  const avgRating = (user1Rating + user2Rating) / 2;
  score += Math.min(30, avgRating * 7.5);

  // Factor 2: Level compatibility (max 20 points)
  const levelDiff = Math.abs((user1.level || 1) - (user2.level || 1));
  score += Math.max(0, 20 - levelDiff * 2);

  // Factor 3: Activity/Streak (max 15 points)
  const streak1 = user1.streakDays || 0;
  const streak2 = user2.streakDays || 0;
  const maxStreak = Math.max(streak1, streak2);
  score += Math.min(15, maxStreak);

  // Factor 4: XP/Experience (max 15 points)
  const xp1 = user1.xp || 0;
  const xp2 = user2.xp || 0;
  const avgXp = (xp1 + xp2) / 2;
  score += Math.min(15, avgXp / 100);

  // Factor 5: Profile completeness bonus (max 10 points)
  if (user1.bio && user2.bio) score += 10;
  else if (user1.bio || user2.bio) score += 5;

  // Factor 6: Avatar bonus (max 10 points)
  if (user1.avatarUrl && user2.avatarUrl) score += 10;
  else if (user1.avatarUrl || user2.avatarUrl) score += 5;

  return Math.min(100, Math.round(score));
}

// Get user's pending matches
const getMyMatches = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const matches = await prisma.skillMatch.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            level: true,
            rating: true
          }
        },
        user2: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            level: true,
            rating: true
          }
        }
      },
      orderBy: { matchedAt: 'desc' }
    });

    res.json({
      success: true,
      data: matches
    });
  } catch (error) {
    next(error);
  }
};

// Accept match and create session
const acceptMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const match = await prisma.skillMatch.findUnique({
      where: { id },
      include: {
        user1: true,
        user2: true
      }
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new AppError('Not authorized', 403);
    }

    // Update match status
    await prisma.skillMatch.update({
      where: { id },
      data: {
        status: 'accepted',
        respondedAt: new Date()
      }
    });

    // Create notification for the other user
    const otherUser = match.user1Id === userId ? match.user2 : match.user1;
    await prisma.notification.create({
      data: {
        userId: otherUser.id,
        type: 'match',
        title: 'Match Accepted! 🎉',
        message: `${req.user.username} accepted the match! Start a session?`
      }
    });

    res.json({
      success: true,
      message: 'Match accepted! You can now schedule a session.',
      data: { matchId: id }
    });
  } catch (error) {
    next(error);
  }
};

// Decline match
const declineMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const match = await prisma.skillMatch.findUnique({
      where: { id }
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new AppError('Not authorized', 403);
    }

    await prisma.skillMatch.update({
      where: { id },
      data: {
        status: 'declined',
        respondedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Match declined'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  findMatches,
  getMyMatches,
  acceptMatch,
  declineMatch
};
