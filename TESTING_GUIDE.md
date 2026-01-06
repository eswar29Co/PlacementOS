# 🧪 PlacementOS - Comprehensive Testing Guide

## 📋 Pre-Test Checklist

### ✅ Verify System is Running

1. **Backend Server Check**
   ```bash
   # In terminal 1
   cd backend-pos
   npm run dev
   ```
   
   ✅ You should see:
   ```
   ╔════════════════════════════════════════╗
   ║      PlacementOS API Server            ║
   ║  Environment: development              ║
   ║  Port: 5000                            ║
   ╚════════════════════════════════════════╝
   ✅ MongoDB Connected: localhost
   ```

2. **Frontend Server Check**
   ```bash
   # In terminal 2
   cd frontend-pos
   npm run dev
   ```
   
   ✅ You should see:
   ```
   VITE ready in XXX ms
   ➜  Local:   http://localhost:8080/
   ```

3. **MongoDB Check**
   ```bash
   mongosh
   ```
   
   ✅ Should connect without errors

4. **API Health Check**
   
   Open browser: `http://localhost:5000/health`
   
   ✅ Expected response:
   ```json
   {
     "success": true,
     "message": "PlacementOS API is running",
     "timestamp": "2026-01-06T..."
   }
   ```

---

## 🎯 Test Scenario 1: Complete Student Journey

### Objective: Test full student application flow from registration to offer

### Step 1: Student Registration

1. Open `http://localhost:8080`
2. Click **"Sign Up"** or navigate to Student Registration
3. Fill in student details:
   ```
   Name: John Doe
   Email: john.doe@student.com
   Password: Test@123
   College: MIT Institute of Technology
   Degree: B.Tech
   Branch: Computer Science
   CGPA: 8.5
   Graduation Year: 2024
   Skills: JavaScript, React, Node.js, MongoDB, AWS
   ```
4. Click **"Register"**

**Expected Result**:
- ✅ Success message: "Registration successful"
- ✅ Redirect to login page

**Backend Verification**:
```bash
# Check MongoDB
mongosh
use placementos
db.students.find({ email: "john.doe@student.com" })
```

---

### Step 2: Student Login

1. Navigate to `http://localhost:8080/login`
2. Enter credentials:
   ```
   Email: john.doe@student.com
   Password: Test@123
   Role: Student
   ```
3. Click **"Login"**

**Expected Result**:
- ✅ Success message: "Login successful"
- ✅ Token stored in localStorage
- ✅ Redirect to student dashboard

**Browser Console Check**:
```javascript
// Check token
localStorage.getItem('token')
// Should return a JWT token
```

---

### Step 3: Browse and View Jobs

1. Navigate to **"Browse Jobs"** from sidebar
2. View recommended jobs (should show jobs matching student skills)
3. Click on a job card to view details

**Expected Result**:
- ✅ Jobs displayed with match percentage
- ✅ At least 3 recommended jobs shown
- ✅ Job details page shows full information

**Test Data to Check**:
- Match score calculation (skills-based)
- Active jobs only displayed
- Job deadline not expired

---

### Step 4: Apply for a Job

1. On job details page, click **"Apply Now"**
2. Upload resume (optional) or use URL
3. Write cover letter (optional)
4. Submit application

**Expected Result**:
- ✅ Success message: "Application submitted successfully"
- ✅ Application appears in "My Applications" page
- ✅ Status shows: "applied"
- ✅ Notification received

**Backend Verification**:
```bash
mongosh
use placementos
db.applications.find({ studentId: ObjectId("...") })
```

---

### Step 5: Resume Screening (Admin Action Required)

**Admin needs to trigger ATS screening**

As Admin:
1. Login as admin (admin@placementos.com / admin123)
2. Go to **"Applications Management"**
3. Find the application
4. Click **"Screen Resumes"** for the job

**Expected Result for Student**:
- ✅ Application status changes to either:
  - "resume_approved" (if score >= 60) ✅
  - "resume_rejected" (if score < 60) ❌
- ✅ Student receives notification
- ✅ Resume score displayed

