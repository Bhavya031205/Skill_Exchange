# AWS Deployment Guide - SkillSwap

This guide deploys your SkillSwap application on AWS Free Tier using:
- **Frontend**: AWS Amplify (Static web hosting - FREE)
- **Backend**: AWS EC2 + RDS PostgreSQL (750 hours/month - FREE for 1 year)

---

## Prerequisites

1. AWS Account (Student/Free Tier)
2. GitHub repository with your code pushed
3. Local terminal with AWS CLI installed

---

## Step 1: Database Setup (RDS PostgreSQL)

### 1.1 Create RDS PostgreSQL Instance

1. Go to **AWS Console → RDS → Create database**
2. **Engine**: PostgreSQL
3. **Version**: PostgreSQL 15.x (or latest)
4. **Template**: Free tier
5. **DB Instance Identifier**: `skillswap-db`
6. **Master Username**: `skillswap`
7. **Master Password**: `SkillSwap@2024!` (remember this!)
8. **Instance Class**: db.t2.micro (Free tier)
9. **Storage**: 20 GB (Free tier)
10. **Public Access**: Yes (required for EC2 connection)
11. **VPC Security Group**: Create new - allow port 5432

**Wait 5-10 minutes until "Available" status**

### 1.2 Get Database Endpoint
- Note the **Endpoint** (e.g., `skillswap-db.xxx.rds.amazonaws.com`)
- Port: `5432`

---

## Step 2: Backend Setup (EC2)

### 2.1 Launch EC2 Instance

1. Go to **AWS Console → EC2 → Launch Instance**
2. **Name**: `skillswap-backend`
3. **AMI**: Amazon Linux 2023 (Free tier)
4. **Instance Type**: t2.micro (Free tier)
5. **Key Pair**: Create new or use existing (download .pem file!)
6. **Security Group**: 
   - SSH (port 22): Your IP
   - HTTP (port 80): 0.0.0.0/0
   - HTTPS (port 443): 0.0.0.0/0
   - Custom TCP (port 3001): 0.0.0.0/0

### 2.2 Connect to EC2

```bash
# Mac/Linux
ssh -i "your-key.pem" ec2-user@<YOUR-EC2-PUBLIC-IP>

# Windows (PowerShell)
ssh -i "C:\path\to\your-key.pem" ec2-user@<YOUR-EC2-PUBLIC-IP>
```

### 2.3 Install Node.js & PM2

```bash
# Update and install Node.js
sudo yum update -y
curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Verify
node --version  # Should show v20.x
```

### 2.4 Deploy Backend

```bash
# Create project directory
mkdir -p ~/skillswap-backend
cd ~/skillswap-backend

# Clone your repository
git clone https://github.com/Bhavya031205/Skill_Exchange.git .

# Install dependencies
cd backend
npm install

# Create production .env file
cat > .env << 'EOF'
# Database - USE YOUR RDS ENDPOINT!
DATABASE_URL="postgresql://skillswap:SkillSwap@2024!@skillswap-db.xxx.rds.amazonaws.com:5432/skillswap?schema=public"

# JWT - GENERATE NEW SECRETS!
JWT_SECRET="$(openssl rand -hex 32)"
JWT_REFRESH_SECRET="$(openssl rand -hex 32)"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="production"

# Frontend URL - UPDATE AFTER AMPLIFY DEPLOYMENT
FRONTEND_URL="https://your-amplify-app.amplifyapp.com"

# Game Config
SPIN_COOLDOWN_HOURS=24
EOF

# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# Start with PM2
pm2 start src/index.js --name skillswap-backend

# Keep running after restart
pm2 startup
pm2 save
```

---

## Step 3: Frontend Setup (Amplify)

### 3.1 Deploy Frontend

1. Go to **AWS Console → Amplify → Create new app**
2. **Repository**: Connect GitHub → Select your `Skill_Exchange` repo
3. **Branch**: `main`
4. **Build settings**:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/dist
     cache:
       paths:
         - frontend/node_modules/**/*
   ```
5. **Environment variables** (IMPORTANT!):
   ```
   VITE_API_URL = http://<YOUR-EC2-PUBLIC-IP>:3001/api
   ```
6. **Deploy**

### 3.2 Update Backend Environment

After Amplify deployment, update EC2:
```bash
# Get Amplify URL from Amplify console
# Update FRONTEND_URL in .env
cd ~/skillswap-backend/backend
pm2 restart skillswap-backend
```

---

## Step 4: Verify Deployment

### Test Backend API
```bash
# Replace with your EC2 IP
curl http://<YOUR-EC2-IP>:3001/health
```

### Test Frontend
- Visit: `https://your-app.amplifyapp.com`
- Try logging in
- If API errors, check:
  1. EC2 security group allows port 3001
  2. Backend .env has correct FRONTEND_URL

---

## Important URLs After Deployment

| Service | URL |
|---------|-----|
| Frontend | `https://xxx.amplifyapp.com` |
| Backend API | `http://<EC2-IP>:3001/api` |
| Health Check | `http://<EC2-IP>:3001/health` |

---

## Troubleshooting

### Backend Won't Start
```bash
# Check logs
pm2 logs skillswap-backend

# Common issues:
# - Database connection failed → Check RDS security group
# - Port in use → Change PORT in .env
```

### Frontend Can't Connect to API
1. Check EC2 Security Group allows port 3001 from anywhere (0.0.0.0/0)
2. Verify VITE_API_URL in Amplify environment variables
3. Check backend CORS settings match frontend URL

### Database Schema Issues
```bash
# SSH into EC2
cd ~/skillswap-backend/backend
npx prisma db push --force-reset
```

---

## Cost Warning (Stay in Free Tier)

- ✅ EC2 t2.micro: 750 hrs/month FREE
- ✅ RDS t2.micro: 750 hrs/month FREE  
- ✅ Amplify: 1000 build mins/month FREE
- ⚠️ Data transfer: Keep under 15GB/month

---

## Quick Commands (For Reference)

```bash
# SSH into server
ssh -i "key.pem" ec2-user@<EC2-IP>

# Restart backend
pm2 restart skillswap-backend

# View logs
pm2 logs skillswap-backend

# Check status
pm2 status
```

---

## Production Notes

1. **HTTPS**: For production HTTPS, use AWS Application Load Balancer + Certificate Manager (Free tier eligible)
2. **Domain**: Connect custom domain via Amplify (free)
3. **SSL**: Backend needs nginx reverse proxy for HTTPS

---

Last Updated: April 2026