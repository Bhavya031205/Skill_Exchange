require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { initializeSocket } = require('./socket');

// Import routes
const authRoutes = require('./routes/auth');
const skillRoutes = require('./routes/skills');
const sessionRoutes = require('./routes/sessions');
const matchRoutes = require('./routes/matches');
const gameRoutes = require('./routes/games');
const shopRoutes = require('./routes/shop');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for development
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SkillSwap API is running! 🚀',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   🎮 SkillSwap Backend Server 🎮                    ║
║                                                      ║
║   API Server:  http://localhost:${PORT}                 ║
║   Socket.io:   ws://localhost:${PORT}                  ║
║   Health:      http://localhost:${PORT}/health          ║
║                                                      ║
║   Environment: ${process.env.NODE_ENV || 'development'}                        ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