**Backend API Test**:
```bash
curl -X POST http://localhost:5000/api/v1/applications/shortlist-resumes/JOB_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

### Step 6: Take Assessment

**Prerequisites**: Resume must be approved

1. Go to **"My Applications"**
2. Find application with "Take Assessment" button
3. Click **"Take Assessment"**
4. Answer 20 MCQ questions
5. Solve 1 coding question
6. Submit assessment within time limit

**Expected Result**:
- ✅ Assessment timer starts
- ✅ Questions displayed correctly
- ✅ Can navigate between questions
- ✅ Submit button enabled after all answers
- ✅ Success message on submission
- ✅ Status changes to "assessment_submitted"
- ✅ Score calculated (70% MCQ + 30% coding)

**Score Calculation**:
- MCQ: Correct answers / Total questions × 70
- Coding: Manual evaluation × 30
- Total must be >= 60 to pass

---

### Step 7: AI Mock Interview

**Prerequisites**: Assessment passed

1. Application status: "ai_interview_pending"
2. Click **"Start AI Interview"**
3. Answer 5 AI-generated questions
4. Submit responses

**Expected Result**:
- ✅ Questions displayed one by one
- ✅ Text area for answers
- ✅ Progress indicator
- ✅ Success on completion
- ✅ Status changes to "ai_interview_completed"

---

### Step 8: Professional Interview Round

**Prerequisites**: 
- AI interview completed
- Admin assigns professional

As Admin:
1. Navigate to application
2. Click **"Assign Professional"**
3. Select professional from available list
4. Click **"Assign"**

As Professional (Technical Round):
1. Login as professional
2. Navigate to **"My Interviews"**
3. Find assigned interview
4. Click **"Conduct Interview"**
5. Review student details and resume
6. Schedule interview:
   ```
   Date & Time: [Select future date]
   Zoom Link: https://zoom.us/j/123456
   ```
7. After interview, submit feedback:
   ```
   Rating: 4/5
   Comments: "Good technical knowledge"
   Recommendation: Pass
   ```

**Expected Result for Student**:
- ✅ Notification: "Interview scheduled"
- ✅ Interview details visible in dashboard
- ✅ Zoom link accessible
- ✅ After feedback: Status changes to "professional_interview_completed"

---

### Step 9: Manager Round

**Prerequisites**: Professional round passed

As Admin:
1. Assign manager to application
2. Manager role must have:
   - professionalRole: "Manager"
   - yearsOfExperience >= 5

As Manager:
1. Conduct interview similar to professional round
2. Submit feedback with recommendation

**Expected Result**:
- ✅ Status: "manager_interview_scheduled"
- ✅ After completion: "manager_interview_completed"

---

### Step 10: HR Round

**Prerequisites**: Manager round passed

As Admin:
1. Assign HR to application
2. HR role must have:
   - professionalRole: "HR"
   - yearsOfExperience >= 8

As HR:
1. Conduct final HR round
2. Submit feedback and final recommendation

**Expected Result**:
- ✅ Status: "hr_interview_scheduled"
- ✅ After completion: "hr_interview_completed"

---

### Step 11: Offer Release

As Admin:
1. Review application (all rounds completed)
2. Click **"Release Offer"**
3. Offer details:
   ```
   CTC: ₹12 LPA
   Joining Date: 2024-07-01
   ```

**Expected Result for Student**:
- ✅ Notification: "Congratulations! Offer released"
- ✅ Status: "offer_released"
- ✅ Offer details visible
- ✅ Actions: Accept / Reject buttons

---

### Step 12: Accept Offer

As Student:
1. Navigate to application
2. Click **"Accept Offer"**

**Expected Result**:
- ✅ Status: "offer_accepted"
- ✅ Certificate generated
- ✅ Final report available

---

## 🎯 Test Scenario 2: Professional Registration & Approval

### Step 1: Professional Registration

1. Navigate to `http://localhost:8080/register/professional`
2. Fill details:
   ```
   Name: Sarah Johnson
   Email: sarah.johnson@tech.com
   Password: Test@123
   Company: TechCorp
   Designation: Senior Engineer
   Years of Experience: 7
   Professional Role: Technical
   Tech Stack: Java, Spring Boot, AWS, React
   Expertise: System Design, Microservices
   ```
3. Submit registration

**Expected Result**:
- ✅ Account created
- ✅ Status: "pending"
- ✅ Notification sent to admin

---

### Step 2: Admin Approval

As Admin:
1. Navigate to **"Professional Management"**
2. View pending professionals
3. Review profile
4. Click **"Approve"** or **"Reject"**

