# SkillSwap - Quick Deploy Guide

## ✅ Project Successfully Uploaded to GitHub!

**Repository:** https://github.com/Bhavya031205/Skill_Exchange

---

## 🚀 Option 1: Deploy Frontend to Vercel (Free)

### Step-by-Step:

1. **Go to Vercel:** https://vercel.com
2. **Sign up:** Use your GitHub account
3. **Import Project:**
   - Click "Add New..." → "Project"
   - Select "Skill_Exchange" from your GitHub repositories
   - Click "Import"

4. **Configure:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Environment Variables (Optional):**
   - Add `VITE_API_URL` = Your backend URL (e.g., `http://localhost:3001` for local testing)

6. **Deploy:**
   - Click "Deploy"
   - Wait 1-2 minutes

7. **Your Frontend URL:** `https://your-project-name.vercel.app`

---

## ☁️ Option 2: Deploy Full Stack to AWS (Free Tier)

### Prerequisites:
- AWS Account (free tier)
- GitHub repository linked

### Services Used (All Free):
| Service | Limits | Cost |
|---------|--------|------|
| EC2 t2.micro | 750 hrs/month | $0 |
| RDS db.t3.micro | 750 hrs + 20GB | $0 |
| Amplify | 5GB storage | $0 |

---

## 📋 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/Bhavya031205/Skill_Exchange.git
cd Skill_Exchange

# Backend Setup
cd backend
npm install
# Edit .env with your PostgreSQL URL
npx prisma generate
npx prisma db push
npm run dev

# Frontend Setup (new terminal)
cd frontend
npm install
npm run dev
```

Access at: http://localhost:5173

---

## 🎯 Project Structure

```
SkillSwap/
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, rate limiting
│   │   └── socket/        # Real-time chat
│   └── prisma/            # Database schema
├── frontend/          # React + Vite
│   └── src/
│       ├── pages/         # 11 pages
│       ├── components/    # UI components
│       └── context/       # Auth & Socket state
└── docs/              # Deployment guides
```

---

## 🎮 Features Implemented

- ✅ User Authentication (JWT)
- ✅ Skill Exchange (Teach/Learn)
- ✅ Smart Matching Algorithm
- ✅ Session Management
- ✅ Real-time Chat (Socket.io)
- ✅ Gamification (XP, Levels, Coins)
- ✅ Daily Spin Wheel
- ✅ Speed Match Mini-game
- ✅ Leaderboards
- ✅ Shop & Inventory
- ✅ Achievements

---

## 🎓 For Academic Defense

### Key Talking Points:

1. **Architecture:** Hybrid frontend (Amplify/Vercel) + Node.js backend + PostgreSQL

2. **Matching Algorithm:** Multi-factor scoring (skills, availability, ratings, response time)

3. **Real-time:** Socket.io for chat with typing indicators and read receipts

4. **Security:** JWT + bcrypt + rate limiting + input validation

5. **Gamification:** Complete XP/coin economy with shop and achievements

---

**Project is live on GitHub! Ready for deployment.** 🎉
