# SkillSwap - Complete Deployment & Setup Guide

## 📁 Project File Locations

```
C:\Users\Bhavya\SkillSwap\
│
├── backend/                          # Node.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js        # PostgreSQL connection
│   │   │   └── jwt.js            # JWT configuration
│   │   ├── controllers/
│   │   │   ├── authController.js  # Authentication logic
│   │   │   ├── skillController.js # Skills CRUD
│   │   │   ├── sessionController.js # Sessions management
│   │   │   ├── matchController.js # Matching algorithm
│   │   │   ├── gameController.js  # Games & rewards
│   │   │   └── shopController.js  # Shop & purchases
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT verification
│   │   │   ├── rateLimiter.js    # Rate limiting
│   │   │   └── errorHandler.js   # Error handling
│   │   ├── routes/
│   │   │   ├── auth.js           # Auth routes
│   │   │   ├── skills.js         # Skills routes
│   │   │   ├── sessions.js       # Sessions routes
│   │   │   ├── matches.js        # Matching routes
│   │   │   ├── games.js          # Games routes
│   │   │   └── shop.js           # Shop routes
│   │   ├── socket/
│   │   │   └── index.js          # Socket.io for real-time chat
│   │   └── index.js              # Express entry point
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema (12 tables)
│   │   └── seed.js               # Demo data seeder
│   ├── .env                      # Environment variables
│   └── package.json              # Dependencies
│
├── frontend/                       # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx    # Main layout wrapper
│   │   │   │   ├── Navbar.jsx    # Top navigation bar
│   │   │   │   └── Sidebar.jsx   # Side navigation
│   │   │   ├── auth/
│   │   │   ├── game/
│   │   │   ├── matching/
│   │   │   ├── profile/
│   │   │   └── chat/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Auth state management
│   │   │   └── SocketContext.jsx # WebSocket context
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing page
│   │   │   ├── Dashboard.jsx     # User dashboard
│   │   │   ├── Explore.jsx       # Find skills
│   │   │   ├── Profile.jsx       # User profile
│   │   │   ├── Sessions.jsx      # Manage sessions
│   │   │   ├── Chat.jsx          # Real-time chat
│   │   │   ├── Games.jsx         # Mini-games
│   │   │   ├── Leaderboard.jsx    # Rankings
│   │   │   ├── Shop.jsx          # Buy items
│   │   │   └── Auth/
│   │   │       ├── Login.jsx
│   │   │       └── Register.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios API service
│   │   ├── App.jsx               # Main app component
│   │   ├── main.jsx              # Entry point
│   │   └── index.css             # Tailwind styles
│   ├── index.html
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind config
│   └── package.json
│
├── README.md                       # Project documentation
└── docs/
    └── deployment-guide.md        # This file
```

---

## 🚀 Part 1: Run Locally (Step-by-Step)

### Step 1: Install Required Software

Download and install these from their official websites:

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 18+ LTS | https://nodejs.org |
| PostgreSQL | 15+ | https://postgresql.org |
| VS Code | Latest | https://code.visualstudio.com |

### Step 2: Setup PostgreSQL Database

**Option A: Local PostgreSQL Installation**

1. Install PostgreSQL from the official website
2. Open pgAdmin or terminal
3. Create a new database:

```sql
-- Open psql terminal
psql -U postgres

-- Create database
CREATE DATABASE skillswap;

-- Create user (optional)
CREATE USER skillswap_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE skillswap TO skillswap_user;
```

**Option B: Use pgAdmin (GUI)**

1. Open pgAdmin 4
2. Right-click "Databases" → "Create" → "Database"
3. Name: `skillswap`
4. Click Save

### Step 3: Setup Backend

```powershell
# Navigate to backend folder
cd C:\Users\Bhavya\SkillSwap\backend

# Install dependencies
npm install

# Create .env file
copy-item .env.example .env
```

**Edit `backend/.env` file:**

```env
# Database - UPDATE THIS WITH YOUR LOCAL DB INFO
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/skillswap"

# JWT Secrets - CHANGE THESE TO RANDOM STRINGS
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-this-too"

# Server
PORT=3001
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
```

**Generate Prisma Client & Setup Database:**

```powershell
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# (Optional) Add demo data
node prisma/seed.js
```

**Start Backend Server:**

```powershell
npm run dev
```