**Expected Result**:
- ✅ Professional status updated
- ✅ Notification sent to professional
- ✅ If approved: Can conduct interviews
- ✅ If rejected: Cannot access system

---

### Step 3: Conduct Multiple Interviews

As Approved Professional:
1. View **"My Interviews"** dashboard
2. Should show all assigned interviews
3. Conduct interviews
4. Track interview count (max 10 active)

**Expected Result**:
- ✅ Active interview counter increments
- ✅ Cannot exceed 10 simultaneous interviews
- ✅ Counter decrements after feedback submission
- ✅ Rating accumulates

---

## 🎯 Test Scenario 3: Admin Management Features

### Step 1: Admin Login

```
Email: admin@placementos.com
Password: admin123
```

**Expected Result**:
- ✅ Redirect to admin dashboard
- ✅ Admin-specific menu visible

---

### Step 2: Job Management

1. **Create New Job**:
   ```
   Company: Microsoft
   Role: Software Engineer
   CTC: ₹15-20 LPA
   Location Type: Hybrid
   Skills: C#, .NET, Azure, SQL
   Deadline: 30 days from now
   ```

2. **Edit Job**:
   - Update job details
   - Toggle active status

3. **Delete Job**:
   - Soft delete (keeps applications)

**Expected Result**:
- ✅ Job created and visible to students
- ✅ Only active jobs shown in student view
- ✅ Inactive jobs hidden but accessible to admin

---

### Step 3: Application Management

1. **View All Applications**
2. **Filter by**:
   - Job
   - Status
   - Student
3. **Bulk Actions**:
   - Screen resumes for all applications in a job
   - Release assessments for shortlisted candidates

**Expected Result**:
- ✅ Applications displayed with all details
- ✅ Filters work correctly
- ✅ Bulk operations successful

---

### Step 4: Professional Management

1. **View All Professionals**
2. **Filter by**:
   - Status (pending/approved/rejected)
   - Role (Technical/Manager/HR)
3. **Approve/Reject** pending professionals

**Expected Result**:
- ✅ All professionals listed
- ✅ Filtering works
- ✅ Status updates reflected immediately

---

### Step 5: Dashboard Statistics

Navigate to admin dashboard and verify:

**Statistics to Check**:
- Total jobs (active/inactive)
- Total applications (by status)
- Total students registered
- Total professionals (by status)
- Recent activities

**Expected Result**:
- ✅ All counts accurate
- ✅ Charts/graphs display correctly
- ✅ Real-time updates

---

## 🎯 Test Scenario 4: Notifications System

### Test Notification Triggers

| Event | Recipient | Notification Type |
|-------|-----------|------------------|
| Application submitted | Student | application_update |
| Resume approved | Student | resume_approved |
| Resume rejected | Student | resume_rejected |
| Assessment released | Student | assessment_released |
| Assessment approved | Student | assessment_approved |
| Interview assigned | Professional | interview_assigned |
| Interview scheduled | Student | interview_scheduled |
| Interview completed | Student/Admin | interview_completed |
| Offer released | Student | offer_released |
| Professional approved | Professional | professional_approved |

**Expected Result**:
- ✅ Notifications appear in notification panel
- ✅ Unread count displays correctly
- ✅ Mark as read functionality works
- ✅ Action URLs navigate correctly

---

## 🎯 Test Scenario 5: Error Handling & Edge Cases

### Test Case 1: Duplicate Registration

1. Try registering with existing email

**Expected Result**:
- ❌ Error: "Email already exists"
- ✅ User stays on registration page

---

### Test Case 2: Invalid Login

1. Enter wrong password
2. Try with non-existent email

**Expected Result**:
- ❌ Error: "Invalid credentials"
- ✅ No token stored

---

### Test Case 3: Expired Assessment

1. Start assessment
2. Wait for deadline to pass
3. Try to submit

**Expected Result**:
- ❌ Error: "Assessment deadline passed"
- ✅ Cannot submit answers

---

### Test Case 4: Apply for Same Job Twice

1. Apply for a job
2. Try applying again

**Expected Result**:
- ❌ Error: "Already applied for this job"
- ✅ Existing application shown

---

### Test Case 5: Professional Assignment Limits

1. Assign professional already at 10 active interviews
2. Try assigning another interview

**Expected Result**:
- ❌ Error: "Professional has reached maximum active interviews"
- ✅ Suggest alternative professionals

---

### Test Case 6: Unauthorized Access

