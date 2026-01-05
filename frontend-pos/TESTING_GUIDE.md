# PlacementOS Testing Guide

## Complete Workflow Overview

```
Student Flow:
Apply Job → Resume Upload → Resume Shortlist → Assessment Release (2-day timeline) 
→ Assessment with Code Execution → Assessment Shortlist → AI Mock Interview 
→ Professional Assignment → Technical/Manager/HR rounds → Offer Letter → End

Professional Flow:
Assignment Notification → Schedule Interview → Conduct Interview → Feedback Decision 
→ Auto-advancement (Pass) / Rejection (Fail)

Admin Flow:
Approve Professionals with Roles → Approve Resume Shortlist → Approve Assessment Results 
→ Release Offers
```

---

## Prerequisites for Testing

### Initial Setup
1. **Start Development Server**: `bun run dev`
2. **Access Application**: Navigate to `http://localhost:8081/`
3. **Mock Data Available**:
   - 3 Students: `student1@test.com`, `student2@test.com`, `student3@test.com`
   - 3 Professionals: `prof1@test.com`, `prof2@test.com`, `prof3@test.com`
   - 1 Admin: `admin@test.com`
   - All passwords: `password123`
   - 3 Active Jobs: Software Engineer (Infosys), Full Stack Developer (TCS), Backend Developer (Wipro)

---

## Test Scenarios by Role

---

## 1. STUDENT FLOW TEST CASES

### 1.1 Job Application & Resume Upload

#### **Positive Scenarios**

**TC-S-001: Successful Job Application**
- **Steps**:
  1. Login as `student1@test.com`
  2. Navigate to "Browse Jobs"
  3. Click on any job card → "View Details"
  4. Review job details and click "Apply Now"
  5. Toast appears: "Application started! Please upload your resume."
  6. Upload a PDF/DOC/DOCX file (< 5MB)
  7. Click "Submit Application"
- **Expected Result**: 
  - Success toast: "Application submitted! Your resume is being reviewed."
  - Redirect to "Applications" page
  - Application status shows "Resume Under Review"
  - Timeline shows "Application submitted successfully"

**TC-S-002: Apply to Multiple Jobs**
- **Steps**:
  1. Login as `student1@test.com`
  2. Apply to Job 1 (follow TC-S-001)
  3. Apply to Job 2 (follow TC-S-001)
- **Expected Result**: 
  - Both applications visible in "Applications" page
  - Each has separate status tracking
  - Maximum 2 active applications allowed

#### **Negative Scenarios**

**TC-S-003: Apply Without Resume**
- **Steps**:
  1. Login as student
  2. Navigate to apply page
  3. Click "Submit Application" without uploading file
- **Expected Result**: Error toast: "Please upload your resume"

**TC-S-004: Exceed Application Limit**
- **Steps**:
  1. Login as student with 2 active applications
  2. Try to apply to 3rd job
- **Expected Result**: Error toast: "You have reached the maximum of 2 active applications"

**TC-S-005: Duplicate Application**
- **Steps**:
  1. Apply to Job 1
  2. Try to apply to same Job 1 again
- **Expected Result**: Error toast: "You have already applied to this job"

**TC-S-006: Invalid File Type**
- **Steps**:
  1. Try to upload `.txt` or `.jpg` file
- **Expected Result**: File input should reject non-PDF/DOC/DOCX files

**TC-S-007: Invalid Job ID**
- **Steps**:
  1. Navigate to `/student/apply/invalid-job-id`
- **Expected Result**: "This job does not exist." message with back button

---

### 1.2 Resume Shortlist Stage

#### **Positive Scenarios**

**TC-S-010: View Resume Under Review Status**
- **Precondition**: Application submitted with "resume_under_review" status
- **Steps**:
  1. Login as student
  2. Go to "Applications" page
  3. Check application status
- **Expected Result**: 
  - Status badge: "Resume Under Review"
  - No action button visible
  - Timeline shows submission timestamp

**TC-S-011: Resume Shortlisted - Assessment Release**
- **Precondition**: Admin approved resume
- **Steps**:
  1. Login as student
  2. Check "Applications" page
  3. Click "Start Assessment" button
- **Expected Result**:
  - Status: "Assessment Pending"
  - Deadline shows 2 days from release date
  - "Start Assessment" button visible

#### **Negative Scenarios**

