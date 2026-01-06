# PlacementOS - Complete Flow Documentation

## 🎯 System Overview

PlacementOS is a comprehensive placement management system that handles the entire recruitment lifecycle from job posting to offer acceptance. The system supports three user roles: **Admin**, **Student**, and **Professional**.

---

## 👥 User Roles

### 1. Admin
- Creates and manages job postings
- Reviews and shortlists resumes
- Releases assessments
- Assigns professionals to interviews
- Monitors overall system metrics

### 2. Student
- Browses and applies for jobs
- Receives skill-based job recommendations
- Takes assessments (MCQ + Coding)
- Participates in interviews
- Receives and responds to offers

### 3. Professional (Interviewer)
- Gets approved by admin
- Receives interview assignments
- Schedules interviews with Zoom links
- Conducts interviews
- Submits feedback and recommendations

---

## 📊 Complete Application Flow

### Phase 1: Job Discovery & Application

```
┌─────────────────────────────────────────────┐
│  1. Admin Creates Job Posting              │
│     - Company details                       │
│     - Role requirements                     │
│     - Skills needed                         │
│     - Selection process                     │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  2. Student Browses Jobs                    │
│     - View all active jobs                  │
│     - Get personalized recommendations      │
│       (based on student's skills)           │
│     - Minimum 3 recommended jobs            │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  3. Student Applies for Job                 │
│     - Uploads resume                        │
│     - Status: "applied"                     │
│     - Notification sent                     │
└─────────────────────────────────────────────┘
```

### Phase 2: Resume Screening

```
┌─────────────────────────────────────────────┐
│  4. Resume ATS Scoring                      │
│     - PDF parsing                           │
│     - Keyword matching                      │
│     - Semantic analysis                     │
│     - Score: 0-100                          │
│     - Status: "resume_under_review"         │
└─────────────────────────────────────────────┘
                   ↓
        ┌──────────┴──────────┐
        ↓                     ↓
┌───────────────┐    ┌───────────────┐
│ Score >= 60   │    │ Score < 60    │
│ PASS          │    │ FAIL          │
└───────────────┘    └───────────────┘
        ↓                     ↓
┌───────────────┐    ┌───────────────┐
│ Status:       │    │ Status:       │
│ resume_       │    │ resume_       │
│ shortlisted   │    │ rejected      │
└───────────────┘    └───────────────┘
```

**ATS Scoring Factors:**
- Keyword match with job skills (60%)
- Semantic similarity with job description (40%)
- Minimum passing score: 60/100

### Phase 3: Assessment

```
┌─────────────────────────────────────────────┐
│  5. Admin Releases Assessment               │
│     - 20 Multiple Choice Questions          │
│     - 1 Coding Question                     │
│     - Duration: 60 minutes                  │
│     - Deadline: 3 days                      │
│     - Status: "assessment_pending"          │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  6. Student Takes Assessment                │
│     - Starts assessment                     │
│     - Status: "assessment_in_progress"      │
│     - Answers MCQs and coding question      │
│     - Submits before deadline               │
│     - Status: "assessment_submitted"        │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  7. Assessment Scoring                      │
│     - MCQ: Auto-graded (70% weight)         │
│     - Coding: Manual review (30% weight)    │
│     - Final Score: Weighted average         │
└─────────────────────────────────────────────┘
                   ↓
        ┌──────────┴──────────┐
        ↓                     ↓
┌───────────────┐    ┌───────────────┐
│ Score >= 60   │    │ Score < 60    │
│ PASS          │    │ FAIL          │
└───────────────┘    └───────────────┘
        ↓                     ↓
┌───────────────┐    ┌───────────────┐
│ Status:       │    │ Status:       │
│ assessment_   │    │ assessment_   │
│ approved      │    │ rejected      │
└───────────────┘    └───────────────┘
```

### Phase 4: AI Preliminary Interview (Optional)

```
┌─────────────────────────────────────────────┐
│  8. AI Preliminary Interview                │
│     - Automated preliminary screening       │
│     - Basic behavioral questions            │
│     - Status: "ai_interview_pending"        │
│     - → "ai_interview_completed"            │
└─────────────────────────────────────────────┘
```

### Phase 5: Technical Round