You should see:
```
╔══════════════════════════════════════════════════════╗
║   🎮 SkillSwap Backend Server 🎮                    ║
║   API Server:  http://localhost:3001                 ║
║   Socket.io:   ws://localhost:3001                  ║
║   Health:      http://localhost:3001/health          ║
╚══════════════════════════════════════════════════════╝
```

### Step 4: Setup Frontend

```powershell
# Open NEW terminal window
cd C:\Users\Bhavya\SkillSwap\frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### Step 5: View the Application

1. Open your browser
2. Go to: **http://localhost:5173**
3. You should see the SkillSwap landing page
4. Click "Get Started" or "Login"
5. Use demo credentials:

```
Email: demo@skillswap.com
Password: password123
```

---

## 🔐 Part 2: Upload to GitHub

### Step 1: Create GitHub Repository

1. Go to: https://github.com
2. Click "New repository"
3. Repository name: `SkillSwap`
4. Choose Public or Private
5. Click "Create repository"

### Step 2: Initialize Git Locally

```powershell
# Navigate to project folder
cd C:\Users\Bhavya\SkillSwap

# Initialize git repository
git init

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/SkillSwap.git
```

### Step 3: Create .gitignore File

Create a file named `.gitignore` in the project root:

```gitignore
# Dependencies
node_modules/
.pnp/
.pnp.js

# Build outputs
dist/
build/

# Environment files (NEVER COMMIT THESE)
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/

# Prisma
prisma/migrations/

# Misc
*.local
```

### Step 4: Commit and Push

```powershell
# Add all files
git add .

# First commit
git commit -m "Initial commit: SkillSwap - Gamified Skill Exchange Platform"

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 5: Verify Upload

1. Go to your GitHub repository
2. Refresh the page
3. You should see all your files uploaded

---

## ☁️ Part 3: AWS Free Tier Deployment

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    AWS FREE TIER DEPLOYMENT                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Internet                                                        │
│       │                                                          │
│       ▼                                                          │
│   ┌─────────────────┐                                            │
│   │ AWS Amplify     │ ← React Frontend (Free)                   │
│   │ (Global CDN)   │                                            │
│   └────────┬────────┘                                            │
│            │ HTTPS                                               │
│            ▼                                                     │
│   ┌─────────────────┐                                            │
│   │ AWS EC2         │ ← Node.js Backend (Free - 750hrs/mo)    │
│   │ t2.micro        │   • Express API (Port 3001)              │
│   └────────┬────────┘   • Socket.io (Port 3002)                │
│            │                                                     │
│            ▼                                                     │
│   ┌─────────────────┐                                            │
│   │ AWS RDS         │ ← PostgreSQL (Free - 750hrs/mo)          │
│   │ db.t3.micro     │                                            │
│   └─────────────────┘                                            │
│                                                                  │
│   💰 TOTAL MONTHLY COST: $0                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Step 1: Create AWS Account