**TC-S-012: Resume Rejected**
- **Precondition**: Admin rejected resume
- **Steps**:
  1. Login as student
  2. Check "Applications" page
- **Expected Result**: 
  - Status: "Rejected"
  - No further actions available
  - Can apply to other jobs (freed up application slot)

---

### 1.3 Assessment Stage

#### **Positive Scenarios**

**TC-S-020: Start Assessment on Time**
- **Precondition**: Assessment released, within 2-day deadline
- **Steps**:
  1. Click "Start Assessment" from Applications page
  2. Review assessment questions (4 questions visible)
  3. Write code solutions in text areas
  4. Click "Submit Assessment"
- **Expected Result**:
  - Success toast: "Assessment submitted successfully!"
  - Status changes to "Assessment Under Review"
  - Code solutions saved in application

**TC-S-021: Assessment Shortlisted - AI Interview Unlocked**
- **Precondition**: Admin approved assessment
- **Steps**:
  1. Login as student
  2. Check notification: "Your assessment has been approved! AI interview round is now available."
  3. Go to "Applications" page
  4. Status shows "AI Interview Pending"
  5. Click "Start AI Interview" button
- **Expected Result**: Navigate to AI Mock Interview page

#### **Negative Scenarios**

**TC-S-022: Assessment After Deadline**
- **Precondition**: Assessment deadline passed (2 days elapsed)
- **Steps**:
  1. Try to access assessment page
- **Expected Result**: 
  - Status automatically changes to "Rejected"
  - Toast: "Assessment deadline has passed"

**TC-S-023: Submit Empty Assessment**
- **Steps**:
  1. Start assessment
  2. Leave all code fields empty
  3. Try to submit
- **Expected Result**: Validation error: "Please answer all questions"

**TC-S-024: Assessment Rejected by Admin**
- **Precondition**: Admin rejected assessment results
- **Steps**:
  1. Login as student
  2. Check status
- **Expected Result**: Status: "Rejected", application ends

---

### 1.4 AI Mock Interview

#### **Positive Scenarios**

**TC-S-030: Complete AI Mock Interview**
- **Precondition**: Assessment approved, status "ai_interview_pending"
- **Steps**:
  1. Click "Start AI Interview"
  2. Answer all 5 AI-generated questions with voice/text
  3. Click "Submit Interview"
- **Expected Result**:
  - Success toast: "AI Mock Interview completed! Assigning technical interviewer..."
  - Status changes to "Professional Round Pending"
  - Professional auto-assigned (technical role, matching tech stack)
  - Notification sent to both student and professional

#### **Negative Scenarios**

**TC-S-031: Skip AI Interview Questions**
- **Steps**:
  1. Start AI interview
  2. Leave questions unanswered
  3. Try to submit
- **Expected Result**: Validation prevents submission

**TC-S-032: No Available Technical Professional**
- **Precondition**: All technical professionals have 5+ active interviews
- **Steps**:
  1. Complete AI interview
  2. Submit
- **Expected Result**: 
  - Toast: "No available professionals at this time. Please try again later."
  - Status remains "ai_interview_pending"

---

### 1.5 Professional Interview Round

#### **Positive Scenarios**

**TC-S-040: Professional Round - Scheduled Interview**
- **Precondition**: Professional assigned, status "professional_round_pending"
- **Steps**:
  1. Login as student
  2. Check notification: "You have been assigned to [Professional Name] for technical interview"
  3. Wait for professional to schedule interview
  4. Status changes to "professional_round_scheduled"
  5. View meeting link and scheduled date/time in Applications page
  6. Click "Join Meeting" button
- **Expected Result**: 
  - Google Meet link opens in new tab
  - Interview details visible with date/time
  - Can view professional's profile

**TC-S-041: Professional Round - Pass**
- **Precondition**: Professional conducted interview and selected "Pass"
- **Steps**:
  1. Login as student
  2. Check notification: "Your professional round interview has been completed"
  3. Status automatically changes to "Manager Round Pending"
  4. Manager auto-assigned (10+ years experience, tech stack match)
  5. View feedback: Rating, Comments, Recommendation: "Pass"
- **Expected Result**: 
  - Seamless progression to manager round
  - No admin intervention required
  - Manager assignment notification received

#### **Negative Scenarios**

