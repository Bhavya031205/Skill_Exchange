const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create achievements
  const achievements = [
    {
      name: 'First Steps',
      description: 'Complete your first session',
      icon: '🎯',
      xpReward: 50,
      coinReward: 25,
      criteria: { type: 'sessions_completed', count: 1 }
    },
    {
      name: 'Quick Learner',
      description: 'Complete 5 sessions',
      icon: '📚',
      xpReward: 100,
      coinReward: 50,
      criteria: { type: 'sessions_completed', count: 5 }
    },
    {
      name: 'Skill Master',
      description: 'Complete 25 sessions',
      icon: '🏆',
      xpReward: 300,
      coinReward: 150,
      criteria: { type: 'sessions_completed', count: 25 }
    },
    {
      name: 'Speed Demon',
      description: 'Win 10 Speed Match games',
      icon: '⚡',
      xpReward: 100,
      coinReward: 75,
      criteria: { type: 'games_won', count: 10 }
    },
    {
      name: 'Streak Starter',
      description: 'Maintain a 7-day login streak',
      icon: '🔥',
      xpReward: 150,
      coinReward: 100,
      criteria: { type: 'streak_days', count: 7 }
    },
    {
      name: 'Legend',
      description: 'Reach Level 10',
      icon: '👑',
      xpReward: 500,
      coinReward: 300,
      criteria: { type: 'level_reached', level: 10 }
    },
    {
      name: 'Helpful Hand',
      description: 'Teach 10 sessions',
      icon: '🤝',
      xpReward: 200,
      coinReward: 100,
      criteria: { type: 'sessions_taught', count: 10 }
    },
    {
      name: 'Rising Star',
      description: 'Get 5 five-star ratings',
      icon: '⭐',
      xpReward: 100,
      coinReward: 50,
      criteria: { type: 'five_star_ratings', count: 5 }
    }
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement
    });
  }
  console.log('✅ Achievements created');

  // Create shop items
  const shopItems = [
    {
      name: 'Cyber Punk Avatar',
      description: 'Futuristic neon-styled avatar frame',
      price: 100,
      type: 'avatar',
      icon: '🤖'
    },
    {
      name: 'Rainbow Glow Theme',
      description: 'Animated rainbow background for your profile',
      price: 200,
      type: 'theme',
      icon: '🌈'
    },
    {
      name: 'Golden Badge',
      description: 'Show off your achievements with a golden border',
      price: 150,
      type: 'badge',
      icon: '🥇'
    },
    {
      name: 'XP Boost (2x for 1 hour)',
      description: 'Double XP earned for 1 hour',
      price: 50,
      type: 'boost',
      icon: '🚀'
    },
    {
      name: 'Streak Freeze',
      description: 'Protect your streak for one missed day',
      price: 75,
      type: 'boost',
      icon: '❄️'
    },
    {
      name: 'Ninja Avatar',
      description: 'Stealthy ninja-themed avatar frame',
      price: 120,
      type: 'avatar',
      icon: '🥷'
    },
    {
      name: 'Space Theme',
      description: 'Explore the cosmos with this space background',
      price: 180,
      type: 'theme',
      icon: '🚀'
    },
    {
      name: 'Priority Match',
      description: 'Jump to the front of the matching queue',
      price: 100,
      type: 'boost',
      icon: '⚡'
    }
  ];

  for (const item of shopItems) {
    await prisma.shopItem.upsert({
      where: { name: item.name },
      update: {},
      create: item
    });
  }
  console.log('✅ Shop items created');

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const demoUsers = [
    {
      email: 'alex@example.com',
      username: 'Alex_Coder',
      passwordHash: hashedPassword,
      bio: 'Full-stack developer passionate about React and Node.js',
      xp: 850,
      level: 5,
      coins: 450
    },
    {
      email: 'sarah@example.com',
      username: 'Sarah_Designs',
      passwordHash: hashedPassword,
      bio: 'UI/UX Designer with 5 years experience in Figma and Adobe XD',
      xp: 1200,
      level: 6,
      coins: 680
    },
    {
      email: 'mike@example.com',
      username: 'Mike_Guitar',
      passwordHash: hashedPassword,
      bio: 'Professional guitarist teaching rock and blues',
      xp: 450,
      level: 3,
      coins: 280
    },
    {
      email: 'demo@skillswap.com',
      username: 'DemoUser',
      passwordHash: hashedPassword,
      bio: 'Demo account - feel free to explore!',
      xp: 100,
      level: 2,
      coins: 150
    }
  ];

  for (const user of demoUsers) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    });

    // Add sample skills for demo users
    if (user.email === 'alex@example.com') {
      await prisma.userSkill.upsert({
        where: { userId_skillName_skillType: { userId: createdUser.id, skillName: 'React.js', skillType: 'teach' }},
        update: {},
        create: { userId: createdUser.id, skillName: 'React.js', skillType: 'teach', proficiency: 4 }
      });
      await prisma.userSkill.upsert({
        where: { userId_skillName_skillType: { userId: createdUser.id, skillName: 'Python', skillType: 'learn' }},
        update: {},
        create: { userId: createdUser.id, skillName: 'Python', skillType: 'learn', proficiency: 2 }
      });
    }

    if (user.email === 'sarah@example.com') {
      await prisma.userSkill.upsert({
        where: { userId_skillName_skillType: { userId: createdUser.id, skillName: 'UI/UX Design', skillType: 'teach' }},
        update: {},
        create: { userId: createdUser.id, skillName: 'UI/UX Design', skillType: 'teach', proficiency: 5 }
      });
      await prisma.userSkill.upsert({
        where: { userId_skillName_skillType: { userId: createdUser.id, skillName: 'HTML/CSS', skillType: 'learn' }},
        update: {},
        create: { userId: createdUser.id, skillName: 'HTML/CSS', skillType: 'learn', proficiency: 3 }
      });
    }

    if (user.email === 'mike@example.com') {
      await prisma.userSkill.upsert({
        where: { userId_skillName_skillType: { userId: createdUser.id, skillName: 'Guitar', skillType: 'teach' }},
        update: {},
        create: { userId: createdUser.id, skillName: 'Guitar', skillType: 'teach', proficiency: 4 }
      });
      await prisma.userSkill.upsert({
        where: { userId_skillName_skillType: { userId: createdUser.id, skillName: 'Music Theory', skillType: 'learn' }},
        update: {},
        create: { userId: createdUser.id, skillName: 'Music Theory', skillType: 'learn', proficiency: 2 }
      });
    }
  }
  console.log('✅ Demo users created');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
