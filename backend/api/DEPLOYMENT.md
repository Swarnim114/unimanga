# UniManga Backend Deployment Guide

## 🚀 Deploy on Render.com

### Step 1: Prepare Repository
1. Push your code to GitHub
2. Make sure `.env` is in `.gitignore`

### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 3: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select the **unimanga** repository

### Step 4: Configure Service
**Basic Settings:**
- **Name**: `unimanga-api` (or your choice)
- **Region**: Choose closest to you
- **Branch**: `main` or `master`
- **Root Directory**: `backend/api`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- Select **Free** tier

### Step 5: Set Environment Variables
Click **"Environment"** tab and add:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Your secret key (generate a random string) |
| `NODE_ENV` | `production` |

### Step 6: Deploy
1. Click **"Create Web Service"**
2. Wait 2-5 minutes for deployment
3. Your API will be live at: `https://unimanga-api.onrender.com`

---

## 🔧 Keep Service Active (Prevent Sleep)

Render free tier sleeps after **15 minutes** of inactivity.

### Solution 1: Cron Job Service (Free)
Create a cron job on Render:

1. Go to Render Dashboard
2. Click **"New +"** → **"Cron Job"**
3. Configure:
   - **Command**: `curl https://unimanga-api.onrender.com`
   - **Schedule**: `*/10 * * * *` (every 10 minutes)

### Solution 2: UptimeRobot (Free External Service)
1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add new monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://unimanga-api.onrender.com`
   - **Interval**: 5 minutes
3. This will ping your API every 5 minutes, keeping it awake

### Solution 3: GitHub Actions Keep-Alive
Add to `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Render Active
on:
  schedule:
    - cron: '*/10 * * * *' # Every 10 minutes
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping API
        run: curl https://unimanga-api.onrender.com
```

---

## 📱 Update Mobile App

After deployment, update your mobile app API URL:

**File**: `apps/mobile/my-app/services/api.service.ts`

```typescript
const API_BASE_URL = 'https://unimanga-api.onrender.com/api';
```

---

## ✅ Verify Deployment

Test your API:
```bash
curl https://unimanga-api.onrender.com/
```

Expected response:
```json
{
  "message": "UniManga API is running!",
  "status": "healthy",
  "timestamp": "2026-01-19T..."
}
```

---

## 🐛 Troubleshooting

### Deployment Failed
- Check **Logs** tab on Render
- Verify `package.json` has `"start": "node index.js"`
- Ensure `PORT` uses `process.env.PORT`

### Database Connection Error
- Check `MONGO_URI` in Environment Variables
- Verify MongoDB Atlas allows Render IPs (add `0.0.0.0/0` in Network Access)

### App Sleeping
- Set up one of the keep-alive solutions above
- Note: Free tier will still cold-start (15-30 seconds first request after sleep)

---

## 💰 Cost
- **Render Free Tier**: $0/month
- **MongoDB Atlas Free**: $0/month (512MB)
- **UptimeRobot Free**: $0/month
- **Total**: **FREE** ✅
