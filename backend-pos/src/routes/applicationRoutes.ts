import { Router } from 'express';
import {
  applyForJob,
  getAllApplications,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus,
  shortlistResumes,
  getAssignedApplications,
  assignProfessional,
  scheduleInterview,
  submitInterviewFeedback,
  submitAssessment,
  approveResume,
  rejectResume,
  approveAssessment,
  rejectAssessment,
  approveAIInterview,
  rejectAIInterview,
  submitAIInterview,
  acceptOffer,
  rejectOffer,
} from '../controllers/applicationController';

import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/v1/applications/apply
 * @desc    Student applies for a job
 * @access  Private (Student)
 */
router.post('/apply', authenticate, authorize('student'), applyForJob);

/**
 * @route   GET /api/v1/applications
 * @desc    Get all applications (Admin)
 * @access  Private (Admin)
 */
router.get('/', authenticate, authorize('admin', 'superadmin'), getAllApplications);

/**
 * @route   GET /api/v1/applications/my-applications
 * @desc    Get student's own applications
 * @access  Private (Student)
 */
router.get('/my-applications', authenticate, authorize('student'), getMyApplications);

/**
 * @route   GET /api/v1/applications/assigned
 * @desc    Get applications assigned to professional
 * @access  Private (Professional)
 */
router.get('/assigned', authenticate, authorize('professional'), getAssignedApplications);

/**
 * @route   GET /api/v1/applications/:id
 * @desc    Get single application
 * @access  Private
 */
router.get('/:id', authenticate, getApplicationById);

/**
 * @route   PUT /api/v1/applications/:id/status
 * @desc    Update application status
 * @access  Private (Admin)
 */
router.put('/:id/status', authenticate, authorize('admin', 'superadmin'), updateApplicationStatus);

/**
 * @route   POST /api/v1/applications/shortlist-resumes
 * @desc    Shortlist resumes based on ATS score
 * @access  Private (Admin)
 */
router.post('/shortlist-resumes', authenticate, authorize('admin', 'superadmin'), shortlistResumes);

/**
 * @route   POST /api/v1/applications/:id/assign-professional
 * @desc    Assign professional to application
 * @access  Private (Admin)
 */
router.post('/:id/assign-professional', authenticate, authorize('admin', 'superadmin'), assignProfessional);

/**
 * @route   POST /api/v1/applications/:id/schedule-interview
 * @desc    Schedule interview
 * @access  Private (Professional)
 */
router.post('/:id/schedule-interview', authenticate, authorize('professional'), scheduleInterview);

/**
 * @route   POST /api/v1/applications/:id/interview-feedback
 * @desc    Submit interview feedback
 * @access  Private (Professional)
 */
router.post('/:id/interview-feedback', authenticate, authorize('professional'), submitInterviewFeedback);

/**
 * @route   POST /api/v1/applications/submit-assessment
 * @desc    Submit assessment
 * @access  Private (Student)
 */
router.post('/submit-assessment', authenticate, authorize('student'), submitAssessment);

/**
 * @route   POST /api/v1/applications/submit-ai-interview
 * @desc    Submit AI interview
 * @access  Private (Student)
 */
router.post('/submit-ai-interview', authenticate, authorize('student'), submitAIInterview);

/**
 * @route   POST /api/v1/applications/:id/approve-resume
 * @desc    Approve resume
 * @access  Private (Admin)
 */
router.post('/:id/approve-resume', authenticate, authorize('admin', 'superadmin'), approveResume);

/**
 * @route   POST /api/v1/applications/:id/reject-resume
 * @desc    Reject resume
 * @access  Private (Admin)
 */
router.post('/:id/reject-resume', authenticate, authorize('admin', 'superadmin'), rejectResume);

/**
 * @route   POST /api/v1/applications/:id/approve-assessment
 * @desc    Approve assessment
 * @access  Private (Admin)
 */
router.post('/:id/approve-assessment', authenticate, authorize('admin', 'superadmin'), approveAssessment);

/**
 * @route   POST /api/v1/applications/:id/reject-assessment
 * @desc    Reject assessment
 * @access  Private (Admin)
 */
router.post('/:id/reject-assessment', authenticate, authorize('admin', 'superadmin'), rejectAssessment);

/**
 * @route   POST /api/v1/applications/:id/approve-ai-interview
 * @desc    Approve AI interview
 * @access  Private (Admin)
 */
router.post('/:id/approve-ai-interview', authenticate, authorize('admin', 'superadmin'), approveAIInterview);

/**
 * @route   POST /api/v1/applications/:id/reject-ai-interview
 * @desc    Reject AI interview
 * @access  Private (Admin)
 */
router.post('/:id/reject-ai-interview', authenticate, authorize('admin', 'superadmin'), rejectAIInterview);

/**
 * @route   POST /api/v1/applications/:id/accept-offer
 * @desc    Accept offer (student)
 * @access  Private (Student)
 */
router.post('/:id/accept-offer', authenticate, authorize('student'), acceptOffer);

/**
 * @route   POST /api/v1/applications/:id/reject-offer
 * @desc    Reject offer (student)
 * @access  Private (Student)
 */
router.post('/:id/reject-offer', authenticate, authorize('student'), rejectOffer);

export default router;
