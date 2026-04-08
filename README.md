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