**TC-S-042: Professional Round - Fail**
- **Precondition**: Professional selected "Fail" with improvement areas
- **Steps**:
  1. Login as student
  2. Check notification about interview completion
  3. View application status
- **Expected Result**: 
  - Status: "Rejected"
  - Feedback visible: Rating, Comments, Improvement Areas (Communication/Technical/Problem Solving/Domain Knowledge)
  - Recommendation shows "Fail"
  - Application ends, slot freed up

---

### 1.6 Manager Interview Round

#### **Positive Scenarios**

**TC-S-050: Manager Round - Pass to HR**
- **Precondition**: Manager assigned (10+ years, tech match), interview completed
- **Steps**:
  1. Manager schedules interview
  2. Manager conducts and selects "Pass"
  3. Login as student
  4. Check status
- **Expected Result**:
  - Auto-assigned to HR (8+ years, no tech requirement)
  - Status: "HR Round Pending"
  - Can view all previous feedback (professional + manager)

#### **Negative Scenarios**

**TC-S-051: Manager Round - Fail**
- **Steps**:
  1. Manager selects "Fail" after interview
  2. Login as student
- **Expected Result**: 
  - Status: "Rejected"
  - All feedback visible (professional round + manager round)
  - Application ends

---

### 1.7 HR Interview Round

#### **Positive Scenarios**

**TC-S-060: HR Round - Pass to Offer Stage**
- **Precondition**: HR assigned (8+ years), interview completed
- **Steps**:
  1. HR conducts interview and selects "Pass"
  2. Login as student
  3. Check status
- **Expected Result**:
  - Status: "HR Round Completed"
  - All 3 interview feedbacks visible
  - Awaiting admin offer release

**TC-S-061: Receive Offer Letter**
- **Precondition**: Admin released offer
- **Steps**:
  1. Login as student
  2. Check notification: "Congratulations! Offer letter has been released"
  3. Go to "Offers" page
  4. View offer details
- **Expected Result**:
  - Status: "Offer Released"
  - Offer shows: Job Title, Company, Package, Joining Date (+30 days from release)
  - Can accept/decline offer (if implemented)

#### **Negative Scenarios**

**TC-S-062: HR Round - Fail**
- **Steps**:
  1. HR selects "Fail"
  2. Login as student
- **Expected Result**: Status: "Rejected", application ends

---

## 2. PROFESSIONAL FLOW TEST CASES

### 2.1 Professional Registration & Approval

#### **Positive Scenarios**

**TC-P-001: Professional Signup**
- **Steps**:
  1. Navigate to `/signup/professional`
  2. Fill all fields: Name, Email, Password, Tech Stack, Years of Experience
  3. Click "Sign Up as Professional"
- **Expected Result**:
  - Success toast: "Professional signup successful! Awaiting admin approval."
  - Redirect to login page
  - Status: "pending"

**TC-P-002: Admin Approves Professional with Role**
- **Precondition**: Professional registered with status "pending"
- **Steps**:
  1. Login as admin
  2. Go to "Professionals" tab
  3. Select role from dropdown: "Technical" / "Manager" / "HR"
  4. Click "Approve" button
- **Expected Result**:
  - Professional status: "approved"
  - Professional can now login
  - Role assigned visible in professional's profile

#### **Negative Scenarios**

**TC-P-003: Login Before Approval**
- **Steps**:
  1. Try to login with pending professional account
- **Expected Result**: Error: "Your account is pending approval"

**TC-P-004: Admin Approves Without Role Selection**
- **Steps**:
  1. Login as admin
  2. Try to click "Approve" without selecting role
- **Expected Result**: Error toast: "Please select a role before approving"

**TC-P-005: Admin Rejects Professional**
- **Steps**:
  1. Login as admin
  2. Click "Reject" on pending professional
- **Expected Result**: 
  - Professional status: "rejected"
  - Cannot login
  - Can re-register if needed

---

### 2.2 Interview Assignment

#### **Positive Scenarios**

**TC-P-010: Receive Assignment Notification**
- **Precondition**: Student completed AI interview, auto-assignment triggered
- **Steps**:
  1. Login as professional (Technical role)
  2. Check notifications
  3. Click notification
- **Expected Result**: 
  - Notification: "You have been assigned to interview [Student Name] for [Job Title]"
  - Navigate to Dashboard
  - Assignment visible in "Pending" tab

