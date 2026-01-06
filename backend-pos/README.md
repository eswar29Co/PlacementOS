# PlacementOS Backend API

Complete backend API for PlacementOS - A comprehensive placement management system with multi-stage interview process, assessment engine, and real-time notifications.

## 🚀 Features

- ✅ **Multi-Role Authentication** (Student, Professional, Admin)
- ✅ **Job Management** with skill-based recommendations
- ✅ **Multi-Stage Application Flow**
  - Resume Submission & ATS Scoring
  - Assessment (20 MCQs + 1 Coding Question)
  - AI Interview (Preliminary Round)
  - Technical Round
  - Manager Round
  - HR Round
  - Offer Management
- ✅ **Professional Assignment & Interview Scheduling**
- ✅ **Real-time Notification System**
- ✅ **Role-based Dashboards**
- ✅ **File Upload Support** (Resumes, Documents)
- ✅ **RESTful API Architecture**

## 📋 Prerequisites

- **Node.js** >= 18.x
- **MongoDB** >= 5.x
- **npm** or **yarn**

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd backend-pos
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/placementos

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# ATS Configuration
ATS_PASSING_SCORE=60

# Assessment Configuration
ASSESSMENT_DURATION_MINUTES=60
MCQ_COUNT=20
CODING_QUESTION_COUNT=1
```

### 3. Start MongoDB

Make sure MongoDB is running:

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongodb
```

### 4. Run the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

The server will start at `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "role": "student", // or "professional", "admin"
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  // Student specific fields
  "college": "MIT",
  "degree": "B.Tech",
  "branch": "Computer Science",
  "cgpa": 8.5,
  "graduationYear": 2024,
  "skills": ["JavaScript", "React", "Node.js"]
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### Get Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/v1/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "skills": ["JavaScript", "TypeScript", "React"],
  "linkedinUrl": "https://linkedin.com/in/johndoe"
}
```

---

## 💼 Job Endpoints

### Get All Jobs
```http
GET /api/v1/jobs?page=1&limit=10&isActive=true&search=developer
```

### Get Job by ID
```http
GET /api/v1/jobs/:id
```

### Get Recommended Jobs (Student)
```http
GET /api/v1/jobs/recommended
Authorization: Bearer <student-token>
```

### Create Job (Admin)
```http
POST /api/v1/jobs
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "companyName": "Tech Corp",
  "roleTitle": "Software Engineer",
  "ctcBand": "10-15 LPA",
  "locationType": "Hybrid",
  "description": "We are looking for...",
  "requirements": ["3+ years experience", "Strong in React"],
  "skills": ["JavaScript", "React", "Node.js"],
  "requiredTechStack": ["React", "TypeScript"],
  "deadline": "2024-12-31",
  "selectionProcess": ["Resume Review", "Assessment", "Technical Interview"]
}
```

### Update Job (Admin)
```http
PUT /api/v1/jobs/:id
Authorization: Bearer <admin-token>
```

### Delete Job (Admin)
```http
DELETE /api/v1/jobs/:id
Authorization: Bearer <admin-token>
```

---

## 📝 Application Endpoints

### Apply for Job (Student)
```http
POST /api/v1/applications/apply
Authorization: Bearer <student-token>
Content-Type: application/json

{
  "jobId": "job-id",
  "resumeUrl": "https://cloudinary.com/resume.pdf"
}
```

### Get All Applications (Admin)
```http
GET /api/v1/applications?status=applied&page=1&limit=10
Authorization: Bearer <admin-token>
```

### Get My Applications (Student)
```http
GET /api/v1/applications/my-applications
Authorization: Bearer <student-token>
```

### Get Assigned Applications (Professional)
```http
GET /api/v1/applications/assigned
Authorization: Bearer <professional-token>
```

### Update Application Status (Admin)
```http
PUT /api/v1/applications/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "resume_shortlisted",
  "notes": "Resume approved",
  "resumeScore": 75
}
```

### Shortlist Resumes (Admin)
```http
POST /api/v1/applications/shortlist-resumes
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "applicationIds": ["app-id-1", "app-id-2"],
  "passingScore": 60
}
```

### Assign Professional (Admin)
```http
POST /api/v1/applications/:id/assign-professional
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "professionalId": "professional-id",
  "round": "professional" // or "manager", "hr"
}
```

### Schedule Interview (Professional)
```http
POST /api/v1/applications/:id/schedule-interview
Authorization: Bearer <professional-token>
Content-Type: application/json

{
  "meetingLink": "https://zoom.us/j/123456",
  "scheduledDate": "2024-02-15T10:00:00Z"
}
```

### Submit Interview Feedback (Professional)
```http
POST /api/v1/applications/:id/interview-feedback
Authorization: Bearer <professional-token>
Content-Type: application/json

{
  "rating": 4.5,
  "comments": "Great technical skills",
  "strengths": "Problem solving",
  "weaknesses": "Communication",
  "improvementAreas": ["System design"],
  "recommendation": "Strongly Recommend"
}
```

---

## 📊 Assessment Endpoints

### Release Assessment (Admin)
```http
POST /api/v1/assessments/release
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "applicationId": "app-id",
  "duration": 60
}
```

### Get My Assessments (Student)
```http
GET /api/v1/assessments/my-assessments
Authorization: Bearer <student-token>
```

### Get Assessment (Student)
```http
GET /api/v1/assessments/:id
Authorization: Bearer <student-token>
```

### Start Assessment (Student)
```http
POST /api/v1/assessments/:id/start
Authorization: Bearer <student-token>
```

### Submit Assessment (Student)
```http
POST /api/v1/assessments/:id/submit
Authorization: Bearer <student-token>
Content-Type: application/json

{
  "mcqAnswers": [1, 0, 2, 1, 0, ...], // Array of 20 indices
  "codingAnswer": "function twoSum(nums, target) { ... }"
}
```

