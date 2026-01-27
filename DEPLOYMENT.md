# 🚀 PlacementOS Deployment Guide

Complete guide to deploy PlacementOS using free tier services.

## 📊 Deployment Architecture

```
┌─────────────────┐
│   Vercel        │  ← Frontend (React + Vite)
│   (Frontend)    │
└────────┬────────┘
         │
         │ API Calls
         ↓
┌─────────────────┐
│   Render        │  ← Backend (Node.js + Express)
│   (Backend API) │
└────────┬────────┘
         │
         │ Database Connection
         ↓
┌─────────────────┐
│  MongoDB Atlas  │  ← Database
│   (Database)    │
└─────────────────┘
         ↑
         │ File Storage
┌─────────────────┐
│   Cloudinary    │  ← Resume/Document Storage
└─────────────────┘
```

---

## 🎯 Prerequisites

- [x] GitHub account (for code repository)
- [ ] MongoDB Atlas account
- [ ] Render account
- [ ] Vercel account
- [ ] Cloudinary account (for file uploads)

---

## 📝 Step 1: Prepare Your Repository

### 1.1 Push Code to GitHub

```bash
# Initialize git if not already done
cd c:\Kumbhasthalam\PlacementOS
git add .
git commit -m "Prepare for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/PlacementOS.git
git branch -M main
git push -u origin main
```

### 1.2 Create Environment Template Files

Create `.env.example` files to document required environment variables (actual `.env` files should NOT be committed).

---

## 🗄️ Step 2: MongoDB Atlas Setup (Database)

### 2.1 Create Account & Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Click **"Build a Database"**
4. Select **"M0 Free"** tier
5. Choose a cloud provider and region (select closest to your users)
6. Cluster Name: `   -Cluster`
7. Click **"Create"**

### 2.2 Configure Database Access

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
   - Authentication Method: **Password**
   - Username: `placementos-admin`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: **Read and write to any database**
3. Click **"Add User"**

### 2.3 Configure Network Access

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is needed for Render to connect
4. Click **"Confirm"**

### 2.4 Get Connection String

1. Go to **"Database"** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string:
   ```
   mongodb+srv://placementos-admin:<password>@placementos-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name before the `?`:
   ```
   mongodb+srv://placementos-admin:YOUR_PASSWORD@placementos-cluster.xxxxx.mongodb.net/placementosDB?retryWrites=true&w=majority
   ```

> [!IMPORTANT]
> Save this connection string securely - you'll need it for backend deployment!

---

## 🔧 Step 3: Cloudinary Setup (File Storage)

### 3.1 Create Account

1. Go to [Cloudinary](https://cloudinary.com/users/register_free)
2. Sign up for free account
3. Go to **Dashboard**

### 3.2 Get API Credentials

From your Cloudinary Dashboard, copy:
- **Cloud Name**: `dxxxxxxxxxxxxx`
- **API Key**: `123456789012345`
- **API Secret**: `abcdefghijklmnopqrstuvwxyz`

> [!IMPORTANT]
> Save these credentials - you'll need them for backend deployment!

---

## 🖥️ Step 4: Backend Deployment (Render)

### 4.1 Create Render Account

1. Go to [Render](https://render.com)
2. Sign up using your **GitHub account** (recommended)

### 4.2 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `PlacementOS`
3. Configure the service:

   **Basic Settings:**
   - Name: `placementos-backend`
   - Region: Choose closest to your users
   - Branch: `main`
   - Root Directory: `backend-pos`
   - Runtime: **Node**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

   **Instance Type:**
   - Select **"Free"** tier

### 4.3 Configure Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `10000` | Render default port |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `[Generate random string]` | Access token secret |
| `JWT_EXPIRES_IN` | `7d` | Access token expiration |
| `JWT_REFRESH_SECRET` | `[Generate random string]` | Refresh token secret |
| `JWT_REFRESH_EXPIRES_IN`| `30d` | Refresh token expiration |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | `your_api_key` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | From Cloudinary dashboard |
| `SMTP_HOST` | `smtp.gmail.com` | Email service (if using Gmail) |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | `your-email@gmail.com` | Your email |
| `SMTP_PASS` | `your-app-password` | Gmail app password |
| `EMAIL_FROM` | `PlacementOS <noreply@placementos.com>` | From address |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Will update after frontend deployment |
| `CORS_ORIGIN` | `https://your-app.vercel.app` | Same as FRONTEND_URL |

> [!TIP]
> To generate a secure JWT_SECRET on Windows PowerShell:
> ```powershell
> -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
> ```

### 4.4 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll get a URL like: `https://placementos-backend.onrender.com`
4. **Save this URL** - you'll need it for frontend!

> [!WARNING]
> Free tier Render services spin down after 15 minutes of inactivity. First request after inactivity may take 30-60 seconds.

### 4.5 Verify Backend