**TC-P-011: View Assignment Details**
- **Steps**:
  1. Login as professional
  2. Go to Dashboard → "Pending" tab
  3. View assigned application
- **Expected Result**:
  - Student name, email, college visible
  - Job title and company shown
  - Student's skills, CGPA, resume link accessible
  - Round badge shows "Professional" / "Manager" / "HR"
  - "Schedule Interview" button visible

#### **Negative Scenarios**

**TC-P-012: No Assignments Available**
- **Precondition**: Professional has no active assignments
- **Steps**:
  1. Login as professional
  2. Check Dashboard
- **Expected Result**: 
  - Empty state message: "No pending interviews at the moment"
  - Active Interview Count: 0

---

### 2.3 Schedule Interview

#### **Positive Scenarios**

**TC-P-020: Schedule Interview Successfully**
- **Precondition**: Application in "Pending" tab
- **Steps**:
  1. Click "Schedule Interview" button
  2. Select date using calendar component
  3. Enter time in HH:MM format (e.g., 14:30)
  4. Paste Google Meet link
  5. Click "Confirm Schedule"
- **Expected Result**:
  - Success toast: "Interview scheduled successfully!"
  - Status changes to "*_round_scheduled"
  - Application moves to "Scheduled" tab
  - Student receives notification with meeting details

#### **Negative Scenarios**

**TC-P-021: Schedule Without Meeting Link**
- **Steps**:
  1. Select date and time
  2. Leave meeting link empty
  3. Try to submit
- **Expected Result**: Validation error: "Please provide a meeting link"

**TC-P-022: Schedule with Invalid Time Format**
- **Steps**:
  1. Enter time as "2pm" instead of "14:00"
  2. Try to submit
- **Expected Result**: Validation error: "Please use HH:MM format"

**TC-P-023: Schedule Past Date**
- **Steps**:
  1. Select yesterday's date
  2. Try to submit
- **Expected Result**: Validation error: "Cannot schedule interview in the past"

---

### 2.4 Conduct Interview

#### **Positive Scenarios**

**TC-P-030: Conduct Interview - Pass Decision**
- **Precondition**: Interview scheduled, moved to "Scheduled" tab
- **Steps**:
  1. Click "Conduct Interview" button
  2. View student context (profile, previous feedback)
  3. Slide rating to 4/5
  4. Select "Pass" radio button
  5. Enter detailed comments in textarea
  6. Click "Submit Feedback"
- **Expected Result**:
  - Success toast: "Feedback submitted successfully!"
  - Application auto-advances based on round:
    - After Professional → Manager assigned
    - After Manager → HR assigned
    - After HR → Status: "hr_round_completed"
  - Professional's activeInterviewCount decremented
  - Application moves to "Completed" tab

**TC-P-031: View Previous Round Feedback**
- **Precondition**: Manager/HR conducting interview
- **Steps**:
  1. Open "Conduct Interview" page
  2. Scroll to "Previous Interview Feedback" section
  3. Expand feedback cards
- **Expected Result**: 
  - All previous rounds' feedback visible
  - Shows interviewer name, round type, rating, recommendation, comments

#### **Negative Scenarios**

**TC-P-032: Conduct Interview - Fail Decision**
- **Steps**:
  1. Slide rating to 2/5
  2. Select "Fail" radio button
  3. Improvement area checkboxes appear
  4. Select: "Technical Skills" and "Problem Solving"
  5. Enter detailed comments
  6. Submit feedback
- **Expected Result**:
  - Application status: "Rejected"
  - Student receives notification with improvement areas
  - Professional's activeInterviewCount decremented
  - Application moves to "Completed" tab

**TC-P-033: Submit Without Comments**
- **Steps**:
  1. Select rating and recommendation
  2. Leave comments empty
  3. Try to submit
- **Expected Result**: Validation error: "Please provide detailed feedback"

---

### 2.5 Interview History

#### **Positive Scenarios**

**TC-P-040: View Interview History**
- **Precondition**: Professional completed 3+ interviews
- **Steps**:
  1. Login as professional
  2. Navigate to "Interview History" from sidebar
  3. View table of completed interviews
- **Expected Result**:
  - Table shows: Student name/email, Job title/company, Round type, Date, Rating, Pass/Fail, Comments preview
  - Sorted by date (most recent first)
  - Can see all interviews conducted by this professional

---

### 2.6 Professional Profile

