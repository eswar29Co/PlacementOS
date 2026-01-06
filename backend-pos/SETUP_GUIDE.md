# PlacementOS Backend - Setup & Run Instructions

## 📋 Prerequisites Checklist

Before you begin, make sure you have:

- [ ] **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- [ ] **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- [ ] **npm** or **yarn** (comes with Node.js)
- [ ] **Git** (optional, for version control)

## ⚡ Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
cd backend-pos
npm install
```

This will install all required packages including:
- express, mongoose, jsonwebtoken
- bcryptjs, cors, helmet
- TypeScript and development tools

### Step 2: Configure Environment

The `.env` file is already created with default values. Update if needed:

```bash
# Open .env in your editor
notepad .env  # Windows
# or
nano .env     # Mac/Linux
```

**Minimum required configuration:**
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string
- `CORS_ORIGIN` - Your frontend URL (default: http://localhost:5173)

### Step 3: Start MongoDB

**Windows:**
```bash
# MongoDB should auto-start as a service
# Or manually start it:
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Verify MongoDB is running:**
```bash
mongosh
# Should connect without errors
```

### Step 4: Start the Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

### Step 5: Verify Setup

Open your browser or use curl:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "PlacementOS API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

## ✅ Success! Your API is Running

You should see:
```
╔════════════════════════════════════════╗
║      PlacementOS API Server            ║
║                                        ║
║  Environment: development              ║
║  Port: 5000                            ║
║  API Version: v1                       ║
║                                        ║
║  Server running at:                    ║
║  http://localhost:5000                 ║
║                                        ║
║  API Base URL:                         ║
║  http://localhost:5000/api/v1          ║
╚════════════════════════════════════════╝
```

---

## 🧪 Test Your Setup

### 1. Create Admin User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"role\":\"admin\",\"name\":\"Admin User\",\"email\":\"admin@test.com\",\"password\":\"admin123\"}"
```

### 2. Login as Admin

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@test.com\",\"password\":\"admin123\",\"role\":\"admin\"}"
```

Copy the token from the response!

### 3. Create a Job

```bash
curl -X POST http://localhost:5000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"companyName\":\"Test Corp\",\"roleTitle\":\"Developer\",\"ctcBand\":\"10-15 LPA\",\"locationType\":\"Hybrid\",\"description\":\"Test job\",\"requirements\":[\"3+ years\"],\"skills\":[\"JavaScript\"],\"requiredTechStack\":[\"React\"],\"deadline\":\"2024-12-31\"}"
```

### 4. Get All Jobs

```bash
curl http://localhost:5000/api/v1/jobs
```

If all these work, **congratulations!** 🎉 Your backend is fully operational!

---

## 🔧 Available Commands

```bash
# Development (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint

# Run tests (if configured)
npm test
```

---

## 📂 Project Files Overview

```
backend-pos/
├── src/                    # Source code
│   ├── controllers/        # Business logic
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth, error handling
│   ├── utils/             # Helper functions
│   ├── config/            # Configuration
│   └── server.ts          # Entry point
├── dist/                  # Compiled JavaScript (after build)
├── node_modules/          # Dependencies
├── .env                   # Environment variables
├── .env.example           # Environment template
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript config
├── README.md              # Full documentation
├── QUICK_START.md         # This file
├── FLOW_DOCUMENTATION.md  # Business logic
└── API_SAMPLES.md         # Sample requests
```

---

## 🔌 Connect Your Frontend

In your frontend code:

```typescript
// src/config/api.ts
export const API_BASE_URL = 'http://localhost:5000/api/v1';

// Example: Login function
async function login(email: string, password: string, role: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  }
  
  throw new Error(data.message);
}

// Example: Authenticated request
async function getProfile() {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.data;
}
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error:** `MongooseServerSelectionError`

**Solution:**
1. Check if MongoDB is running: `mongosh`
2. Verify `MONGODB_URI` in `.env`
3. Try: `mongodb://localhost:27017/placementos`
4. Or use MongoDB Atlas (cloud): [https://cloud.mongodb.com](https://cloud.mongodb.com)

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
1. Change `PORT` in `.env` to another port (e.g., 5001)
2. Or kill the process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill -9
   ```

### TypeScript Compilation Errors

**Error:** `Cannot find module...`

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### JWT Token Invalid

**Error:** `401 Unauthorized`

**Solution:**
1. Check `JWT_SECRET` is set in `.env`
2. Token may have expired (7 days default)
3. Login again to get a fresh token

### CORS Error in Frontend

**Error:** `Access-Control-Allow-Origin`

**Solution:**
1. Set `CORS_ORIGIN` in `.env` to your frontend URL
2. Default: `http://localhost:5173`
3. For production, set to your domain

---

## 📊 Environment Variables Explained

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | `development` |
| `PORT` | Server port | No | `5000` |
| `MONGODB_URI` | MongoDB connection | Yes | - |
| `JWT_SECRET` | JWT signing key | Yes | - |
| `JWT_EXPIRES_IN` | Token expiry | No | `7d` |
| `CORS_ORIGIN` | Frontend URL | Yes | `http://localhost:5173` |
| `CLOUDINARY_*` | File upload | No | - |
| `SMTP_*` | Email service | No | - |

---

## 🚀 Next Steps

1. ✅ Backend is running
2. [ ] Test all API endpoints (see `API_SAMPLES.md`)
3. [ ] Connect your frontend
4. [ ] (Optional) Set up Cloudinary for file uploads
5. [ ] (Optional) Configure email notifications
6. [ ] Deploy to production

---

## 📚 Additional Resources

- **Full API Documentation**: `README.md`
- **Sample API Requests**: `API_SAMPLES.md`
- **Business Flow**: `FLOW_DOCUMENTATION.md`
- **MongoDB Docs**: [https://docs.mongodb.com](https://docs.mongodb.com)
- **Express.js Docs**: [https://expressjs.com](https://expressjs.com)
- **Mongoose Docs**: [https://mongoosejs.com](https://mongoosejs.com)

---

## 💡 Pro Tips

1. **Use Environment Variables**: Never commit `.env` to Git
2. **Use Postman**: Import API_SAMPLES.md into Postman for testing
3. **Check Logs**: Watch console for errors and requests
4. **Use MongoDB Compass**: Visual tool for viewing database
5. **Enable Hot Reload**: `npm run dev` auto-restarts on changes

---

## 🎯 Quick Reference

**API Base URL:** `http://localhost:5000/api/v1`

**Key Endpoints:**
- Auth: `/auth/login`, `/auth/register`
- Jobs: `/jobs`, `/jobs/recommended`
- Applications: `/applications/apply`
- Assessments: `/assessments/:id/submit`
- Notifications: `/notifications`

**Default Users:**
- Admin: `admin@test.com` / `admin123`
- Create students and professionals via `/auth/register`

---

## ✨ You're All Set!

Your PlacementOS backend is ready to handle:
- ✅ 45+ API endpoints
- ✅ 3 user roles
- ✅ 24 application statuses
- ✅ Real-time notifications
- ✅ ATS scoring
- ✅ Assessment engine
- ✅ Interview management

**Start building amazing placement experiences!** 🚀

---

**Need Help?** Check the documentation files or create an issue in the repository.

**Happy Coding!** 💻
