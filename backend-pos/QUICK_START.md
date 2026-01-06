# PlacementOS Backend - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd backend-pos
npm install
```

### Step 2: Set Up Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and update these required fields:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (any random secret key)
# - CORS_ORIGIN (your frontend URL, default: http://localhost:5173)
```

### Step 3: Start MongoDB
```bash
# Make sure MongoDB is running
# Windows: Start MongoDB service
# Mac/Linux: sudo systemctl start mongodb
```

### Step 4: Run the Server
```bash
npm run dev
```

Your API server will be running at: **http://localhost:5000**

---

## 📝 Test the API

### 1. Check Health
```bash
curl http://localhost:5000/health
```

### 2. Register Admin User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin",
    "name": "Admin User",
    "email": "admin@placementos.com",
    "password": "admin123"
  }'
```

### 3. Login as Admin
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@placementos.com",
    "password": "admin123",
    "role": "admin"
  }'
```

Copy the `token` from the response and use it in subsequent requests.

### 4. Create a Job (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "companyName": "Tech Corp",
    "roleTitle": "Software Engineer",
    "ctcBand": "10-15 LPA",
    "locationType": "Hybrid",
    "description": "We are looking for talented engineers",
    "requirements": ["3+ years experience"],
    "skills": ["JavaScript", "React", "Node.js"],
    "requiredTechStack": ["React", "Node.js"],
    "deadline": "2024-12-31"
  }'
```

### 5. Register a Student
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "student",
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "college": "MIT",
    "degree": "B.Tech",
    "branch": "Computer Science",
    "cgpa": 8.5,
    "graduationYear": 2024,
    "skills": ["JavaScript", "React", "Node.js"]
  }'
```

### 6. Get Recommended Jobs (Student)
```bash
curl http://localhost:5000/api/v1/jobs/recommended \
  -H "Authorization: Bearer STUDENT_TOKEN_HERE"
```

---

## 🔧 Common Commands

```bash
# Development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

---

## 📚 Next Steps

1. **Read the full README.md** for detailed API documentation
2. **Configure Cloudinary** (optional) for file uploads
3. **Set up email service** (optional) for notifications
4. **Connect your frontend** to the API

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Default URI: `mongodb://localhost:27017/placementos`

### Port Already in Use
- Change PORT in .env file (default: 5000)
- Or kill the process using the port

### JWT Token Invalid
- Make sure JWT_SECRET is set in .env
- Token expires in 7 days by default

---

## 📞 API Endpoints Overview

| Category | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| **Auth** | POST | `/api/v1/auth/register` | Register user |
| | POST | `/api/v1/auth/login` | Login |
| | GET | `/api/v1/auth/profile` | Get profile |
| **Jobs** | GET | `/api/v1/jobs` | List jobs |
| | POST | `/api/v1/jobs` | Create job (Admin) |
| | GET | `/api/v1/jobs/recommended` | Recommended jobs (Student) |
| **Applications** | POST | `/api/v1/applications/apply` | Apply for job |
| | GET | `/api/v1/applications/my-applications` | My applications |
| | POST | `/api/v1/applications/:id/assign-professional` | Assign interviewer |
| **Assessments** | POST | `/api/v1/assessments/release` | Release assessment |
| | POST | `/api/v1/assessments/:id/submit` | Submit assessment |
| **Notifications** | GET | `/api/v1/notifications` | Get notifications |
| **Dashboard** | GET | `/api/v1/dashboard/stats` | Dashboard stats |

---

## ✅ You're All Set!

Your PlacementOS backend is now running. Start building amazing placement experiences! 🚀