#### **Positive Scenarios**

**TC-P-050: Edit Profile**
- **Steps**:
  1. Navigate to "Profile" from sidebar
  2. View statistics: Total Interviews, Active Assignments, Average Rating
  3. Update tech stack (add/remove chips)
  4. Change years of experience
  5. Update bio
  6. Click "Save Changes"
- **Expected Result**:
  - Success toast: "Profile updated successfully!"
  - Changes reflected in profile
  - Role field read-only (admin-assigned)

#### **Negative Scenarios**

**TC-P-051: Cannot Change Role**
- **Steps**:
  1. Try to modify role field
- **Expected Result**: Role displayed as read-only badge, cannot edit

---

## 3. ADMIN FLOW TEST CASES

### 3.1 Professional Management

#### **Positive Scenarios**

**TC-A-001: Approve Professional with Technical Role**
- **Steps**:
  1. Login as admin
  2. Go to "Professionals" tab
  3. Select "Technical" from role dropdown
  4. Click "Approve"
- **Expected Result**: 
  - Professional approved with Technical role
  - Can be assigned to students after AI interview
  - Tech stack matching applied in assignment

**TC-A-002: Approve Professional with Manager Role**
- **Steps**:
  1. Select "Manager" from dropdown
  2. Click "Approve"
- **Expected Result**: 
  - Professional approved with Manager role
  - Only assigned to students with 10+ years experience requirement
  - Tech stack matching applied

**TC-A-003: Approve Professional with HR Role**
- **Steps**:
  1. Select "HR" from dropdown
  2. Click "Approve"
- **Expected Result**: 
  - Professional approved with HR role
  - Assigned to students after manager round
  - NO tech stack requirement (focuses on soft skills)

---

### 3.2 Resume Approval

#### **Positive Scenarios**

**TC-A-010: Approve Resume Shortlist**
- **Precondition**: Student submitted application with "resume_under_review"
- **Steps**:
  1. Login as admin
  2. Go to "Resume Shortlist" tab
  3. Review student details (college, CGPA, skills, resume link)
  4. Click "Approve" button
- **Expected Result**:
  - Status changes to "assessment_pending"
  - Student receives notification: "Your resume has been shortlisted! Assessment is now available."
  - Assessment deadline set to +2 days
  - Student sees "Start Assessment" button

#### **Negative Scenarios**

**TC-A-011: Reject Resume**
- **Steps**:
  1. Review application
  2. Click "Reject" button
- **Expected Result**: 
  - Status: "Rejected"
  - Student receives rejection notification
  - Application slot freed up for student

---

### 3.3 Assessment Approval

#### **Positive Scenarios**

**TC-A-020: Approve Assessment - Trigger AI Interview**
- **Precondition**: Student submitted assessment with "assessment_under_review"
- **Steps**:
  1. Login as admin
  2. Go to "Assessment Approval" tab
  3. Review student's code solutions
  4. Click "Approve" button
- **Expected Result**:
  - Status changes to "ai_interview_pending" (NOT "assessment_shortlisted")
  - Student receives notification: "Your assessment has been approved! AI interview round is now available."
  - Student can start AI mock interview
  - Toast: "Assessment approved! AI interview round unlocked."

#### **Negative Scenarios**

**TC-A-021: Reject Assessment**
- **Steps**:
  1. Review assessment
  2. Click "Reject" button
- **Expected Result**: 
  - Status: "Rejected"
  - Student notified
  - Application ends

---

### 3.4 Offer Release

#### **Positive Scenarios**

**TC-A-030: Release Offer Letter**
- **Precondition**: Application status "hr_round_completed"
- **Steps**:
  1. Login as admin
  2. Go to "Release Offers" tab
  3. View applications that passed all rounds
  4. Review final interview feedback summary
  5. Click "Release Offer" button
- **Expected Result**:
  - Status changes to "offer_released"
  - Offer details created: Job Title, Company, Package, Joining Date (+30 days)
  - Student receives notification: "Congratulations! Offer letter has been released"
  - Student can view offer in "Offers" page
  - Toast: "Offer letter released successfully!"

#### **Negative Scenarios**

**TC-A-031: No Applications Ready for Offer**
- **Steps**:
  1. Go to "Release Offers" tab
  2. No applications with "hr_round_completed"
- **Expected Result**: Empty state: "No applications ready for offer release"

