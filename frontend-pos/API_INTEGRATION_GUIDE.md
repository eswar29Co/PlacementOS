# PlacementOS - Backend Integration Guide

## 🎯 Overview

This guide explains how to integrate the PlacementOS frontend with the backend API.

## 📋 Prerequisites

- ✅ Backend server running on `http://localhost:5000`
- ✅ MongoDB running locally or configured
- ✅ Frontend dependencies installed

## 🚀 Quick Setup

### Step 1: Install Required Dependencies

```bash
cd frontend-pos
npm install axios
```

### Step 2: Environment Configuration

The `.env` file is already created with the following configuration:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_ENV=development
```

### Step 3: Verify Backend is Running

Make sure your backend server is running:

```bash
# In backend-pos directory
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
Server running at: http://localhost:5000
```

### Step 4: Start Frontend

```bash
# In frontend-pos directory
npm run dev
```

## 📁 API Services Structure

The integration is organized into service modules:

```
frontend-pos/src/services/
├── api.ts                    # Axios client with interceptors
├── authService.ts            # Authentication endpoints
├── jobService.ts             # Job management endpoints
├── applicationService.ts     # Application workflow endpoints
├── assessmentService.ts      # Assessment endpoints
├── notificationService.ts    # Notification endpoints
├── professionalService.ts    # Professional management endpoints
├── dashboardService.ts       # Dashboard statistics endpoints
└── index.ts                  # Export all services
```

## 🔌 Available Services

### 1. **Auth Service** (`authService`)

```typescript
import { authService } from '@/services';

// Register
await authService.register({
  role: 'student',
  email: 'student@test.com',
  password: 'password123',
  name: 'John Doe',
  // ... other fields
});

// Login
await authService.login({
  email: 'student@test.com',
  password: 'password123',
  role: 'student'
});

// Get Profile
await authService.getProfile();

// Update Profile
await authService.updateProfile({ name: 'Jane Doe' });

// Logout
authService.logout();
```

### 2. **Job Service** (`jobService`)

```typescript
import { jobService } from '@/services';

// Get all jobs
await jobService.getAllJobs();

// Get recommended jobs (for students)
await jobService.getRecommendedJobs();

// Get job by ID
await jobService.getJobById('job-id');

// Create job (admin)
await jobService.createJob({
  companyName: 'Google',
  roleTitle: 'Software Engineer',
  // ... other fields
});

// Update job (admin)
await jobService.updateJob('job-id', { isActive: true });

// Delete job (admin)
await jobService.deleteJob('job-id');
```

### 3. **Application Service** (`applicationService`)

```typescript
import { applicationService } from '@/services';

// Apply for job
await applicationService.applyForJob({
  jobId: 'job-id',
  resumeUrl: 'https://...',
  coverLetter: '...'
});

// Get my applications
await applicationService.getMyApplications();

// Get all applications (admin)
await applicationService.getAllApplications();

// Update application status (admin)
await applicationService.updateApplicationStatus('app-id', {
  status: 'resume_approved',
  notes: 'Good resume'
});

// Shortlist resumes (admin)
await applicationService.shortlistResumes('job-id');

// Assign professional (admin)
await applicationService.assignProfessional({
  applicationId: 'app-id',
  professionalId: 'prof-id',
  round: 'professional'
});

// Schedule interview
await applicationService.scheduleInterview({
  applicationId: 'app-id',
  scheduledDate: new Date(),
  zoomLink: 'https://zoom.us/...'
});

// Submit interview feedback (professional)
await applicationService.submitInterviewFeedback({
  applicationId: 'app-id',
  round: 'professional',
  rating: 4,
  comments: 'Good candidate',
  recommendation: 'Pass'
});
```

### 4. **Assessment Service** (`assessmentService`)

```typescript
import { assessmentService } from '@/services';

// Release assessment (admin)
await assessmentService.releaseAssessment('app-id');

// Get assessment
await assessmentService.getAssessmentByApplicationId('app-id');

// Start assessment (student)
await assessmentService.startAssessment('assessment-id');

// Submit assessment (student)
await assessmentService.submitAssessment('assessment-id', {
  mcqAnswers: [0, 2, 1, 3, ...],
  codingAnswer: 'function solution() { ... }'
});

// Review assessment (admin)
await assessmentService.reviewAssessment('assessment-id', {
  passed: true,
  notes: 'Great performance'
});
```

### 5. **Notification Service** (`notificationService`)

```typescript
import { notificationService } from '@/services';

// Get all notifications
await notificationService.getNotifications();

// Get unread count
await notificationService.getUnreadCount();

// Mark as read
await notificationService.markAsRead('notification-id');

// Mark all as read
await notificationService.markAllAsRead();

// Delete notification
await notificationService.deleteNotification('notification-id');
```

### 6. **Professional Service** (`professionalService`)

```typescript
import { professionalService } from '@/services';

// Get all professionals (admin)
await professionalService.getAllProfessionals();

// Get pending professionals (admin)
await professionalService.getPendingProfessionals();

// Get available professionals (admin)
await professionalService.getAvailableProfessionals({
  round: 'professional',
  requiredSkills: ['Java', 'Spring Boot']
});

// Update professional status (admin)
await professionalService.updateProfessionalStatus('prof-id', {
  status: 'approved',
  notes: 'Qualified'
});
```

### 7. **Dashboard Service** (`dashboardService`)

```typescript
import { dashboardService } from '@/services';

