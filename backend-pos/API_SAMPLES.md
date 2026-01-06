# PlacementOS API - Sample Requests Collection

This file contains sample API requests for testing all endpoints using cURL or REST clients like Postman/Insomnia.

## 🔧 Setup

Replace `YOUR_TOKEN` with actual JWT tokens obtained from login.

Base URL: `http://localhost:5000/api/v1`

---

## 👤 Authentication

### 1. Register Admin
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin",
    "name": "Admin User",
    "email": "admin@placementos.com",
    "password": "admin123",
    "phone": "+1234567890"
  }'
```

### 2. Register Student
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "student",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "password123",
    "college": "MIT",
    "degree": "B.Tech",
    "branch": "Computer Science",
    "cgpa": 8.5,
    "graduationYear": 2024,
    "skills": ["JavaScript", "React", "Node.js", "Python", "MongoDB"],
    "linkedinUrl": "https://linkedin.com/in/alice",
    "githubUrl": "https://github.com/alice",
    "phone": "+1234567891"
  }'
```

### 3. Register Professional
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "professional",
    "name": "Bob Smith",
    "email": "bob@tech.com",
    "password": "password123",
    "professionalRole": "Technical",
    "company": "Tech Giants Inc",
    "designation": "Senior Engineer",
    "yearsOfExperience": 8,
    "experience": 8,
    "techStack": ["JavaScript", "React", "Node.js", "AWS"],
    "expertise": ["System Design", "Microservices"],
    "linkedinUrl": "https://linkedin.com/in/bob",
    "bio": "Passionate about building scalable systems",
    "phone": "+1234567892"
  }'
```

### 4. Login as Admin
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@placementos.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### 5. Login as Student
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### 6. Login as Professional
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@tech.com",
    "password": "password123",
    "role": "professional"
  }'
```

### 7. Get My Profile
```bash
curl http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. Update Profile
```bash
curl -X PUT http://localhost:5000/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "skills": ["JavaScript", "TypeScript", "React", "Node.js", "GraphQL"],
    "githubUrl": "https://github.com/alice-updated"
  }'
```

---

## 💼 Jobs

### 1. Create Job (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "companyName": "TechCorp Solutions",
    "roleTitle": "Full Stack Developer",
    "ctcBand": "10-15 LPA",
    "locationType": "Hybrid",
    "description": "We are looking for talented full-stack developers to join our team.",
    "requirements": [
      "3+ years of experience in web development",
      "Strong problem-solving skills",
      "Excellent communication"
    ],
    "skills": ["JavaScript", "React", "Node.js", "MongoDB", "AWS"],
    "requiredTechStack": ["React", "Node.js", "MongoDB"],
    "deadline": "2024-12-31",
    "selectionProcess": [
      "Resume Screening",
      "Assessment",
      "Technical Interview",
      "Manager Round",
      "HR Round"
    ],
    "package": "12 LPA + Benefits"
  }'
```

### 2. Create Another Job
```bash
curl -X POST http://localhost:5000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "companyName": "DataMinds AI",
    "roleTitle": "Python Data Engineer",
    "ctcBand": "12-18 LPA",
    "locationType": "Remote",
    "description": "Join our AI team to build cutting-edge data pipelines.",
    "requirements": [
      "5+ years Python experience",
      "ML/AI knowledge",
      "Big Data technologies"
    ],
    "skills": ["Python", "SQL", "Apache Spark", "TensorFlow", "Docker"],
    "requiredTechStack": ["Python", "Apache Spark", "Docker"],
    "deadline": "2024-11-30",
    "selectionProcess": ["Resume", "Assessment", "Technical", "Manager"],
    "package": "15 LPA"
  }'
```

### 3. Get All Jobs
```bash
curl "http://localhost:5000/api/v1/jobs?page=1&limit=10&isActive=true"
```

### 4. Search Jobs
```bash
curl "http://localhost:5000/api/v1/jobs?search=developer&locationType=Hybrid"
```

### 5. Get Job by ID
```bash
curl http://localhost:5000/api/v1/jobs/JOB_ID
```

### 6. Get Recommended Jobs (Student)
```bash
curl http://localhost:5000/api/v1/jobs/recommended \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### 7. Update Job (Admin)
```bash
curl -X PUT http://localhost:5000/api/v1/jobs/JOB_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "isActive": false,
    "deadline": "2024-10-31"
  }'
```

### 8. Get Job Statistics (Admin)
```bash
curl http://localhost:5000/api/v1/jobs/statistics \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 📝 Applications

