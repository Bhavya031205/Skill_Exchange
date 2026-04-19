# SkillSwap - Local Run Guide

## Prerequisites

You need to install the following software on your PC:

| Software | Version | Download Link | Purpose |
|----------|---------|--------------|---------|
| Node.js | 18+ | https://nodejs.org | JavaScript runtime |
| PostgreSQL | 15+ | https://postgresql.org/download | Database |
| Git | Latest | https://git-scm.com | Version control (optional) |

### Verify Installation
```powershell
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
psql --version   # Should show 15.x or higher
```

---

## Project Structure
#
```
C:\Users\Bhavya\SkillSwap\
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── index.js       # Server entry point (Port 3001)
│   │   ├── controllers/   # API logic
│   │   ├── routes/       # API endpoints
│   │   ├── config/       # Database & JWT config
│   │   ├── middleware/   # Auth & security
│   │   └── socket/      # Real-time chat
│   └── prisma/
│       ├── schema.prisma # Database schema
│       └── seed.js      # Demo data
│
└── frontend/              # React + Vite UI
    ├── src/
    │   ├── pages/        # All pages
    │   ├── components/   # UI components
    │   └── services/    # API calls
    └── package.json
```

---

## Step-by-Step Setup

### Step 1: Setup PostgreSQL Database

1. **Install PostgreSQL** from https://postgresql.org/download/windows
2. During installation, set a password for the postgres user (remember it!)
3. Make sure pgAdmin is installed as well

4. **Create the database:**
   - Open pgAdmin (installed with PostgreSQL)
   - Log in with your postgres password
   - Right-click "Databases" → "Create" → "Database"
   - Database name: `skillswap`
   - Click "Save"

**Alternative via Command Line:**
```powershell
psql -U postgres -c "CREATE DATABASE skillswap;"
```

---

### Step 2: Configure Backend Environment Variables

1. **Navigate to backend folder:**
```powershell
cd C:\Users\Bhavya\SkillSwap\backend
```

2. **Create/modify .env file:**
```powershell
# Open the existing .env file or create new one
notepad .env
```

3. **Add these variables (update with your values):**
```env
# Database Connection (update PASSWORD with your postgres password)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/skillswap?schema=public"

# JWT Secret (replace with a secure random string)
JWT_SECRET=your-super-secret-key-change-in-production

# Server Port (default 3001)
PORT=3001

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

**Example .env:**
```env
DATABASE_URL="postgresql://postgres:mypassword123@localhost:5432/skillswap?schema=public"
JWT_SECRET=sk3w4p2024s3cr3t!
PORT=3001
FRONTEND_URL=http://localhost:5173
```

---

### Step 3: Install Backend Dependencies

```powershell
cd C:\Users\Bhavya\SkillSwap\backend
npm install
```

**Expected output:** `added 245 packages in X seconds`

---

### Step 4: Initialize Database

```powershell
cd C:\Users\Bhavya\SkillSwap\backend
npx prisma db push
```

This creates all tables in your database.

---

### Step 5: Seed Demo Data

```powershell
node prisma/seed.js
```

This creates a demo user:
- Email: `demo@skillswap.com`
- Password: `password123`

---

### Step 6: Start Backend Server

```powershell
cd C:\Users\Bhavya\SkillSwap\backend
npm run dev
```

**Expected output:**
```
Server running on port 3001
Database connected successfully
```

**Keep this terminal window open!**

---

### Step 7: Install Frontend Dependencies

Open a **new** terminal window:

```powershell
cd C:\Users\Bhavya\SkillSwap\frontend
npm install
```

---

### Step 8: Configure Frontend

Create `.env` file in frontend folder:
```powershell
notepad C:\Users\Bhavya\SkillSwap\frontend\.env
```

Add:
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

---

### Step 9: Start Frontend

```powershell
cd C:\Users\Bhavya\SkillSwap\frontend
npm run dev
```

**Expected output:**
```
Local: http://localhost:5173/
```

---

### Step 10: Open in Browser

1. Go to: **http://localhost:5173**
2. Login with demo credentials:
   - Email: `demo@skillswap.com`
   - Password: `password123`

---

## Quick Summary Commands

Run these in order (each in a separate terminal):

| Step | Command |
|------|----------|
| Start Backend | `cd C:\Users\Bhavya\SkillSwap\backend && npm run dev` |
| Start Frontend | `cd C:\Users\Bhavya\SkillSwap\frontend && npm run dev` |
| Open App | Browser → http://localhost:5173 |

---

## Common Errors & Solutions

### Error 1: "Cannot connect to database"

**Cause:** Wrong DATABASE_URL or PostgreSQL not running

**Solution:**
1. Check PostgreSQL service is running:
```powershell
Get-Service PostgreSQL*
```

2. Verify database exists:
```powershell
psql -U postgres -c "\l"
```

3. Check .env DATABASE_URL format:
```
postgresql://username:password@localhost:5432/skillswap?schema=public
```

---

### Error 2: "Port 3001 is already in use"

**Cause:** Another process using port 3001

**Solution:**
1. Find process using port:
```powershell
netstat -ano | findstr :3001
```

2. Kill it:
```powershell
taskkill /PID <PROCESS_ID> /F
```

**OR** Change port in backend/.env:
```env
PORT=3002
```

---

### Error 3: "Prisma: migration failed"

**Cause:** Database connection issue

**Solution:**
1. Check DATABASE_URL is correct
2. Ensure PostgreSQL service is running
3. Try:
```powershell
cd C:\Users\Bhavya\SkillSwap\backend
npx prisma migrate reset
```

---

### Error 4: "npm install fails"

**Cause:** Node.js version issue or network

**Solution:**
1. Check Node version:
```powershell
node --version
```
(Must be 18.x or higher)

2. Clear npm cache:
```powershell
npm cache clean --force
```

3. Delete node_modules and try again:
```powershell
rmdir /s /q node_modules
npm install
```

---

### Error 5: "CORS error in browser"

**Cause:** Frontend cannot access backend

**Solution:**
1. Check backend has CORS configured for your frontend URL
2. Ensure both servers are running
3. Check browser console for exact error

---

### Error 6: "blank white page"

**Cause:** Frontend build issue or missing env

**Solution:**
1. Check `.env` file exists in frontend folder
2. Check browser console (F12) for errors
3. Run:
```powershell
cd C:\Users\Bhavya\SkillSwap\frontend
npm run build
```

---

### Error 7: "React router warning"

**Solution:** Add to frontend package.json scripts:
```json
"dev": "vite --host"
```

Or allow in firewall if prompted.

---

## Port Reference

| Port | Service |
|------|---------|
| 3001 | Backend API |
| 5173 | Frontend (Vite) |
| 5432 | PostgreSQL |
| 5433 | PostgreSQL (if custom port) |

---

## Troubleshooting Checklist

- [ ] PostgreSQL service is running
- [ ] Database "skillswap" exists
- [ ] .env file has correct DATABASE_URL
- [ ] `npx prisma db push` completed successfully
- [ ] Backend running on port 3001
- [ ] Frontend can access http://localhost:3001/api
- [ ] No firewall blocking ports

---

## Want to Deploy to Cloud?

See these guides in the project:
- `AWS_DEPLOYMENT_GUIDE.md` - Deploy to AWS (Free Tier)
- `QUICK_DEPLOY.md` - Quick deployment overview

---

## Help & Support

- Check backend terminal for errors
- Check browser console (F12 → Console)
- Verify all .env variables are correct
- Make sure both servers are running

**Project repo:** C:\Users\Bhavya\SkillSwap