1. Go to: https://aws.amazon.com
2. Click "Create an AWS Account"
3. Enter email, password, account name
4. Complete verification
5. **IMPORTANT:** Select "Basic Plan" (Free Tier)
6. Add payment method (required for verification, won't be charged)

### Step 2: Create RDS PostgreSQL Database

1. Search "RDS" in AWS Console search bar
2. Click "Create database"
3. **Choose a database creation method:** Standard create
4. **Engine options:** PostgreSQL
5. **Version:** PostgreSQL 15.x
6. **Templates:** Free tier
7. **Settings:**
   - DB instance identifier: `skillswap-db`
   - Master username: `postgres`
   - Master password: `YourSecurePassword123`
8. **Instance configuration:** db.t3.micro
9. **Storage:** 20 GB (Free tier)
10. **Connectivity:**
    - Compute instance: "Don't connect to an EC2 compute instance"
    - Public access: Yes
11. **VPC security group:** Create new
    - Add rule: Type: PostgreSQL, Source: 0.0.0.0/0
12. **Additional configuration:**
    - Initial database name: `skillswap`
13. Click "Create database"

**⚠️ Wait 5-10 minutes for database to be created**

**Note your database endpoint (Connection string):**
```
skillswap-db.xxxxxx.us-east-1.rds.amazonaws.com:5432
```

### Step 3: Launch EC2 Instance

1. Search "EC2" in AWS Console
2. Click "Instances" → "Launch instances"
3. **Name:** `skillswap-server`
4. **Amazon Machine Image (AMI):** Ubuntu Server 22.04 LTS (Free tier)
5. **Instance type:** t2.micro (Free tier eligible)
6. **Key pair:** Create new
   - Name: `skillswap-key`
   - Type: RSA
   - Format: .pem
   - Click "Create"
   - **DOWNLOAD THE .pem FILE AND SAVE IT SECURELY**
7. **Network settings:**
   - VPC: Default
   - Subnet: Default
   - Auto-assign public IP: Enable
   - Firewall: Create security group
   - Add rules:
     - SSH (22): My IP
     - HTTP (80): Anywhere
     - HTTPS (443): Anywhere
     - Custom TCP (3001): Anywhere
     - Custom TCP (3002): Anywhere
8. Click "Launch instance"

**⚠️ Wait 2-3 minutes for instance to start**

### Step 4: Connect to EC2 & Setup Backend

1. Find your EC2 instance
2. Click "Connect"
3. Choose "SSH client"
4. Copy the example SSH command:

```bash
ssh -i "skillswap-key.pem" ubuntu@YOUR_EC2_IP.compute-1.amazonaws.com
```

**On Windows - Connect using PowerShell:**

```powershell
# Navigate to where you saved the .pem file
cd C:\Users\Bhavya\Downloads

# Set permissions (Windows)
icacls skillswap-key.pem /inheritance:r /grant:r "$($env:USERNAME):R"

# Connect
ssh -i "skillswap-key.pem" ubuntu@YOUR_EC2_IP.compute-1.amazonaws.com
```

**On Mac/Linux:**

```bash
chmod 400 skillswap-key.pem
ssh -i "skillswap-key.pem" ubuntu@YOUR_EC2_IP.compute-1.amazonaws.com
```

### Step 5: Install Node.js & Setup on EC2

Once connected to EC2, run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git

# Install Nginx
sudo apt install -y nginx

# Verify installations
node --version
npm --version
pm2 --version
```

### Step 6: Clone Repository & Setup Backend on EC2

```bash
# Create folder for the app
mkdir -p /var/www/skillswap
cd /var/www/skillswap

# Clone your GitHub repository
git clone https://github.com/YOUR_USERNAME/SkillSwap.git .

# Install backend dependencies
cd backend
npm install

# Create production .env file
nano .env
```

**Paste this content (UPDATE THE DATABASE URL):**

```env
# Database - USE YOUR RDS ENDPOINT
DATABASE_URL="postgresql://postgres:YourSecurePassword123@skillswap-db.xxxxxx.us-east-1.rds.amazonaws.com:5432/skillswap"

# JWT Secrets - GENERATE RANDOM STRINGS
JWT_SECRET="generate-a-long-random-string-here"
JWT_REFRESH_SECRET="another-long-random-string-here"

# Server
PORT=3001
NODE_ENV="production"

# Frontend URL - UPDATE WITH YOUR AMPLIFY URL LATER
FRONTEND_URL="https://YOUR_APP.amplifyapp.com"
```

**Save and exit nano:** Press `Ctrl+X`, then `Y`, then `Enter`

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# (Optional) Add demo data
node prisma/seed.js

# Start backend with PM2
pm2 start src/index.js --name skillswap-api

# Setup PM2 to start on reboot
pm2 startup
pm2 save
```

### Step 7: Configure Nginx

```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/skillswap
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name YOUR_EC2_IP;

    # Frontend (static files - we'll deploy this later)
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header upgrade $http_upgrade;
        proxy_set_header connection 'upgrade';
        proxy_set_header host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header upgrade $http_upgrade;
        proxy_set_header connection 'upgrade';
        proxy_set_header host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header upgrade $http_upgrade;
        proxy_set_header connection 'upgrade';
        proxy_set_header host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Save and exit:** `Ctrl+X`, `Y`, `Enter`

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/skillswap /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Step 8: Deploy Frontend to AWS Amplify

1. Go to: https://console.aws.amazon.com/amplify
2. Click "Create new app"
3. Choose "GitHub" (Authorize Amplify to access GitHub)
4. Select your repository: `SkillSwap`
5. Select branch: `main`
6. **Build settings:** Click "Edit"
   - Build command: `npm run build`
   - Output directory: `dist`
7. **Environment variables:** Click "Add variable"
   - Name: `VITE_API_URL`
   - Value: `http://YOUR_EC2_IP/api`
8. Click "Next"
9. Click "Save and deploy"

**⚠️ Wait 5-10 minutes for deployment**

**Note your Amplify URL:**
```
https://xxxxxxxxxxxxx.amplifyapp.com
```

### Step 9: Update Backend .env

Back in your EC2 terminal:

```bash
cd /var/www/skillswap/backend
nano .env
```

Update `FRONTEND_URL` with your Amplify URL:

```env
FRONTEND_URL="https://xxxxxxxxxxxxx.amplifyapp.com"
```

```bash
# Restart the backend
pm2 restart skillswap-api

# Check status
pm2 status
```

### Step 10: Update Security Groups

**Allow Amplify to connect to EC2:**

1. Go to EC2 Dashboard → Instances
2. Select your instance
3. Click "Security" tab → "Security groups" → "Edit inbound rules"
4. Add rule:
   - Type: Custom TCP
   - Port: 3001
   - Source: Custom (Amplify IP ranges) or Anywhere
5. Save rules

---

## 🎯 Part 4: Verification & Testing

### Test Backend API

```bash
# In your browser, go to:
http://YOUR_EC2_IP/api/health
```

You should see:
```json
{"success":true,"message":"SkillSwap API is running! 🚀"}
```

### Test Full Application

1. Go to your Amplify URL
2. You should see the SkillSwap landing page
3. Register a new account or login with demo credentials
4. Test:
   - [ ] Dashboard loads with XP, coins, streak
   - [ ] Add skills (teach/learn)
   - [ ] Play games (Spin, Speed Match)
   - [ ] View leaderboard
   - [ ] Visit shop

---

## 🔧 Part 5: Troubleshooting

### Backend Won't Start

```bash
# Check logs
pm2 logs skillswap-api

# Common issues:
# - Database connection failed - check DATABASE_URL
# - Port already in use - change PORT in .env
```

### Database Connection Issues

```bash
# Test database connection from EC2
sudo apt install postgresql-client
psql -h YOUR_RDS_ENDPOINT -U postgres -d skillswap
```

### Frontend Build Fails

```bash
# Check Amplify build logs
# Common issues:
# - Missing environment variables
# - Node version mismatch
```

### Socket.io Not Working

```bash
# Check if port 3002 is open
# Update nginx config to proxy socket.io properly
```

---

## 📊 Part 6: Defense Presentation Points

### Architecture Questions
- "I chose a hybrid architecture with Amplify for frontend hosting (global CDN, free) and EC2 for the Node.js backend because Socket.io WebSockets require persistent connections that Lambda cannot handle efficiently"
- "PostgreSQL on RDS provides ACID compliance critical for session bookings and XP transactions"

### Matching Algorithm
- "The multi-factor matching algorithm considers skill complementarity (40%), availability overlap (25%), rating threshold (15%), response time (10%), and level compatibility (10%)"
- "Each user gets scored 0-100, and matches above 60 are recommended"

### Security Implementation
- "JWT with refresh token rotation prevents session hijacking"
- "bcrypt with cost factor 12 for password hashing"
- "Rate limiting: 100 requests/15min general, 10 attempts/15min for auth"
- "Input validation using express-validator prevents SQL injection and XSS"

### Real-time Features
- "Socket.io rooms allow efficient session-specific chat without server-wide state"
- "Typing indicators and read receipts use minimal bandwidth"

### Performance
- "React Query provides API caching and deduplication"
- "WebSocket heartbeat maintains connections"
- "Prisma ORM generates optimized SQL queries"

---

## 💰 Cost Summary (AWS Free Tier)

| Service | Specification | Monthly Cost | Limits |
|---------|--------------|-------------|--------|
| EC2 t2.micro | 750 hrs/month | $0 | 750 hrs |
| RDS db.t3.micro | 750 hrs/month | $0 | 750 hrs, 20GB |
| Amplify | Static hosting | $0 | 5GB storage, 15GB transfer |
| **TOTAL** | | **$0** | |

**⚠️ IMPORTANT:** If you exceed Free Tier limits, charges will apply. Monitor usage in AWS Console → Billing Dashboard.

---

## 🎓 Academic Defense Checklist

- [ ] Can explain the full architecture
- [ ] Can describe the database schema and relationships
- [ ] Can explain the matching algorithm logic
- [ ] Can demonstrate the gamification system (XP, coins, levels)
- [ ] Can show real-time chat working
- [ ] Can explain security measures (JWT, bcrypt, rate limiting)
- [ ] Can discuss trade-offs in design decisions
- [ ] Can explain why specific technologies were chosen
- [ ] Can demonstrate the application working
- [ ] Can discuss future improvements

---

**Document Version:** 1.0  
**Last Updated:** April 2026  
**Project:** SkillSwap - Gamified Skill Exchange Platform

---

*Good luck with your project defense! 🚀*