### 1. Apply for Job (Student)
```bash
curl -X POST http://localhost:5000/api/v1/applications/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -d '{
    "jobId": "JOB_ID",
    "resumeUrl": "https://cloudinary.com/resumes/alice-resume.pdf"
  }'
```

### 2. Get My Applications (Student)
```bash
curl http://localhost:5000/api/v1/applications/my-applications \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### 3. Get All Applications (Admin)
```bash
curl "http://localhost:5000/api/v1/applications?status=applied&page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 4. Get Application by ID
```bash
curl http://localhost:5000/api/v1/applications/APPLICATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Update Application Status (Admin)
```bash
curl -X PUT http://localhost:5000/api/v1/applications/APPLICATION_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "resume_under_review",
    "notes": "Resume received and under review",
    "resumeScore": 75
  }'
```

### 6. Shortlist Resumes (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/applications/shortlist-resumes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "applicationIds": ["APP_ID_1", "APP_ID_2", "APP_ID_3"],
    "passingScore": 60
  }'
```

### 7. Assign Professional to Technical Round (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/applications/APPLICATION_ID/assign-professional \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "professionalId": "PROFESSIONAL_ID",
    "round": "professional"
  }'
```

### 8. Assign Manager (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/applications/APPLICATION_ID/assign-professional \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "professionalId": "MANAGER_ID",
    "round": "manager"
  }'
```

### 9. Assign HR (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/applications/APPLICATION_ID/assign-professional \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "professionalId": "HR_ID",
    "round": "hr"
  }'
```

### 10. Get Assigned Applications (Professional)
```bash
curl http://localhost:5000/api/v1/applications/assigned \
  -H "Authorization: Bearer PROFESSIONAL_TOKEN"
```

### 11. Schedule Interview (Professional)
```bash
curl -X POST http://localhost:5000/api/v1/applications/APPLICATION_ID/schedule-interview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PROFESSIONAL_TOKEN" \
  -d '{
    "meetingLink": "https://zoom.us/j/123456789?pwd=abcdef",
    "scheduledDate": "2024-02-20T15:00:00Z"
  }'
```

### 12. Submit Interview Feedback (Professional)
```bash
curl -X POST http://localhost:5000/api/v1/applications/APPLICATION_ID/interview-feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PROFESSIONAL_TOKEN" \
  -d '{
    "rating": 4.5,
    "comments": "Strong technical skills and problem-solving ability. Good communication.",
    "strengths": "Data structures, algorithms, system design thinking",
    "weaknesses": "Could improve on explaining thought process",
    "improvementAreas": ["System design depth", "Code optimization"],
    "recommendation": "Strongly Recommend"
  }'
```

---

## 📊 Assessments

### 1. Release Assessment (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/assessments/release \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "applicationId": "APPLICATION_ID",
    "duration": 60
  }'
```

### 2. Get My Assessments (Student)
```bash
curl http://localhost:5000/api/v1/assessments/my-assessments \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### 3. Get Assessment (Student)
```bash
curl http://localhost:5000/api/v1/assessments/ASSESSMENT_ID \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### 4. Start Assessment (Student)
```bash
curl -X POST http://localhost:5000/api/v1/assessments/ASSESSMENT_ID/start \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### 5. Submit Assessment (Student)
```bash
curl -X POST http://localhost:5000/api/v1/assessments/ASSESSMENT_ID/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -d '{
    "mcqAnswers": [1, 0, 2, 1, 0, 3, 2, 1, 0, 2, 1, 3, 0, 2, 1, 0, 2, 3, 1, 0],
    "codingAnswer": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}"
  }'
```

### 6. Review Assessment Results (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/assessments/review \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "assessmentIds": ["ASSESSMENT_ID_1", "ASSESSMENT_ID_2"],
    "passingScore": 60
  }'
```

---

## 👥 Professionals

### 1. Get All Professionals (Admin)
```bash
curl "http://localhost:5000/api/v1/professionals?status=approved&page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 2. Get Pending Professionals (Admin)
```bash
curl http://localhost:5000/api/v1/professionals/pending \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 3. Get Available Professionals (Admin)
```bash
curl "http://localhost:5000/api/v1/professionals/available?round=professional" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 4. Approve Professional (Admin)
```bash
curl -X PUT http://localhost:5000/api/v1/professionals/PROFESSIONAL_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "approved"
  }'
```

### 5. Reject Professional (Admin)
```bash
curl -X PUT http://localhost:5000/api/v1/professionals/PROFESSIONAL_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "rejected"
  }'
```

### 6. Get Professional Statistics
```bash
curl http://localhost:5000/api/v1/professionals/PROFESSIONAL_ID/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔔 Notifications

