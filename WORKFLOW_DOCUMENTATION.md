# PlacementOS - Complete Application Workflow

## Overview
This document outlines the complete end-to-end workflow for student applications in PlacementOS, from job browsing to offer acceptance.

---

## Complete Application Flow

### 1. **Job Discovery & Application**

#### Browse Jobs (Student Portal)
- **Location**: `/student/browse-jobs`
- **Features**:
  - **Recommended for You Section**: Shows minimum 3 jobs based on student skills matching
    - Match score calculated by comparing student skills with job required skills
    - Jobs sorted by match percentage
    - Visual badge showing match percentage
  - **All Active Jobs**: Complete list of active jobs posted by admin
  - **Search & Filter**: Search by company name or role title

#### Job Application Process
1. Student clicks "Apply Now" on a job
2. Student uploads resume for that specific job
3. Application status: `applied` → `resume_under_review`

---

### 2. **Resume Screening Phase**

#### Admin Review (Admin Dashboard)
- **Tab**: Resume Approvals
- **Actions**:
  - **Approve**: 
    - Status: `resume_under_review` → `assessment_released`
    - Assessment deadline set (2 days from approval)
    - Student receives notification
  - **Reject**: 
    - Status: `resume_under_review` → `rejected`
    - Student receives rejection notification

---

### 3. **Assessment Phase**

#### Student Assessment
- **Components**: 
  - 20 MCQ questions
  - 1 Coding question
- **Duration**: Must complete within deadline
- **Status Flow**: 
  - `assessment_released` → `assessment_in_progress` → `assessment_completed`

#### Admin Review (Admin Dashboard)
- **Tab**: Assessment Approvals
- **Actions**:
  - **Approve**: 
    - Status: `assessment_completed` → `ai_interview_pending`
    - Student receives notification
  - **Reject**: 
    - Status: `assessment_completed` → `rejected`

---

### 4. **AI Mock Interview Phase**

#### Student AI Interview
- **Purpose**: Preliminary screening before human interviews
- **Status**: `ai_interview_pending` → `ai_interview_completed`
- **Scoring**: AI generates interview score

#### Admin Review (Admin Dashboard)
- **Tab**: AI Interview Review
- **Action**: Move to Technical Interview
  - Automatically assigns a professional interviewer
  - Status: `ai_interview_completed` → `professional_interview_pending`
  - Assignment logic:
    - Filters approved professionals with matching tech stack
    - Selects professional with lowest active interview count
    - Increments professional's active interview count

---

### 5. **Technical/Professional Interview Round**

#### Professional Assignment
- **Automatic Assignment** by admin after AI interview
- **Criteria**:
  - Professional must be approved
  - Tech stack must match job requirements
  - Active interview count < 5
- **Status**: `professional_interview_pending`

#### Professional Dashboard
- **Pending Tab**: Shows all assigned interviews awaiting scheduling
- **Actions**: Schedule Interview
  - Professional selects date, time, and creates Zoom/Google Meet link
  - Status: `professional_interview_pending` → `professional_interview_scheduled`
  - Student receives notification with meeting details

#### Conducting Interview
- **Scheduled Tab**: Shows all scheduled interviews
- **Meeting Link**: Visible to both student and professional
- **Actions**: Conduct Interview
  - Professional provides:
    - Rating (1-5)
    - Recommendation (Pass/Fail)
    - Detailed comments
    - Improvement areas (if Fail)
  - **If Pass**: 
    - Status: `professional_interview_scheduled` → `professional_interview_completed`
    - Auto-assigns Manager for next round
    - Status becomes: `manager_round_pending`
  - **If Fail**: 
    - Status: → `rejected`
    - Student receives feedback

---

### 6. **Manager Interview Round**

#### Manager Assignment
- **Automatic Assignment** after professional interview pass
- **Criteria**:
  - Professional role must be "Manager"
  - Years of experience >= 10
  - Tech stack must match job requirements
  - Active interview count < 5
- **Status**: `manager_round_pending` or `manager_interview_pending`

#### Manager Dashboard (Same as Professional)
- **Pending Tab**: Shows assigned manager interviews
- **Schedule**: Same process as professional round
  - Status: `manager_round_pending` → `manager_interview_scheduled`
- **Conduct**: Same feedback process
  - **If Pass**: 
    - Status: → `manager_round_completed`
    - Auto-assigns HR for final round
    - Status becomes: `hr_round_pending`
  - **If Fail**: 
    - Status: → `rejected`

---

### 7. **HR Interview Round**

#### HR Assignment
- **Automatic Assignment** after manager interview pass
- **Criteria**:
  - Professional role must be "HR"
  - Years of experience >= 8
  - No tech stack requirement
  - Active interview count < 5
- **Status**: `hr_round_pending` or `hr_interview_pending`

#### HR Dashboard (Same as Professional)
- **Pending Tab**: Shows assigned HR interviews
- **Schedule**: Same process
  - Status: `hr_round_pending` → `hr_interview_scheduled`
- **Conduct**: Same feedback process
  - **If Pass**: 
    - Status: → `hr_round_completed`
    - Student is now eligible for offer
  - **If Fail**: 
    - Status: → `rejected`

---

### 8. **Offer Release Phase**

#### Admin Review (Admin Dashboard)
- **Tab**: Release Offers
- **Shows**: Students who completed all interview rounds (`hr_round_completed`)
- **Action**: Release Offer Letter
  - Status: `hr_round_completed` → `offer_released`
  - Offer details include:
    - Job title
    - Company name
    - Package
    - Joining date
  - Student receives notification

---

### 9. **Offer Acceptance**

