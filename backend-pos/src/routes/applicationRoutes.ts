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
router.get('/', authenticate, authorize('admin'), getAllApplications);

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
router.put('/:id/status', authenticate, authorize('admin'), updateApplicationStatus);

/**
 * @route   POST /api/v1/applications/shortlist-resumes
 * @desc    Shortlist resumes based on ATS score
 * @access  Private (Admin)
 */
router.post('/shortlist-resumes', authenticate, authorize('admin'), shortlistResumes);

/**
 * @route   POST /api/v1/applications/:id/assign-professional
 * @desc    Assign professional to application
 * @access  Private (Admin)
 */
router.post('/:id/assign-professional', authenticate, authorize('admin'), assignProfessional);

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

export default router;