### 1. Get My Notifications
```bash
curl http://localhost:5000/api/v1/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Get Unread Notifications
```bash
curl "http://localhost:5000/api/v1/notifications?read=false" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Unread Count
```bash
curl http://localhost:5000/api/v1/notifications/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Mark Notification as Read
```bash
curl -X PUT http://localhost:5000/api/v1/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Mark All as Read
```bash
curl -X PUT http://localhost:5000/api/v1/notifications/mark-all-read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Delete Notification
```bash
curl -X DELETE http://localhost:5000/api/v1/notifications/NOTIFICATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Dashboard

### 1. Get Dashboard Stats (Role-based)
```bash
# Admin Dashboard
curl http://localhost:5000/api/v1/dashboard/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Student Dashboard
curl http://localhost:5000/api/v1/dashboard/stats \
  -H "Authorization: Bearer STUDENT_TOKEN"

# Professional Dashboard
curl http://localhost:5000/api/v1/dashboard/stats \
  -H "Authorization: Bearer PROFESSIONAL_TOKEN"
```

---

## 🧪 Complete Test Workflow

### Scenario: Student applies for a job and completes interview process

```bash
# 1. Admin creates a job
ADMIN_TOKEN="..." # Get from admin login
curl -X POST http://localhost:5000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"companyName":"TestCorp","roleTitle":"Developer","ctcBand":"10-12 LPA","locationType":"Remote","description":"Test job","requirements":["3+ years"],"skills":["JavaScript","React"],"requiredTechStack":["React"],"deadline":"2024-12-31"}'

JOB_ID="..." # Copy from response

# 2. Student applies
STUDENT_TOKEN="..." # Get from student login
curl -X POST http://localhost:5000/api/v1/applications/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d "{\"jobId\":\"$JOB_ID\",\"resumeUrl\":\"https://example.com/resume.pdf\"}"

APPLICATION_ID="..." # Copy from response

# 3. Admin shortlists resume
curl -X PUT http://localhost:5000/api/v1/applications/$APPLICATION_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status":"resume_shortlisted","resumeScore":75}'

# 4. Admin releases assessment
curl -X POST http://localhost:5000/api/v1/assessments/release \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{\"applicationId\":\"$APPLICATION_ID\",\"duration\":60}"

ASSESSMENT_ID="..." # Copy from response

# 5. Student starts and submits assessment
curl -X POST http://localhost:5000/api/v1/assessments/$ASSESSMENT_ID/start \
  -H "Authorization: Bearer $STUDENT_TOKEN"

curl -X POST http://localhost:5000/api/v1/assessments/$ASSESSMENT_ID/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{"mcqAnswers":[1,0,2,1,0,3,2,1,0,2,1,3,0,2,1,0,2,3,1,0],"codingAnswer":"function solution() { return true; }"}'

# 6. Admin assigns professional
PROFESSIONAL_ID="..." # Get professional ID
curl -X POST http://localhost:5000/api/v1/applications/$APPLICATION_ID/assign-professional \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{\"professionalId\":\"$PROFESSIONAL_ID\",\"round\":\"professional\"}"

# 7. Professional schedules interview
PROFESSIONAL_TOKEN="..." # Get from professional login
curl -X POST http://localhost:5000/api/v1/applications/$APPLICATION_ID/schedule-interview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROFESSIONAL_TOKEN" \
  -d '{"meetingLink":"https://zoom.us/j/123","scheduledDate":"2024-02-20T15:00:00Z"}'

# 8. Professional submits feedback
curl -X POST http://localhost:5000/api/v1/applications/$APPLICATION_ID/interview-feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROFESSIONAL_TOKEN" \
  -d '{"rating":4.5,"comments":"Great candidate","strengths":"Problem solving","weaknesses":"None","improvementAreas":[],"recommendation":"Strongly Recommend"}'
```

---

## 💡 Tips

1. **Save Tokens**: Store JWT tokens in environment variables or a secure location
2. **Use Postman/Insomnia**: Import these requests into a REST client for easier testing
3. **Check Response**: Always check the response for success/error messages
4. **Follow Flow**: Test in the correct order (apply → shortlist → assess → interview)
5. **Check Notifications**: Verify notifications are created after each action

---

## 🐛 Troubleshooting

- **401 Unauthorized**: Token expired or invalid - login again
- **403 Forbidden**: Insufficient permissions - check user role
- **404 Not Found**: Resource doesn't exist - verify IDs
- **400 Bad Request**: Invalid data - check request body format

---

Happy Testing! 🎉