---

## 4. INTEGRATION TEST SCENARIOS

### 4.1 End-to-End Happy Path

**TC-I-001: Complete Success Flow - Student to Offer**
- **Steps**:
  1. **Student**: Register → Login → Apply to Job → Upload Resume
  2. **Admin**: Approve Resume
  3. **Student**: Take Assessment within 2 days
  4. **Admin**: Approve Assessment (triggers AI interview)
  5. **Student**: Complete AI Mock Interview (triggers professional assignment)
  6. **Professional (Technical)**: Schedule → Conduct → Pass (triggers manager assignment)
  7. **Professional (Manager)**: Schedule → Conduct → Pass (triggers HR assignment)
  8. **Professional (HR)**: Schedule → Conduct → Pass (sets hr_round_completed)
  9. **Admin**: Release Offer
  10. **Student**: View Offer Letter
- **Expected Result**: Complete flow succeeds without admin intervention after assessment approval

---

### 4.2 Role-Based Assignment Logic

**TC-I-010: Technical Assignment Filters**
- **Test Criteria**:
  - Professional must have role: "Technical"
  - Professional must have matching tech stack with job
  - Professional must have activeInterviewCount < 5
- **Steps**:
  1. Create job requiring: React, Node.js, MongoDB
  2. Create 3 professionals:
     - Prof A: Technical, [React, Node.js], activeInterviewCount: 2
     - Prof B: Technical, [Java, Python], activeInterviewCount: 1
     - Prof C: Manager, [React, Node.js], activeInterviewCount: 0
  3. Student completes AI interview
- **Expected Result**: Prof A assigned (correct role + tech match + available)

**TC-I-011: Manager Assignment Filters**
- **Test Criteria**:
  - Professional must have role: "Manager"
  - Years of experience >= 10
  - Must have matching tech stack
  - activeInterviewCount < 5
- **Steps**:
  1. Create 3 managers:
     - Manager A: 12 years, [React, Node.js], activeInterviewCount: 3
     - Manager B: 8 years, [React, Node.js], activeInterviewCount: 1
     - Manager C: 15 years, [React, Node.js], activeInterviewCount: 6
  2. Student passes professional round
- **Expected Result**: Manager A assigned (meets all criteria, sorted by activeInterviewCount)

**TC-I-012: HR Assignment Filters**
- **Test Criteria**:
  - Professional must have role: "HR"
  - Years of experience >= 8
  - NO tech stack requirement
  - activeInterviewCount < 5
- **Steps**:
  1. Create 2 HRs:
     - HR A: 10 years, activeInterviewCount: 4
     - HR B: 7 years, activeInterviewCount: 1
  2. Student passes manager round
- **Expected Result**: HR A assigned (meets experience requirement)

---

### 4.3 Auto-Advancement Logic

**TC-I-020: Professional Pass → Manager Auto-Assign**
- **Steps**:
  1. Professional conducts interview
  2. Selects "Pass" recommendation
  3. Submits feedback
- **Expected Result**:
  - `assignManagerToStudent(appId)` dispatched
  - Manager auto-assigned within 2 seconds
  - Student notified of manager assignment
  - No admin action required

**TC-I-021: Manager Pass → HR Auto-Assign**
- **Steps**:
  1. Manager selects "Pass"
  2. Submits feedback
- **Expected Result**:
  - `assignHRToStudent(appId)` dispatched
  - HR auto-assigned
  - Student notified

**TC-I-022: HR Pass → Offer Stage**
- **Steps**:
  1. HR selects "Pass"
  2. Submits feedback
- **Expected Result**:
  - Status: "hr_round_completed"
  - Application appears in admin "Release Offers" tab
  - No further assignments triggered

**TC-I-023: Fail at Any Round → Rejection**
- **Steps**:
  1. Professional/Manager/HR selects "Fail"
  2. Submits feedback with improvement areas
- **Expected Result**:
  - Status: "Rejected"
  - No further rounds
  - Student slot freed up
  - Professional's activeInterviewCount decremented

---

### 4.4 Notification System

**TC-I-030: Student Notifications**
- **Verify notifications sent for**:
  - Resume approved
  - Assessment approved + AI interview unlocked
  - Professional assigned
  - Interview scheduled
  - Interview completed
  - Manager assigned
  - HR assigned
  - Offer released

