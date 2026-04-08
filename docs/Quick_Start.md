# SkillSwap - Quick Start Guide

## 📂 Where Are the Files?

```
C:\Users\Bhavya\SkillSwap\
│
├── backend/                 # All backend code (Node.js)
│   ├── src/
│   │   ├── controllers/    # API logic
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/     # Auth, security
│   │   ├── socket/        # Real-time chat
│   │   └── index.js       # Server entry
│   └── prisma/
│       ├── schema.prisma  # Database structure
│       └── seed.js        # Demo data
│
└── frontend/               # All frontend code (React)
    └── src/
        ├── pages/          # All pages (Home, Dashboard, Games, etc.)
        ├── context/       # Auth & Socket state
        └── components/     # UI components
```

---

## 🚀 Quick Local Setup (10 minutes)

### 1. Install Software
- **Node.js**: https://nodejs.org (install v18+)
- **PostgreSQL**: https://postgresql.org (install v15+)

### 2. Setup Database
```sql
-- In pgAdmin or psql, run:
CREATE DATABASE skillswap;
```

### 3. Start Backend
```powershell
cd C:\Users\Bhavya\SkillSwap\backend
npm install
npx prisma db push
node prisma/seed.js
npm run dev
```

### 4. Start Frontend
```powershell
cd C:\Users\Bhavya\SkillSwap\frontend
npm install
npm run dev
```

### 5. Open Browser
- Go to: **http://localhost:5173**
- Login: **demo@skillswap.com** / **password123**

---

## 📤 Upload to GitHub (5 minutes)

```powershell
cd C:\Users\Bhavya\SkillSwap

# Initialize git
git init
git remote add origin https://github.com/YOUR_USERNAME/SkillSwap.git

# Commit
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

---

## ☁️ AWS Deployment (30 minutes)

### Step 1: Create RDS Database
1. AWS Console → Search "RDS"
2. Create database → PostgreSQL 15 → Free tier
3. Note the endpoint URL

### Step 2: Launch EC2
1. AWS Console → Search "EC2"
2. Launch instance → Ubuntu 22.04 → t2.micro
3. Download .pem key file

### Step 3: Connect to EC2
```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

### Step 4: Setup on EC2
```bash
# Install tools
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
sudo apt install -y nginx git

# Clone & setup
mkdir -p /var/www/skillswap
cd /var/www/skillswap
git clone https://github.com/YOUR_USERNAME/SkillSwap.git .
cd backend
npm install
```

### Step 5: Configure Backend
```bash
nano .env
# Edit DATABASE_URL with your RDS endpoint
# Save (Ctrl+X, Y, Enter)

npx prisma db push
node prisma/seed.js
pm2 start src/index.js --name skillswap-api
```

### Step 6: Deploy Frontend to Amplify
1. AWS Console → Amplify → Create app
2. Connect GitHub repo
3. Build settings: `npm run build` → `dist`
4. Add env variable: `VITE_API_URL` = `http://YOUR_EC2_IP`
5. Deploy!

---

## 🎯 Key Features to Demo

| Feature | Files to Mention |
|---------|-----------------|
| **Matching Algorithm** | `backend/src/controllers/matchController.js` |
| **Real-time Chat** | `backend/src/socket/index.js` |
| **XP System** | `backend/src/controllers/gameController.js` |
| **JWT Auth** | `backend/src/middleware/auth.js` |
| **Database Schema** | `backend/prisma/schema.prisma` |

---

## 💰 AWS Free Tier Limits

| Service | Limit | Cost |
|---------|-------|------|
| EC2 t2.micro | 750 hrs/month | $0 |
| RDS db.t3.micro | 750 hrs/month + 20GB | $0 |
| Amplify | 5GB storage | $0 |

**Total: $0/month**

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| Database connection failed | Check DATABASE_URL format |
| Frontend shows blank page | Check VITE_API_URL env variable |
| Socket.io not working | Open port 3002 in security group |
| Build fails | Check Node version (need 18+) |

---

**Need help?** Check the full `Deployment_Guide.md` in the docs folder.