### Review Assessment Results (Admin)
```http
POST /api/v1/assessments/review
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "assessmentIds": ["assessment-id-1", "assessment-id-2"],
  "passingScore": 60
}
```

---

## 👥 Professional Endpoints

### Get All Professionals (Admin)
```http
GET /api/v1/professionals?status=approved&page=1&limit=10
Authorization: Bearer <admin-token>
```

### Get Pending Professionals (Admin)
```http
GET /api/v1/professionals/pending
Authorization: Bearer <admin-token>
```

### Get Available Professionals (Admin)
```http
GET /api/v1/professionals/available?round=professional
Authorization: Bearer <admin-token>
```

### Update Professional Status (Admin)
```http
PUT /api/v1/professionals/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "approved" // or "rejected"
}
```

---

## 🔔 Notification Endpoints

### Get Notifications
```http
GET /api/v1/notifications?read=false&limit=50
Authorization: Bearer <token>
```

### Get Unread Count
```http
GET /api/v1/notifications/unread-count
Authorization: Bearer <token>
```

### Mark as Read
```http
PUT /api/v1/notifications/:id/read
Authorization: Bearer <token>
```

### Mark All as Read
```http
PUT /api/v1/notifications/mark-all-read
Authorization: Bearer <token>
```

### Delete Notification
```http
DELETE /api/v1/notifications/:id
Authorization: Bearer <token>
```

---

## 📊 Dashboard Endpoints

### Get Dashboard Stats
```http
GET /api/v1/dashboard/stats
Authorization: Bearer <token>
```

Returns role-specific statistics:
- **Admin**: Jobs, applications, students, professionals stats
- **Student**: Application status, active applications
- **Professional**: Assigned interviews, completed interviews

---

## 🔄 Application Status Flow

1. **applied** → Resume submitted
2. **resume_under_review** → Admin reviewing resume
3. **resume_shortlisted** → Resume passed ATS check (score ≥ 60)
4. **resume_rejected** → Resume failed ATS check
5. **assessment_pending** → Assessment released
6. **assessment_in_progress** → Student taking assessment
7. **assessment_submitted** → Assessment completed
8. **assessment_approved** → Assessment passed
9. **assessment_rejected** → Assessment failed
10. **ai_interview_pending** → AI preliminary interview
11. **ai_interview_completed** → AI interview done
12. **professional_interview_pending** → Assigned to technical interviewer
13. **professional_interview_scheduled** → Interview scheduled
14. **professional_interview_completed** → Technical round completed
15. **manager_round_pending** → Moving to manager round
16. **manager_interview_scheduled** → Manager interview scheduled
17. **manager_round_completed** → Manager round completed
18. **hr_round_pending** → Moving to HR round
19. **hr_interview_scheduled** → HR interview scheduled
20. **hr_round_completed** → HR round completed
21. **offer_released** → Offer released
22. **offer_accepted** → Student accepted offer
23. **offer_rejected** → Student rejected offer
24. **rejected** → Application rejected at any stage

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Test Authentication
```bash
# Register a student
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "student",
    "name": "Test Student",
    "email": "student@test.com",
    "password": "password123",
    "college": "Test College",
    "degree": "B.Tech",
    "cgpa": 8.0,
    "graduationYear": 2024,
    "skills": ["JavaScript", "React"]
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "password123",
    "role": "student"
  }'
```

---

## 📁 Project Structure

```
backend-pos/
├── src/
│   ├── config/
│   │   ├── index.ts          # Configuration
│   │   └── database.ts       # MongoDB connection
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── jobController.ts
│   │   ├── applicationController.ts
│   │   ├── assessmentController.ts
│   │   ├── professionalController.ts
│   │   ├── notificationController.ts
│   │   └── dashboardController.ts
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication
│   │   └── errorHandler.ts  # Error handling
│   ├── models/
│   │   ├── Student.ts
│   │   ├── Professional.ts
│   │   ├── Admin.ts
│   │   ├── Job.ts
│   │   ├── Application.ts
│   │   ├── Assessment.ts
│   │   └── Notification.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── jobRoutes.ts
│   │   ├── applicationRoutes.ts
│   │   ├── assessmentRoutes.ts
│   │   ├── professionalRoutes.ts
│   │   ├── notificationRoutes.ts
│   │   └── dashboardRoutes.ts
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   ├── utils/
│   │   ├── jwt.ts            # JWT utilities
│   │   ├── ApiResponse.ts    # API response helper
│   │   └── atsScoring.ts     # ATS scoring logic
│   └── server.ts             # Entry point
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── nodemon.json
└── README.md
```

---

## 🔧 Key Technologies

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **pdf-parse** - Resume parsing
- **natural** - NLP for ATS scoring
- **Cloudinary** - File storage (optional)

---

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
Ensure all production environment variables are set:
- Use strong JWT secrets
- Set `NODE_ENV=production`
- Configure proper CORS origins
- Set up MongoDB Atlas or production database
- Configure cloud storage (Cloudinary)
- Set up email service

---

## 🤝 Integration with Frontend

The frontend should make API calls to:
```typescript
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Example: Login
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    role: 'student',
  }),
});

const data = await response.json();
const token = data.data.token;

// Store token and use in subsequent requests
localStorage.setItem('token', token);

// Example: Get jobs with authentication
const jobsResponse = await fetch(`${API_BASE_URL}/jobs`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

---

## 📝 License

MIT

---

## 👨‍💻 Support

For issues or questions:
- Create an issue in the repository
- Contact: support@placementos.com

---

**Happy Coding! 🚀**
