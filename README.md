# SkillSwap - Gamified Peer-to-Peer Skill Exchange Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue" alt="React">
  <img src="https://img.shields.io/badge/Node.js-Express-green" alt="Node.js">
  <img src="https://img.shields.io/badge/PostgreSQL-RDS-orange" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Socket.io-4.7-purple" alt="Socket.io">
  <img src="https://img.shields.io/badge/AWS-Free%20Tier-100%25-brightgreen" alt="AWS Free Tier">
</p>

## 🎮 Overview

**SkillSwap** is a gamified peer-to-peer skill exchange platform designed for students. Users can teach skills they know and learn skills they want to acquire through matched 1-on-1 sessions. The platform features gamification elements like XP, levels, coins, achievements, and mini-games to keep engagement high.

## ✨ Features

### Core Features
- **User Authentication** - JWT-based auth with refresh tokens
- **Skill Profiles** - Add skills you can teach and want to learn
- **Smart Matching** - Multi-factor algorithm matching based on skills, ratings, and availability
- **Session Management** - Schedule and manage skill exchange sessions
- **Real-time Chat** - WebSocket-powered instant messaging
- **Rating System** - Rate teachers after completed sessions

### Gamification Elements
- **XP & Level System** - Earn XP for activities, level up from 1-10
- **Skill Coins** - Currency earned through activities, spent in shop
- **Daily Streaks** - Login streaks with bonus rewards
- **Achievement Badges** - Unlock badges for milestones
- **Leaderboards** - Compete across XP, coins, streaks, and ratings
- **Daily Spin Wheel** - Win coins and boosts daily
- **Speed Match Game** - Mini-game for bonus rewards

### Technical Highlights
- **Real-time Updates** - Socket.io for chat and notifications
- **RESTful API** - Well-structured Express.js backend
- **Prisma ORM** - Type-safe database access
- **Responsive Design** - Mobile-friendly Tailwind CSS UI
- **Framer Motion** - Smooth animations and transitions

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     AWS FREE TIER ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │              AWS AMPLIFY (Frontend)                    │  │
│   │   • React App Hosting (Free)                           │  │
│   │   • Global CDN Distribution                           │  │
│   └────────────────────────┬────────────────────────────────┘  │
│                            │ HTTPS                              │
│                            ▼                                    │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │           AWS EC2 t2.micro (Backend)                    │  │
│   │   • Express.js REST API (Port 3001)                   │  │
│   │   • Socket.io WebSocket (Port 3002)                   │  │
│   └────────────────────────┬────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │           AWS RDS t2.micro (Database)                   │  │
│   │   • PostgreSQL 15 (Free Tier)                          │  │
│   │   • 20GB Storage                                      │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│   💰 TOTAL MONTHLY COST: $0                                     │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
SkillSwap/
├── backend/                    # Node.js + Express Backend
│   ├── src/
│   │   ├── config/           # DB & JWT configuration
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/        # Auth, rate limiting, errors
│   │   ├── models/           # Prisma schema
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── socket/           # Socket.io setup
│   │   └── index.js          # Express entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.js           # Seed data
│   └── package.json
│
├── frontend/                  # React + Vite Frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── context/          # React Context
│   │   ├── pages/           # Page components
│   │   ├── services/         # API service
│   │   └── ...
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+ (or local installation)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd SkillSwap
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env  # Edit with your database URL
npx prisma generate
npx prisma db push
npm run db:seed  # Optional: Add demo data
npm run dev
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
npm run dev
```

4. **Access the app**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

### Demo Credentials
```
Email: demo@skillswap.com
Password: password123
```

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:

| Table | Description |
|-------|-------------|
| `users` | User accounts with XP, coins, streaks |
| `user_skills` | Skills users can teach or want to learn |
| `sessions` | Scheduled skill exchange sessions |
| `chat_messages` | Real-time chat messages |
| `skill_matches` | Match proposals between users |
| `achievements` | Available achievement badges |
| `user_achievements` | Unlocked achievements |
| `shop_items` | Purchasable items |
| `user_inventory` | Purchased items |
| `xp_logs` | XP transaction history |
| `notifications` | User notifications |

## 🎯 Defense-Ready Topics

### 1. Architecture Decisions
- "Hybrid approach combining Amplify for static hosting and EC2 for real-time WebSocket capabilities"
- "RDS PostgreSQL provides ACID compliance crucial for session transactions"

### 2. Matching Algorithm
- Multi-factor scoring: Skills (40%) + Availability (25%) + Rating (15%) + Response Time (10%) + Level (10%)
- Weighted scoring system for optimal user pairing

### 3. Real-time Systems
- Socket.io rooms for efficient session-specific messaging
- Event-based architecture for notifications and chat

### 4. Security Implementation
- JWT with refresh token rotation
- bcrypt password hashing (cost factor 12)
- Rate limiting on sensitive endpoints
- Input validation with express-validator

### 5. Database Design
- Indexed columns for query optimization
- JSON columns for flexible availability storage
- Proper foreign key relationships and cascade deletes

### 6. Performance Optimizations
- React Query for API caching
- WebSocket heartbeat for connection maintenance
- Lazy loading for code splitting

## 🌐 AWS Deployment

### Free Tier Services Used

| Service | Specification | Monthly Cost |
|---------|--------------|-------------|
| EC2 t2.micro | 750 hrs/month | $0 |
| RDS db.t3.micro | 750 hrs/month | $0 |
| Amplify | Static hosting | $0 |

### Deployment Steps

1. **Setup EC2**
   - Launch t2.micro with Ubuntu 22.04
   - Configure security groups (ports 3001, 3002, 22)
   - SSH and install Node.js, PM2

2. **Setup RDS**
   - Create PostgreSQL db.t3.micro
   - Configure public accessibility
   - Update DATABASE_URL in backend .env

3. **Deploy Frontend**
   - Connect GitHub repo to Amplify
   - Configure build settings
   - Set environment variables

4. **Deploy Backend**
   - Clone repository to EC2
   - Install dependencies
   - Run with PM2 for process management
   - Configure nginx reverse proxy

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Skills
- `GET /api/skills` - List all skills
- `POST /api/skills` - Add a skill
- `DELETE /api/skills/:id` - Remove a skill

### Sessions
- `GET /api/sessions` - List user sessions
- `POST /api/sessions` - Create session
- `POST /api/sessions/:id/complete` - Complete with rating

### Matching
- `POST /api/matches/find` - Find potential matches
- `POST /api/matches/:id/accept` - Accept match

### Games
- `POST /api/games/spin` - Daily spin
- `POST /api/games/speed-match/start` - Start mini-game
- `GET /api/games/leaderboard` - Get rankings

### Shop
- `GET /api/shop/items` - List shop items
- `POST /api/shop/purchase` - Purchase item

## 🎨 Screenshots

The application features:
- Modern dark theme with gradient accents
- Animated XP bars and level progress
- Interactive spin wheel with physics
- Real-time chat interface
- Responsive design for all devices

## 📄 License

This project is created for educational purposes.

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

**Built with ❤️ for students who want to learn and teach together.**