```
┌─────────────────────────────────────────────┐
│  9. Admin Assigns Technical Interviewer     │
│     - Selects approved professional         │
│     - Role: "Technical"                     │
│     - Status: "professional_interview_      │
│       pending"                              │
│     - Notifications sent to both parties    │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  10. Professional Schedules Interview       │
│     - Uploads Zoom meeting link             │
│     - Sets date and time                    │
│     - Status: "professional_interview_      │
│       scheduled"                            │
│     - Link visible to student               │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  11. Interview Conducted                    │
│     - Both join Zoom link                   │
│     - Technical assessment                  │
│     - Problem-solving evaluation            │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  12. Professional Submits Feedback          │
│     - Rating (0-5)                          │
│     - Comments                              │
│     - Strengths                             │
│     - Weaknesses                            │
│     - Improvement areas                     │
│     - Recommendation:                       │
│       • Strongly Recommend                  │
│       • Recommend                           │
│       • Maybe                               │
│       • Reject                              │
└─────────────────────────────────────────────┘
                   ↓
        ┌──────────┴──────────┐
        ↓                     ↓
┌───────────────┐    ┌───────────────┐
│ Pass          │    │ Fail          │
└───────────────┘    └───────────────┘
        ↓                     ↓
┌───────────────┐    ┌───────────────┐
│ Status:       │    │ Status:       │
│ professional_ │    │ rejected      │
│ interview_    │    │               │
│ completed     │    │               │
└───────────────┘    └───────────────┘
```

### Phase 6: Manager Round

```
┌─────────────────────────────────────────────┐
│  13. Admin Assigns Manager                  │
│     - Selects professional with role:       │
│       "Manager"                             │
│     - Status: "manager_interview_pending"   │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  14. Manager Schedules Interview            │
│     - Uploads Zoom link                     │
│     - Sets date/time                        │
│     - Status: "manager_interview_           │
│       scheduled"                            │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  15. Manager Interview Conducted            │
│     - Leadership assessment                 │
│     - Cultural fit evaluation               │
│     - Behavioral questions                  │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  16. Manager Submits Feedback               │
│     - Same feedback structure               │
│     - Pass/Fail recommendation              │
└─────────────────────────────────────────────┘
                   ↓
        ┌──────────┴──────────┐
        ↓                     ↓
┌───────────────┐    ┌───────────────┐
│ Pass          │    │ Fail          │
│ Status:       │    │ Status:       │
│ manager_round_│    │ rejected      │
│ completed     │    │               │
└───────────────┘    └───────────────┘
```

### Phase 7: HR Round

```
┌─────────────────────────────────────────────┐
│  17. Admin Assigns HR                       │
│     - Selects professional with role: "HR"  │
│     - Status: "hr_interview_pending"        │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  18. HR Schedules Interview                 │
│     - Uploads Zoom link                     │
│     - Sets date/time                        │
│     - Status: "hr_interview_scheduled"      │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  19. HR Interview Conducted                 │
│     - Compensation discussion               │
│     - Company culture                       │
│     - Final clarifications                  │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  20. HR Submits Feedback                    │
│     - Final recommendation                  │
│     - Pass/Fail decision                    │
└─────────────────────────────────────────────┘
                   ↓
        ┌──────────┴──────────┐
        ↓                     ↓
┌───────────────┐    ┌───────────────┐
│ Pass          │    │ Fail          │
│ Status:       │    │ Status:       │
│ hr_round_     │    │ rejected      │
│ completed     │    │               │
└───────────────┘    └───────────────┘
```

### Phase 8: Offer & Certificate

```
┌─────────────────────────────────────────────┐
│  21. Mock Offer Released                    │
│     - CTC details                           │
│     - Joining date                          │
│     - Offer letter PDF                      │
│     - Status: "offer_released"              │
└─────────────────────────────────────────────┘
                   ↓
        ┌──────────┴──────────┐
        ↓                     ↓
┌───────────────┐    ┌───────────────┐
│ Student       │    │ Student       │
│ Accepts       │    │ Rejects       │
└───────────────┘    └───────────────┘
        ↓                     ↓
┌───────────────┐    ┌───────────────┐
│ Status:       │    │ Status:       │
│ offer_        │    │ offer_        │
│ accepted      │    │ rejected      │
└───────────────┘    └───────────────┘
        ↓
┌───────────────┐
│ Certificate   │
│ Generated     │
│               │
│ "Successfully │
│ cleared mock  │
│ interview"    │
└───────────────┘
```

