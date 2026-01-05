import { ApplicationStatus } from '@/types';

/**
 * Flow Management Helpers for PlacementOS
 * 
 * Application Flow:
 * 1. applied → resume_under_review
 * 2. Admin approves resume → assessment_pending (student can now take assessment)
 * 3. Student submits assessment → assessment_completed
 * 4. Admin reviews assessment → assessment_approved (unlocks AI interview)
 * 5. Student completes AI interview → ai_interview_completed
 * 6. Admin assigns professional → professional_interview_pending
 * 7. Professional completes interview → professional_interview_completed
 * 8. Admin assigns manager → manager_interview_pending
 * 9. Manager completes interview → manager_interview_completed
 * 10. Admin assigns HR → hr_interview_pending
 * 11. HR completes interview → hr_interview_completed
 * 12. Admin releases offer → offer_released
 * 13. Student accepts/rejects → offer_accepted/offer_rejected
 */

// Status that allows student to take assessment
export const canTakeAssessment = (status: ApplicationStatus): boolean => {
  return status === 'assessment_pending' || status === 'assessment_released';
};

// Status that allows student to take AI interview
export const canTakeAIInterview = (status: ApplicationStatus): boolean => {
  return status === 'ai_interview_pending';
};

// Status that indicates assessment is awaiting admin review
export const isAssessmentPendingReview = (status: ApplicationStatus): boolean => {
  return status === 'assessment_completed' || status === 'assessment_submitted';
};

// Status that indicates AI interview is completed and awaiting admin action
export const isAIInterviewPendingReview = (status: ApplicationStatus): boolean => {
  return status === 'ai_interview_completed';
};

// Status that allows professional to conduct interview
export const canConductInterview = (status: ApplicationStatus): boolean => {
  return [
    'professional_interview_pending',
    'professional_interview_scheduled',
    'manager_interview_pending',
    'manager_interview_scheduled',
    'hr_interview_pending',
    'hr_interview_scheduled'
  ].includes(status);
};

// Check if application is in any interview stage
export const isInInterviewStage = (status: ApplicationStatus): boolean => {
  return [
    'ai_interview_pending',
    'ai_interview_completed',
    'professional_interview_pending',
    'professional_interview_scheduled',
    'professional_interview_completed',
    'manager_interview_pending',
    'manager_interview_scheduled',
    'manager_interview_completed',
    'hr_interview_pending',
    'hr_interview_scheduled',
    'hr_interview_completed'
  ].includes(status);
};

// Check if application reached offer stage
export const isOfferStage = (status: ApplicationStatus): boolean => {
  return ['offer_released', 'offer_accepted', 'offer_rejected'].includes(status);
};

// Check if application is rejected
export const isRejected = (status: ApplicationStatus): boolean => {
  return status === 'rejected' || status === 'resume_rejected' || status === 'assessment_rejected';
};

// Get next status after resume approval
export const getStatusAfterResumeApproval = (): ApplicationStatus => {
  return 'assessment_pending';
};

// Get next status after assessment submission
export const getStatusAfterAssessmentSubmission = (): ApplicationStatus => {
  return 'assessment_completed';
};

// Get next status after assessment approval by admin
export const getStatusAfterAssessmentApproval = (): ApplicationStatus => {
  return 'ai_interview_pending';
};

// Get next status after AI interview completion
export const getStatusAfterAIInterview = (): ApplicationStatus => {
  return 'ai_interview_completed';
};

// Get next status after professional interview completion
export const getStatusAfterProfessionalInterview = (): ApplicationStatus => {
  return 'professional_interview_completed';
};

// Get next status after manager interview completion
export const getStatusAfterManagerInterview = (): ApplicationStatus => {
  return 'manager_interview_completed';
};

// Get next status after HR interview completion
export const getStatusAfterHRInterview = (): ApplicationStatus => {
  return 'hr_interview_completed';
};

// Check what stage comes next for admin to trigger
export const getNextInterviewStage = (status: ApplicationStatus): 'tech' | 'manager' | 'hr' | 'offer' | null => {
  if (status === 'ai_interview_completed') return 'tech';
  if (status === 'professional_interview_completed') return 'manager';
  if (status === 'manager_interview_completed') return 'hr';
  if (status === 'hr_interview_completed') return 'offer';
  return null;
};

// Human-readable status labels for student view
export const getStatusLabel = (status: ApplicationStatus): string => {
  const statusLabels: Record<ApplicationStatus, string> = {
    applied: 'Application Submitted',
    resume_under_review: 'Resume Under Review',
    resume_approved: 'Resume Approved',
    resume_shortlisted: 'Resume Shortlisted',
    resume_rejected: 'Resume Rejected',
    assessment_pending: 'Assessment Available - Please Complete',
    assessment_released: 'Assessment Available',
    assessment_in_progress: 'Assessment In Progress',
    assessment_completed: 'Assessment Submitted - Under Review',
    assessment_submitted: 'Assessment Submitted',
    assessment_under_review: 'Assessment Under Review',
    assessment_shortlisted: 'Assessment Shortlisted',
    assessment_approved: 'Assessment Approved',
    assessment_rejected: 'Assessment Not Cleared',
    ai_interview_pending: 'AI Interview Available',
    ai_interview_completed: 'AI Interview Completed',
    professional_interview_pending: 'Technical Interview Pending',
    professional_interview_scheduled: 'Technical Interview Scheduled',
    professional_interview_completed: 'Technical Interview Completed',
    manager_interview_pending: 'Manager Round Pending',
    manager_round_pending: 'Manager Interview Pending',
    manager_interview_scheduled: 'Manager Interview Scheduled',
    manager_interview_completed: 'Manager Interview Completed',
    manager_round_completed: 'Manager Round Completed',
    hr_interview_pending: 'HR Round Pending',
    hr_round_pending: 'HR Interview Pending',
    hr_interview_scheduled: 'HR Interview Scheduled',
    hr_interview_completed: 'HR Interview Completed',
    hr_round_completed: 'HR Round Completed',
    offer_released: 'Offer Released',
    offer_accepted: 'Offer Accepted',
    offer_rejected: 'Offer Rejected',
    rejected: 'Application Rejected'
  };
  return statusLabels[status] || status;
};

// Get badge variant for status
export const getStatusVariant = (status: ApplicationStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (isRejected(status)) return 'destructive';
  if (isOfferStage(status)) {
    if (status === 'offer_accepted') return 'default';
    if (status === 'offer_rejected') return 'destructive';
    return 'secondary';
  }
  if (canTakeAssessment(status) || canTakeAIInterview(status)) return 'default';
  return 'secondary';
};

// Check if student should see an action button
export const hasActionRequired = (status: ApplicationStatus): boolean => {
  return canTakeAssessment(status) || canTakeAIInterview(status);
};

// Get action button text
export const getActionButtonText = (status: ApplicationStatus): string => {
  if (canTakeAssessment(status)) return 'Take Assessment';
  if (canTakeAIInterview(status)) return 'Start AI Interview';
  return '';
};

// Get action route
export const getActionRoute = (status: ApplicationStatus, applicationId: string): string => {
  if (canTakeAssessment(status)) return `/student/assessment/${applicationId}`;
  if (canTakeAIInterview(status)) return `/student/ai-interview/${applicationId}`;
  return '';
};
