const { Server } = require('socket.io');
const { verifyAccessToken } = require('../config/jwt');
const prisma = require('../config/database');

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          level: true
        }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.username}`);

    // Join user's personal room for notifications
    socket.join(`user:${socket.user.id}`);

    // Join session chat room
    socket.on('join_session', (sessionId) => {
      socket.join(`session:${sessionId}`);
      console.log(`${socket.user.username} joined session: ${sessionId}`);
    });

    // Leave session chat room
    socket.on('leave_session', (sessionId) => {
      socket.leave(`session:${sessionId}`);
    });

    // Send message in session
    socket.on('send_message', async ({ sessionId, content, messageType = 'text' }) => {
      try {
        // Save message to database
        const message = await prisma.chatMessage.create({
          data: {
            sessionId,
            senderId: socket.user.id,
            content,
            messageType
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                level: true
              }
            }
          }
        });

        // Broadcast to session room
        io.to(`session:${sessionId}`).emit('new_message', message);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing_start', ({ sessionId }) => {
      socket.to(`session:${sessionId}`).emit('user_typing', {
        userId: socket.user.id,
        username: socket.user.username
      });
    });

    socket.on('typing_stop', ({ sessionId }) => {
      socket.to(`session:${sessionId}`).emit('user_stop_typing', {
        userId: socket.user.id
      });
    });

    // Mark messages as read
    socket.on('mark_read', async ({ sessionId }) => {
      try {
        await prisma.chatMessage.updateMany({
          where: {
            sessionId,
            senderId: { not: socket.user.id },
            isRead: false
          },
          data: { isRead: true }
        });

        socket.to(`session:${sessionId}`).emit('messages_read', {
          userId: socket.user.id
        });
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }
    });

    // Real-time XP notification
    socket.on('xp_earned', ({ userId, amount }) => {
      io.to(`user:${userId}`).emit('xp_update', {
        amount,
        message: `+${amount} XP earned!`
      });
    });

    // Real-time achievement notification
    socket.on('achievement_unlocked', async ({ userId, achievement }) => {
      io.to(`user:${userId}`).emit('notification', {
        type: 'achievement',
        title: 'Achievement Unlocked! 🎉',
        message: `${achievement.icon} ${achievement.name}`,
        data: achievement
      });
    });

    // Match found notification
    socket.on('match_found', ({ matchedUserId, matchData }) => {
      io.to(`user:${matchedUserId}`).emit('notification', {
        type: 'match',
        title: 'New Match Found! 🎯',
        message: `You matched with ${matchData.username}!`,
        data: matchData
      });
    });

    // Session update notification
    socket.on('session_update', ({ userId, sessionData }) => {
      io.to(`user:${userId}`).emit('notification', {
        type: 'session',
        title: 'Session Update',
        message: sessionData.message,
        data: sessionData
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.username}`);
    });
  });

  return io;
}

// Helper function to send notification to specific user
function sendNotification(userId, notification) {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
}

// Helper function to send XP update
function sendXpUpdate(userId, amount) {
  if (io) {
    io.to(`user:${userId}`).emit('xp_update', { amount });
  }
}

module.exports = { initializeSocket, sendNotification, sendXpUpdate };