#### Student Portal
- **Location**: `/student/offers`
- **Actions**:
  - **Accept**: Status: `offer_released` → `offer_accepted`
  - **Reject**: Status: `offer_released` → `offer_rejected`

---

## Status Flow Summary

```
applied
  ↓
resume_under_review
  ↓ (Admin Approve)
assessment_released
  ↓ (Student completes)
assessment_completed
  ↓ (Admin Approve)
ai_interview_pending
  ↓ (Student completes)
ai_interview_completed
  ↓ (Admin assigns Professional)
professional_interview_pending
  ↓ (Professional schedules)
professional_interview_scheduled
  ↓ (Professional conducts & Pass)
professional_interview_completed
  ↓ (Auto-assign Manager)
manager_round_pending
  ↓ (Manager schedules)
manager_interview_scheduled
  ↓ (Manager conducts & Pass)
manager_round_completed
  ↓ (Auto-assign HR)
hr_round_pending
  ↓ (HR schedules)
hr_interview_scheduled
  ↓ (HR conducts & Pass)
hr_round_completed
  ↓ (Admin releases offer)
offer_released
  ↓ (Student accepts)
offer_accepted
```

---

## Key Features

### Job Recommendations
- **Algorithm**: Skill-based matching
- **Minimum**: 3 recommended jobs always shown
- **Display**: Match percentage badge on each recommended job
- **Calculation**: 
  ```
  matchScore = (matching skills / total student skills) × 100
  ```

### Professional Assignment Logic
- **Load Balancing**: Assigns to professional with lowest active interview count
- **Skill Matching**: Ensures tech stack alignment
- **Experience Priority**: Among equal loads, prefers more experienced professionals
- **Role-Based**: 
  - Technical: Any approved professional with matching skills
  - Manager: Role="Manager" + 10+ years experience
  - HR: Role="HR" + 8+ years experience

### Interview Scheduling
- **Zoom/Google Meet**: Professional creates and shares meeting link
- **Visibility**: Link visible to both student and professional
- **Notifications**: Both parties notified when interview is scheduled

### Feedback System
- **Rating**: 1-5 scale
- **Recommendation**: Pass/Fail
- **Comments**: Detailed feedback
- **Improvement Areas**: Specific areas for rejected candidates
- **History**: All feedback visible in subsequent rounds

---

## Professional Dashboard Tabs

### Pending Tab
Shows interviews that need to be scheduled:
- Professional interviews with status `professional_interview_pending`
- Manager interviews with status `manager_round_pending` or `manager_interview_pending`
- HR interviews with status `hr_round_pending` or `hr_interview_pending`

### Scheduled Tab
Shows interviews that have been scheduled:
- Professional interviews with status `professional_interview_scheduled`
- Manager interviews with status `manager_interview_scheduled`
- HR interviews with status `hr_interview_scheduled`
- Displays: Meeting link, scheduled date/time

### Completed Tab
Shows interviews that have been conducted:
- Professional interviews with status `professional_interview_completed`
- Manager interviews with status `manager_round_completed`
- HR interviews with status `hr_round_completed`
- Displays: Feedback summary, rating, recommendation

---

## Student Portal Views

### Browse Jobs
- Recommended for You (skill-matched, minimum 3)
- All Active Jobs (searchable)

### My Applications
- Track application status
- View timeline
- Access assessments
- View interview schedules
- View feedback

### Interviews
- Upcoming interviews with meeting links
- Interview history
- Feedback from each round

### Offers
- View offer details
- Accept/Reject offers
- Download offer letter

---

## Admin Dashboard Tabs

1. **Professional Approvals**: Approve/reject professional signups, assign roles
2. **Resume Approvals**: Review and approve/reject resumes
3. **Assessment Approvals**: Review completed assessments
4. **AI Interview Review**: Progress students to technical round
5. **Release Offers**: Release offers to students who passed all rounds
6. **Overview**: Analytics and metrics

---

## Notifications

### Student Notifications
- Resume approved/rejected
- Assessment released
- Interview assigned
- Interview scheduled
- Interview feedback
- Offer released

### Professional Notifications
- Interview assigned
- Approval status

### Admin Notifications
- New professional signup
- New application
- Assessment completed

---

## Certificate Generation

After offer acceptance (`offer_accepted`), the system can generate:
- **Mock Interview Completion Certificate**
- **Offer Letter**
- **Placement Confirmation**

---

## Error Handling

### No Available Professionals
If no professionals match the criteria:
- System logs warning
- Admin is notified
- Application remains in pending state until professional becomes available

### Interview Scheduling Conflicts
- Professionals can see their schedule
- System prevents double-booking (future enhancement)

### Deadline Management
- Assessments have 2-day deadline
- Expired assessments can be extended by admin (future enhancement)

---

## Future Enhancements

1. **Calendar Integration**: Sync with Google Calendar
2. **Video Recording**: Record interview sessions
3. **Automated Reminders**: Email/SMS reminders for interviews
4. **Skill Gap Analysis**: Detailed skill matching reports
5. **Interview Slots**: Pre-defined time slots for professionals
6. **Bulk Operations**: Bulk approve/reject in admin dashboard
7. **Advanced Analytics**: Conversion rates, success metrics
8. **Resume Parsing**: Automatic skill extraction from resumes
9. **ATS Scoring**: Automated resume scoring
10. **Interview Templates**: Standardized interview questions per role

---

## Technical Notes

### State Management
- Redux store manages all application state
- Real-time updates via state subscriptions
- Optimistic UI updates

### Data Flow
- Thunks handle complex operations (assignments, notifications)
- Reducers handle state mutations
- Selectors for derived data

### Performance
- Lazy loading for large lists
- Pagination for applications (future)
- Caching for frequently accessed data

---

*Last Updated: 2026-01-04*