// Get dashboard stats (role-specific)
await dashboardService.getDashboardStats();
```

## 🔒 Authentication Flow

### Token Management

The API client automatically handles JWT tokens:

1. **Login**: Token is stored in `localStorage` after successful login
2. **Requests**: Token is automatically attached to all API requests via interceptor
3. **Unauthorized**: If 401 error occurs, user is redirected to login and token is cleared
4. **Logout**: Token is removed from `localStorage`

### Using in Redux Actions

Example of integrating with Redux:

```typescript
// In authSlice.ts
import { authService } from '@/services';

export const loginUser = (credentials) => async (dispatch) => {
  try {
    const response = await authService.login(credentials);
    
    dispatch(setUser(response.data.user));
    dispatch(setToken(response.data.token));
    
    return response;
  } catch (error) {
    throw error;
  }
};
```

## 🧪 Testing the Integration

### 1. Test Authentication

```typescript
// Login
const response = await authService.login({
  email: 'admin@placementos.com',
  password: 'admin123',
  role: 'admin'
});

console.log('Logged in:', response.data.user);
```

### 2. Test Job Fetching

```typescript
// Get all jobs
const jobs = await jobService.getAllJobs();
console.log('Jobs:', jobs.data);
```

### 3. Test Application Creation

```typescript
// Apply for job
const application = await applicationService.applyForJob({
  jobId: 'some-job-id',
  resumeUrl: 'https://example.com/resume.pdf'
});

console.log('Application created:', application.data);
```

## 🚨 Error Handling

All services include error handling:

```typescript
try {
  const response = await jobService.getAllJobs();
  // Handle success
} catch (error) {
  // Error message is automatically extracted
  console.error('Error:', error.message);
  
  // Show toast notification
  toast.error(error.message);
}
```

## 🔄 Migration from Mock Data to API

### Before (Mock Data):

```typescript
// Old way - using Redux store with mock data
const { jobs } = useAppSelector((state) => state.jobs);
```

### After (API Integration):

```typescript
// New way - fetch from API
import { jobService } from '@/services';
import { useEffect, useState } from 'react';

const [jobs, setJobs] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchJobs = async () => {
    try {
      const response = await jobService.getAllJobs();
      setJobs(response.data);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };
  
  fetchJobs();
}, []);
```

## 📝 Backend API Endpoints

All endpoints are prefixed with `/api/v1`:

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user
- `PUT /auth/profile` - Update profile

### Jobs
- `GET /jobs` - Get all jobs
- `GET /jobs/recommended` - Get recommended jobs
- `GET /jobs/:id` - Get job by ID
- `POST /jobs` - Create job (admin)
- `PUT /jobs/:id` - Update job (admin)
- `DELETE /jobs/:id` - Delete job (admin)
- `PATCH /jobs/:id/toggle-status` - Toggle job status
- `GET /jobs/statistics` - Get job statistics

### Applications
- `POST /applications/apply` - Apply for job
- `GET /applications` - Get all applications
- `GET /applications/my-applications` - Get my applications
- `GET /applications/:id` - Get application by ID
- `PATCH /applications/:id/status` - Update application status
- `POST /applications/shortlist-resumes/:jobId` - Shortlist resumes
- `POST /applications/assign-professional` - Assign professional
- `POST /applications/schedule-interview` - Schedule interview
- `POST /applications/interview-feedback` - Submit interview feedback

### Assessments
- `GET /assessments/application/:applicationId` - Get assessment
- `POST /assessments/release/:applicationId` - Release assessment
- `POST /assessments/:id/start` - Start assessment
- `POST /assessments/:id/submit` - Submit assessment
- `POST /assessments/:id/review` - Review assessment

### Notifications
- `GET /notifications` - Get all notifications
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/mark-all-read` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

### Professionals
- `GET /professionals` - Get all professionals
- `GET /professionals/pending` - Get pending professionals
- `GET /professionals/available` - Get available professionals
- `PATCH /professionals/:id/status` - Update professional status

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics

## 🎨 UI Integration Tips

### Loading States

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await jobService.createJob(jobData);
    toast.success('Job created successfully!');
  } catch (error) {
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Optimistic Updates

```typescript
// Update UI immediately, then sync with backend
const handleDelete = async (jobId) => {
  // Remove from UI
  dispatch(removeJob(jobId));
  
  try {
    // Sync with backend
    await jobService.deleteJob(jobId);
    toast.success('Job deleted');
  } catch (error) {
    // Rollback on error
    dispatch(addJob(originalJob));
    toast.error('Failed to delete job');
  }
};
```

## 🔧 Troubleshooting

### CORS Issues

If you see CORS errors, make sure the backend `.env` has:
```env
CORS_ORIGIN=http://localhost:8080
```

### 401 Unauthorized

- Check if token is stored: `localStorage.getItem('token')`
- Verify token is valid by checking JWT expiry
- Re-login to get a fresh token

### Network Errors

- Verify backend is running: `curl http://localhost:5000/health`
- Check MongoDB is running
- Verify firewall/antivirus isn't blocking connections

## 🚀 Next Steps

1. ✅ Install axios: `npm install axios`
2. ✅ Start backend server
3. ✅ Start frontend server
4. 🔄 Update Redux actions to use API services
5. 🔄 Replace mock data with API calls
6. 🔄 Test all user flows end-to-end

## 📞 Support

For issues:
1. Check backend logs in terminal
2. Check browser console for errors
3. Verify API endpoints in `SETUP_GUIDE.md`
4. Test endpoints with curl or Postman

---

**Backend Status**: ✅ Running on `http://localhost:5000`

**Frontend Status**: Ready for integration

**Next**: Install axios and start connecting components!