1. Try accessing admin routes as student
2. Try accessing professional routes as student

**Expected Result**:
- ❌ 403 Forbidden
- ✅ Redirect to appropriate dashboard

---

### Test Case 7: Token Expiration

1. Login and get token
2. Wait for token to expire (7 days default)
3. Try making API request

**Expected Result**:
- ❌ 401 Unauthorized
- ✅ Auto-redirect to login
- ✅ Token cleared from localStorage

---

## 🎯 Test Scenario 6: Data Validation

### Test Input Validation

1. **Email Validation**:
   - Invalid format: "test@test"
   - Missing @: "testtest.com"
   - **Expected**: ❌ Validation error

2. **Password Validation**:
   - Too short: "12345"
   - No special chars: "Password123"
   - **Expected**: ❌ Validation error

3. **CGPA Validation**:
   - Out of range: 11.0 or -1.0
   - **Expected**: ❌ Error: "CGPA must be between 0-10"

4. **Date Validation**:
   - Past deadline for job
   - Past graduation year
   - **Expected**: ❌ Validation error

5. **File Upload Validation** (if implemented):
   - Wrong file type
   - File too large
   - **Expected**: ❌ Error message

---

## 🎯 Test Scenario 7: Skill-Based Job Recommendation

### Setup Test Data

Create students with different skill sets:

**Student A**:
- Skills: JavaScript, React, Node.js

**Student B**:
- Skills: Java, Spring Boot, AWS

**Job 1**:
- Required Skills: JavaScript, React, TypeScript
- Required Tech Stack: React, Node.js

**Job 2**:
- Required Skills: Java, Spring Boot, SQL
- Required Tech Stack: Java, AWS

### Test Recommendation Algorithm

1. Login as Student A
2. View Browse Jobs
3. Verify Job 1 has high match score (>60%)
4. Verify Job 1 appears in recommended section

5. Login as Student B
6. View Browse Jobs
7. Verify Job 2 has high match score
8. Verify Job 2 appears in recommended section

**Expected Result**:
- ✅ Match scores calculated correctly
- ✅ At least 3 recommendations shown
- ✅ Recommendations relevant to skills

---

## 🎯 Test Scenario 8: ATS Resume Scoring

### Test ATS Algorithm

Create applications with different resume quality:

**Test Case 1: Perfect Match**
- Resume contains: All job skills, relevant experience, keywords
- **Expected Score**: 80-100
- **Expected Result**: ✅ Resume approved

**Test Case 2: Partial Match**
- Resume contains: Some job skills, basic experience
- **Expected Score**: 60-79
- **Expected Result**: ✅ Resume approved (borderline)

**Test Case 3: Poor Match**
- Resume contains: Few/no job skills, irrelevant content
- **Expected Score**: 0-59
- **Expected Result**: ❌ Resume rejected

**Verification**:
```bash
# Check resume score in database
mongosh
db.applications.find({ _id: ObjectId("...") }, { resumeScore: 1 })
```

---

## 🎯 Test Scenario 9: Assessment Scoring

### Test Assessment Calculation

**MCQ Section (70% weight)**:
- 20 questions
- Student answers 16 correctly
- Score: (16/20) × 70 = 56 points

**Coding Section (30% weight)**:
- Test cases: 10
- Student passes 8 test cases
- Score: (8/10) × 30 = 24 points

**Total Score**: 56 + 24 = 80 points

**Pass Threshold**: 60 points

**Expected Result**:
- ✅ Assessment passed
- ✅ Status: "assessment_approved"
- ✅ Eligible for AI interview

---

## 🎯 Test Scenario 10: Interview Feedback Workflow

### Test Complete Interview Cycle

1. **Professional Interview**:
   - Rating: 4/5
   - Recommendation: Pass
   - **Expected**: Status → "professional_interview_completed"

2. **Manager Interview**:
   - Rating: 3/5
   - Recommendation: Pass
   - **Expected**: Status → "manager_interview_completed"

3. **HR Interview**:
   - Rating: 5/5
   - Recommendation: Pass
   - **Expected**: Status → "hr_interview_completed"

4. **Offer Release**:
   - **Expected**: Status → "offer_released"

**Verification**:
- ✅ All feedback stored in application
- ✅ Timeline tracking updated
- ✅ Average rating calculated
- ✅ Student can view all feedback

---

## 🧪 Performance Testing