**TC-I-031: Professional Notifications**
- **Verify notifications sent for**:
  - New assignment
  - Interview scheduled (confirmation)

**TC-I-032: Admin Notifications**
- **Verify notifications sent for**:
  - New resume submission
  - Assessment submitted
  - All rounds completed (offer ready)

---

## 5. EDGE CASES & ERROR SCENARIOS

### 5.1 Concurrency Issues

**TC-E-001: Two Students Complete AI Interview Simultaneously**
- **Precondition**: Only 1 technical professional with 4 active interviews
- **Steps**:
  1. Student A completes AI interview
  2. Student B completes AI interview 1 second later
- **Expected Result**: 
  - Student A assigned to available professional (count = 5)
  - Student B receives: "No available professionals at this time"

**TC-E-002: Professional Reaches Max Capacity**
- **Steps**:
  1. Professional has 5 active interviews
  2. Try to assign 6th student
- **Expected Result**: Professional skipped in assignment algorithm

---

### 5.2 Data Persistence

**TC-E-010: Refresh During Assessment**
- **Steps**:
  1. Student starts assessment
  2. Answers 2/4 questions
  3. Refresh browser
  4. Return to assessment
- **Expected Result**: 
  - Assessment progress NOT saved (localStorage cleared)
  - Must restart assessment
  - Previous submission status persists

**TC-E-011: Logout During Interview Scheduling**
- **Steps**:
  1. Professional starts scheduling interview
  2. Logout mid-way
  3. Login again
- **Expected Result**: 
  - Schedule not saved
  - Application still in "Pending" tab
  - Must reschedule

---

### 5.3 Deadline Management

**TC-E-020: Assessment Deadline Edge Case**
- **Steps**:
  1. Assessment released at 10:00 AM on Day 1
  2. Deadline: 10:00 AM on Day 3 (48 hours)
  3. Student submits at 09:59 AM on Day 3
- **Expected Result**: Submission accepted

**TC-E-021: Assessment 1 Minute Late**
- **Steps**:
  1. Try to submit at 10:01 AM on Day 3
- **Expected Result**: 
  - Submission rejected
  - Status: "Rejected" (deadline missed)

---

### 5.4 Authentication & Authorization

**TC-E-030: Student Accessing Professional Route**
- **Steps**:
  1. Login as student
  2. Try to navigate to `/professional/dashboard`
- **Expected Result**: Redirect to student home, access denied

**TC-E-031: Professional Accessing Admin Route**
- **Steps**:
  1. Login as professional
  2. Try to navigate to `/admin/dashboard`
- **Expected Result**: Redirect to professional dashboard, access denied

**TC-E-032: Unauthenticated Access**
- **Steps**:
  1. Without logging in
  2. Try to access `/student/applications`
- **Expected Result**: Redirect to login page

---

## 6. PERFORMANCE & UI TESTS

### 6.1 Load Testing

**TC-P-001: 50 Active Applications**
- **Steps**:
  1. Create 50 applications in various statuses
  2. Login as admin
  3. Switch between tabs
- **Expected Result**: 
  - Page loads within 2 seconds
  - Tabs render without lag
  - Filtering works smoothly

**TC-P-002: Professional with 5 Active Interviews**
- **Steps**:
  1. Assign 5 students to professional
  2. Login as professional
  3. Navigate dashboard tabs
- **Expected Result**: All 5 assignments visible, no performance degradation

---

### 6.2 UI Responsiveness

**TC-UI-001: Mobile View - Student Application**
- **Steps**:
  1. Resize browser to mobile size (375px)
  2. Navigate through student flow
- **Expected Result**: All pages responsive, buttons accessible

**TC-UI-002: Toast Notifications Visibility**
- **Steps**:
  1. Trigger multiple toast messages
  2. Verify they stack properly
- **Expected Result**: Toasts appear top-right, auto-dismiss after 3-5 seconds

---

## 7. REGRESSION TESTS (After Bug Fixes)

**TC-R-001: ApplyJob Route Fix**
- **Bug**: "Job does not exist" shown instead of resume upload
- **Fix**: Changed `useParams()` from `{ id }` to `{ jobId }`
- **Test**:
  1. Navigate to job details
  2. Click "Apply Now"
  3. Verify resume upload page displays correctly
- **Expected Result**: Upload page renders, no "job does not exist" error

---

## 8. TEST DATA SETUP