---

## 🔔 Notification System

Notifications are automatically sent to users at key stages:

### Student Notifications
- Application submitted
- Resume shortlisted/rejected
- Assessment released
- Assessment result
- Interview assigned
- Interview scheduled
- Interview completed
- Offer released

### Professional Notifications
- Account approved/rejected
- New interview assigned
- Interview reminder (day before)

### Admin Notifications
- New application received
- Assessment completed
- Interview feedback submitted
- System alerts

---

## 📊 Recommendation Engine

**How it works:**

1. **Extract Student Skills**
   - Skills from student profile
   - Convert to lowercase for matching

2. **Match with Job Requirements**
   - Compare student skills with job.skills
   - Compare with job.requiredTechStack
   - Calculate match percentage

3. **Score Calculation**
   ```
   matchScore = (matchedSkills / totalJobSkills) × 100
   ```

4. **Sorting & Filtering**
   - Sort by match score (highest first)
   - Include jobs with deadline > today
   - Return top 10 matches
   - Ensure minimum 3 jobs

5. **Response Format**
   ```json
   {
     "job": { ...jobDetails },
     "matchScore": 85,
     "matchedSkills": ["JavaScript", "React", "Node.js"]
   }
   ```

---

## 📈 Dashboard Statistics

### Admin Dashboard
- Total jobs (active, expired)
- Total applications
- Total students
- Total professionals (pending, approved)
- Applications by status
- Recent applications
- Top jobs by application count

### Student Dashboard
- Total applications
- Applications by status
- Active applications (with job details)
- Unread notifications

### Professional Dashboard
- Profile status and rating
- Total interviews assigned
- Completed interviews
- Upcoming interviews (sorted by date)
- Active interview count
- Unread notifications

---

## 🔐 Security Features

1. **JWT Authentication**
   - Token-based auth
   - 7-day expiry
   - Refresh token support

2. **Role-Based Access Control**
   - Route-level authorization
   - Action-level permissions

3. **Password Security**
   - bcrypt hashing (10 rounds)
   - No plain-text storage

4. **Rate Limiting**
   - 100 requests per 15 minutes
   - Prevents DDoS attacks

5. **Input Validation**
   - express-validator
   - Mongoose schema validation

6. **Security Headers**
   - Helmet middleware
   - CORS configuration

---

## 🎯 Business Rules

1. **Resume Shortlisting**
   - Minimum ATS score: 60/100
   - Based on keyword matching + semantic analysis

2. **Assessment**
   - 20 MCQs + 1 Coding question
   - Duration: 60 minutes
   - Deadline: 3 days from release
   - Passing score: 60/100
   - MCQ weight: 70%, Coding: 30%

3. **Professional Assignment**
   - Max 10 active interviews per professional
   - Must be in "approved" status
   - Role matching (Technical/Manager/HR)

4. **Interview Scheduling**
   - Only assigned professional can schedule
   - Requires Zoom link + date/time
   - Both parties get notifications

5. **Feedback Submission**
   - Required fields: rating, recommendation
   - Optional: comments, strengths, weaknesses
   - Determines pass/fail for next round

6. **Job Recommendations**
   - Skill-based matching
   - Active jobs only
   - Not expired (deadline > today)
   - Minimum 3 recommendations

---

## 📝 Application Timeline Tracking

Every application maintains a complete timeline:

```json
{
  "timeline": [
    {
      "status": "applied",
      "timestamp": "2024-01-15T10:00:00Z",
      "notes": "Application submitted"
    },
    {
      "status": "resume_shortlisted",
      "timestamp": "2024-01-16T14:30:00Z",
      "notes": "Resume shortlisted with score: 75"
    },
    {
      "status": "assessment_pending",
      "timestamp": "2024-01-17T09:00:00Z",
      "notes": "Assessment released"
    }
    // ... continues for all status changes
  ]
}
```

This provides:
- Complete audit trail
- Status history
- Timestamp for each stage
- Admin notes/comments

---

## 🎓 Mock Interview Certificate

Upon successful completion (offer_accepted):
- Certificate generated
- Includes:
  - Student name
  - Company name
  - Role title
  - Completion date
  - Overall performance score
  - Signature of admin

---

This comprehensive flow ensures a smooth, transparent, and efficient placement process for all stakeholders! 🚀
