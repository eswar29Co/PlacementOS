# 🚀 PlacementOS - Quick Start Deployment Guide

Get your PlacementOS application deployed in **under 30 minutes**!

---

## 📋 Prerequisites Checklist

Before you begin, create accounts on these platforms (all free):

- [ ] [GitHub](https://github.com/signup) - Code repository
- [ ] [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) - Database
- [ ] [Cloudinary](https://cloudinary.com/users/register_free) - File storage
- [ ] [Render](https://render.com) - Backend hosting
- [ ] [Vercel](https://vercel.com/signup) - Frontend hosting

---

## 🎯 5-Step Deployment Process

### Step 1: Push to GitHub (5 minutes)

```bash
cd c:\Kumbhasthalam\PlacementOS
git add .
git commit -m "Ready for deployment"
git push origin main
```

If you haven't created a GitHub repository yet:
1. Go to [GitHub](https://github.com/new)
2. Create new repository: `PlacementOS`
3. Follow the instructions to push your code

---

### Step 2: Setup MongoDB Atlas (5 minutes)

1. **Create Cluster**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Choose **M0 Free** tier
   - Select region closest to you
   - Cluster name: `PlacementOS-Cluster`

2. **Create Database User**:
   - Username: `placementos-admin`
   - Generate strong password (save it!)

3. **Allow Network Access**:
   - Add IP: `0.0.0.0/0` (allow from anywhere)

4. **Get Connection String**:
   ```
   mongodb+srv://placementos-admin:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/placementosDB?retryWrites=true&w=majority
   ```
   ⚠️ **Save this connection string!**

---

### Step 3: Setup Cloudinary (3 minutes)

1. Sign up at [Cloudinary](https://cloudinary.com/users/register_free)
2. Go to **Dashboard**
3. Copy these credentials:
   - Cloud Name
   - API Key
   - API Secret
   
⚠️ **Save these credentials!**

---

### Step 4: Deploy Backend to Render (7 minutes)

1. **Create Web Service**: [Render Dashboard](https://dashboard.render.com)
   - Click **"New +"** → **"Web Service"**
   - Connect GitHub repository: `PlacementOS`
   - Root Directory: `backend-pos`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance Type: **Free**

2. **Add Environment Variables**:

   Copy these to Render's Environment Variables section:

   ```bash
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<generate-random-32-char-string>
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=<generate-another-random-string>
   JWT_REFRESH_EXPIRES_IN=30d
   CORS_ORIGIN=https://your-app.vercel.app
   CLOUDINARY_CLOUD_NAME=<from-cloudinary>
   CLOUDINARY_API_KEY=<from-cloudinary>
   CLOUDINARY_API_SECRET=<from-cloudinary>
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=<gmail-app-password>
   EMAIL_FROM=PlacementOS <noreply@placementos.com>
   FRONTEND_URL=https://your-app.vercel.app
   ```

   **Generate JWT Secrets** (PowerShell):
   ```powershell
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
   ```

3. **Deploy**: Click "Create Web Service"
4. **Save Backend URL**: `https://placementos-backend.onrender.com`

---

### Step 5: Deploy Frontend to Vercel (5 minutes)

1. **Import Project**: [Vercel Dashboard](https://vercel.com/new)
   - Import GitHub repository: `PlacementOS`
   - Framework Preset: **Vite**
   - Root Directory: `frontend-pos`
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Add Environment Variables**:

   ```bash
   VITE_API_BASE_URL=https://placementos-backend.onrender.com/api/v1
   VITE_ENV=production
   VITE_APP_NAME=PlacementOS
   ```

3. **Deploy**: Click "Deploy"
4. **Get Frontend URL**: `https://placement-os.vercel.app`

---

### Step 6: Final Configuration (2 minutes)

1. **Update Backend CORS**:
   - Go back to Render
   - Update `CORS_ORIGIN` to your Vercel URL
   - Update `FRONTEND_URL` to your Vercel URL
   - Service will auto-redeploy

2. **Test Your Application**:
   - Visit your Vercel URL
   - Try registering a user
   - Test login
   - Upload a resume
   - Create a job posting

---

## ✅ Verification Checklist

- [ ] Backend is running: `https://your-backend.onrender.com/api/health`
- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] User registration works
- [ ] Login works
- [ ] File upload works
- [ ] Database is connected (check MongoDB Atlas metrics)

---

## 🎉 You're Live!

Your PlacementOS application is now deployed and accessible worldwide!

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **Database**: MongoDB Atlas (managed)

---

## 📚 Next Steps

- Read the full [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
- Set up custom domain (optional)
- Configure email notifications
- Monitor application logs
- Set up analytics (optional)

---

## 🆘 Need Help?

**Common Issues:**

1. **Backend won't start**: Check Render logs for errors
2. **Frontend can't connect**: Verify `VITE_API_BASE_URL` is correct
3. **Database connection fails**: Check MongoDB Atlas IP whitelist
4. **File uploads fail**: Verify Cloudinary credentials

**Detailed troubleshooting**: See [DEPLOYMENT.md](./DEPLOYMENT.md#-troubleshooting)

---

## 💡 Pro Tips

- ⚡ First request to Render may be slow (cold start) - this is normal for free tier
- 🔄 Both platforms auto-deploy when you push to GitHub
- 📊 Monitor usage in each platform's dashboard
- 🔐 Never commit `.env` files to GitHub
- 💾 MongoDB Atlas free tier is deleted after 60 days of inactivity

---

**Happy Deploying! 🚀**