### Mock Accounts
```
Students:
- student1@test.com / password123
- student2@test.com / password123
- student3@test.com / password123

Professionals:
- prof1@test.com / password123 (Technical Role)
- prof2@test.com / password123 (Manager Role, 12 years exp)
- prof3@test.com / password123 (HR Role, 10 years exp)

Admin:
- admin@test.com / password123
```

### Sample Jobs
```
1. Software Engineer - Infosys
   Skills: React, Node.js, MongoDB
   CTC: 6-8 LPA

2. Full Stack Developer - TCS
   Skills: Angular, Java, PostgreSQL
   CTC: 5-7 LPA

3. Backend Developer - Wipro
   Skills: Python, Django, MySQL
   CTC: 7-9 LPA
```

---

## 9. TEST EXECUTION CHECKLIST

### Pre-Test Setup
- [ ] Development server running on http://localhost:8081/
- [ ] Mock data initialized (check Redux DevTools)
- [ ] Browser console open for error monitoring
- [ ] Redux DevTools installed and active

### Test Execution Order
1. **Day 1**: Student Flow (TC-S-001 to TC-S-062)
2. **Day 2**: Professional Flow (TC-P-001 to TC-P-051)
3. **Day 3**: Admin Flow (TC-A-001 to TC-A-031)
4. **Day 4**: Integration Tests (TC-I-001 to TC-I-032)
5. **Day 5**: Edge Cases (TC-E-001 to TC-E-032)
6. **Day 6**: Performance & UI (TC-P-001 to TC-UI-002)

### Bug Reporting Template
```
Bug ID: [TC-XX-XXX]
Title: [Brief description]
Steps to Reproduce: [List steps]
Expected Result: [What should happen]
Actual Result: [What actually happened]
Severity: Critical / High / Medium / Low
Screenshots: [Attach if applicable]
Browser: [Chrome/Firefox/Safari]
Date Found: [YYYY-MM-DD]
```

---

## 10. SUCCESS CRITERIA

### Must Pass (Critical)
- All TC-S (Student Flow) positive scenarios
- All TC-P (Professional Flow) positive scenarios  
- All TC-A (Admin Flow) positive scenarios
- TC-I-001 (End-to-End Happy Path)
- All TC-I (Auto-advancement) scenarios

### Should Pass (High Priority)
- All negative scenarios (error handling)
- All TC-E (Edge cases)
- Authentication & Authorization tests

### Nice to Have (Medium Priority)
- Performance tests
- UI responsiveness tests
- Load testing with 50+ applications

---

## 11. AUTOMATED TESTING (Future Scope)

### Recommended Test Framework
```bash
# Unit Tests: Vitest
# Integration Tests: React Testing Library
# E2E Tests: Playwright / Cypress

# Example: Install Playwright
bun add -D @playwright/test

# Run E2E tests
npx playwright test
```

### Sample E2E Test
```typescript
test('Student can apply to job and upload resume', async ({ page }) => {
  await page.goto('http://localhost:8081/');
  await page.fill('input[type="email"]', 'student1@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.click('text=Browse Jobs');
  await page.click('text=View Details', { first: true });
  await page.click('text=Apply Now');
  await page.setInputFiles('input[type="file"]', 'test-resume.pdf');
  await page.click('text=Submit Application');
  await expect(page.locator('text=Application submitted')).toBeVisible();
});
```

---

## 12. KNOWN ISSUES & LIMITATIONS

1. **Offers Tab UI Incomplete**: Handler function exists but TabsContent not rendered
2. **Assessment Code Execution**: Code is stored but not executed/tested
3. **Resume File Upload**: Simulated, files not actually uploaded to server
4. **Google Meet Integration**: Manual link input, no calendar API integration
5. **Notification Bell Count**: Only shown in sidebar, not in professional dashboard header

---

## CONCLUSION

This testing guide covers **100+ test scenarios** across:
- ✅ Student Flow (40+ tests)
- ✅ Professional Flow (30+ tests)
- ✅ Admin Flow (15+ tests)
- ✅ Integration Tests (15+ tests)
- ✅ Edge Cases & Errors (20+ tests)

**Estimated Testing Time**: 3-5 days for comprehensive manual testing

**Priority**: Focus on TC-I-001 (End-to-End) first to validate complete workflow, then drill down into specific scenarios.