Test your backend API:
```bash
curl https://placementos-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-23T12:38:50.000Z"
}
```

---

## 🌐 Step 5: Frontend Deployment (Vercel)

### 5.1 Create Vercel Account

1. Go to [Vercel](https://vercel.com/signup)
2. Sign up using your **GitHub account**

### 5.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository: `PlacementOS`
3. Configure project:

   **Framework Preset:** Vite
   
   **Root Directory:** `frontend-pos`
   
   **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 5.3 Configure Environment Variables

Click **"Environment Variables"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `VITE_API_BASE_URL` | `https://placementos-backend.onrender.com/api/v1` | Your Render backend URL |
| `VITE_APP_NAME` | `PlacementOS` | Application name |

> [!IMPORTANT]
> Vite requires environment variables to be prefixed with `VITE_`

### 5.4 Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment (2-5 minutes)
3. You'll get a URL like: `https://placement-os.vercel.app`

### 5.5 Update Backend CORS & Frontend URL

1. Go back to **Render** → Your backend service
2. Update environment variable:
   - `FRONTEND_URL` = `https://placement-os.vercel.app`
3. Backend will automatically redeploy

---

## ✅ Step 6: Post-Deployment Configuration

### 6.1 Update Backend CORS Settings

Ensure your backend allows requests from Vercel domain. Check `backend-pos/src/server.ts`:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### 6.2 Seed Initial Data (Optional)

If you need to seed your database with initial data:

```bash
# Install Render CLI
npm install -g render-cli

# SSH into your Render service
render ssh placementos-backend

# Run seed script
npm run seed
```

---

## 🧪 Step 7: Testing & Verification

### 7.1 Test Backend Endpoints

```bash
# Health check
curl https://placementos-backend.onrender.com/api/health

# Test authentication
curl -X POST https://placementos-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 7.2 Test Frontend

1. Visit your Vercel URL: `https://placement-os.vercel.app`
2. Test user registration
3. Test login
4. Test creating a job posting
5. Test file uploads (resume)
6. Check real-time features (if using Socket.io)

### 7.3 Monitor Logs

**Backend Logs (Render):**
- Go to Render Dashboard → Your service → **"Logs"** tab

**Frontend Logs (Vercel):**
- Go to Vercel Dashboard → Your project → **"Deployments"** → Click deployment → **"Logs"**

**Database Monitoring (MongoDB Atlas):**
- Go to Atlas Dashboard → **"Metrics"** tab

---

## 🔄 Step 8: Continuous Deployment (Auto-Deploy)

### 8.1 Automatic Deployments

Both Vercel and Render automatically deploy when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update feature X"
git push origin main

# Vercel and Render will automatically detect and deploy!
```

### 8.2 Branch Deployments (Optional)

**Vercel** automatically creates preview deployments for pull requests.

**Render** can be configured to deploy specific branches:
1. Go to Render → Your service → **"Settings"**
2. Under **"Branch"**, you can add multiple branches

---

## 🔐 Security Best Practices

> [!CAUTION]
> Follow these security practices for production:

1. **Never commit `.env` files** to GitHub
2. **Use strong JWT secrets** (32+ characters, random)
3. **Enable rate limiting** (already configured in your backend)
4. **Use HTTPS only** (Vercel and Render provide this automatically)
5. **Regularly rotate secrets** (JWT, database passwords)
6. **Monitor MongoDB Atlas** for unusual activity
7. **Set up Cloudinary upload restrictions** (file size, types)

---

## 💰 Free Tier Limits

### MongoDB Atlas (M0)
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ No credit card required
- ⚠️ Clusters deleted after 60 days of inactivity

### Render (Free)
- ✅ 750 hours/month (enough for 1 service)
- ✅ 512 MB RAM
- ✅ Automatic SSL
- ⚠️ Spins down after 15 min inactivity
- ⚠️ 100 GB bandwidth/month

### Vercel (Hobby)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic SSL
- ✅ Global CDN
- ⚠️ 100 GB-hours compute time

### Cloudinary (Free)
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ 25,000 transformations/month

---

## 🐛 Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### Frontend can't connect to backend
- Verify `VITE_API_BASE_URL` is correct
- Check CORS settings in backend
- Check browser console for errors

### Database connection fails
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check database user credentials
- Ensure connection string includes database name

### File uploads fail
- Verify Cloudinary credentials
- Check file size limits
- Review Cloudinary dashboard for errors

### Slow first request (Render)
- This is normal for free tier (cold start)
- Consider upgrading to paid tier for always-on service
- Or implement a keep-alive ping service

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

## 🎉 Success!

Your PlacementOS application is now live! 🚀

- **Frontend**: `https://placement-os.vercel.app`
- **Backend**: `https://placementos-backend.onrender.com`
- **Database**: MongoDB Atlas (managed)

Share your application with users and start managing placements! 🎓