### Load Test Scenarios

1. **Concurrent User Logins**:
   - 10 simultaneous logins
   - **Expected**: All successful, <2s response time

2. **Bulk Job Listing**:
   - 100+ active jobs
   - **Expected**: Page loads in <3s

3. **Multiple Applications**:
   - 50+ applications for single job
   - **Expected**: Screening completes in <10s

4. **Assessment Submission**:
   - Submit assessment with large coding answer
   - **Expected**: Submission successful, <5s

---

## 📊 Test Results Template

Use this template to track your testing:

```markdown
## Test Execution Report
Date: 2026-01-06

### Scenario 1: Student Journey
- [x] Registration: ✅ Pass
- [x] Login: ✅ Pass
- [x] Browse Jobs: ✅ Pass
- [x] Apply for Job: ✅ Pass
- [x] Take Assessment: ✅ Pass
- [x] AI Interview: ✅ Pass
- [x] Professional Interview: ✅ Pass
- [x] Offer Accept: ✅ Pass

### Scenario 2: Professional Flow
- [x] Registration: ✅ Pass
- [x] Approval: ✅ Pass
- [x] Conduct Interview: ✅ Pass
- [x] Submit Feedback: ✅ Pass

### Scenario 3: Admin Features
- [x] Job Management: ✅ Pass
- [x] Application Management: ✅ Pass
- [x] Professional Management: ✅ Pass
- [x] Dashboard: ✅ Pass

### Issues Found:
1. None

### Recommendations:
- All features working as expected
```

---

## 🚀 Quick Automated Test Script

Create this script to quickly test backend:

```bash
#!/bin/bash
# test-backend.sh

echo "🧪 PlacementOS Backend Test Script"
echo "=================================="

API_URL="http://localhost:5000/api/v1"

# Test 1: Health Check
echo "1. Testing Health Endpoint..."
curl -s $API_URL/../health | grep -q "success" && echo "✅ Health check passed" || echo "❌ Health check failed"

# Test 2: Register Student
echo "2. Testing Student Registration..."
TOKEN=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role":"student",
    "name":"Test Student",
    "email":"test'$(date +%s)'@test.com",
    "password":"Test@123",
    "college":"Test College",
    "degree":"B.Tech",
    "cgpa":8.5,
    "graduationYear":2024,
    "skills":["JavaScript","React"]
  }' | jq -r '.data.token')

[[ ! -z "$TOKEN" ]] && echo "✅ Registration successful" || echo "❌ Registration failed"

# Test 3: Get Jobs
echo "3. Testing Get Jobs..."
curl -s -H "Authorization: Bearer $TOKEN" $API_URL/jobs | grep -q "success" && echo "✅ Jobs fetched" || echo "❌ Jobs fetch failed"

echo "=================================="
echo "✅ All tests completed!"
```

---

## 📝 Final Checklist

Before considering testing complete:

### Functional Testing
- [ ] All user registration flows work
- [ ] Login/Logout works for all roles
- [ ] Job CRUD operations work
- [ ] Application workflow (24 statuses) works
- [ ] Assessment creation and submission works
- [ ] Interview scheduling and feedback works
- [ ] Notifications system works
- [ ] Dashboard shows correct statistics

### Integration Testing
- [ ] Frontend-Backend communication works
- [ ] Database reads/writes work correctly
- [ ] Token authentication works
- [ ] File uploads work (if implemented)
- [ ] Email notifications work (if configured)

### Security Testing
- [ ] Unauthorized access blocked
- [ ] Role-based access control works
- [ ] SQL injection prevention (MongoDB safe)
- [ ] XSS prevention
- [ ] CSRF protection

### UI/UX Testing
- [ ] All pages load correctly
- [ ] Forms validate input
- [ ] Error messages display properly
- [ ] Success messages show
- [ ] Loading states visible
- [ ] Responsive design works

### Performance Testing
- [ ] Page load times <3s
- [ ] API response times <2s
- [ ] Database queries optimized
- [ ] No memory leaks

---

## 🎉 Success Criteria

Your PlacementOS is fully tested and working if:

✅ All 10 test scenarios pass
✅ No critical bugs found
✅ All error cases handled gracefully
✅ Performance meets requirements
✅ Security measures in place
✅ Documentation is accurate

---

**Happy Testing!** 🚀

Need help? Check the console logs and MongoDB for detailed debugging information.
