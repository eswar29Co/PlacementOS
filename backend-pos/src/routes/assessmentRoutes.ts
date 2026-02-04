import { Router } from 'express';
import {
  releaseAssessment,
  getAssessment,
  getAssessmentByApplicationId,
  startAssessment,
  submitAssessment,
  reviewAssessmentResults,
  reviewSingleAssessment,
  getMyAssessments,
} from '../controllers/assessmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/v1/assessments/release
 * @desc    Release assessment for an application
 * @access  Private (Admin)
 */
router.post('/release', authenticate, authorize('admin', 'superadmin'), releaseAssessment);
router.post('/release/:applicationId', authenticate, authorize('admin', 'superadmin'), releaseAssessment);

/**
 * @route   GET /api/v1/assessments/my-assessments
 * @desc    Get student's assessments
 * @access  Private (Student)
 */
router.get('/my-assessments', authenticate, authorize('student'), getMyAssessments);

/**
 * @route   GET /api/v1/assessments/application/:applicationId
 * @desc    Get assessment by application ID
 * @access  Private (Student, Admin)
 */
router.get('/application/:applicationId', authenticate, authorize('student', 'admin', 'superadmin'), getAssessmentByApplicationId);

/**
 * @route   GET /api/v1/assessments/:id
 * @desc    Get assessment details
 * @access  Private (Student)
 */
router.get('/:id', authenticate, authorize('student'), getAssessment);

/**
 * @route   POST /api/v1/assessments/:id/start
 * @desc    Start assessment
 * @access  Private (Student)
 */
router.post('/:id/start', authenticate, authorize('student'), startAssessment);

/**
 * @route   POST /api/v1/assessments/:id/submit
 * @desc    Submit assessment
 * @access  Private (Student)
 */
router.post('/:id/submit', authenticate, authorize('student'), submitAssessment);

/**
 * @route   POST /api/v1/assessments/review
 * @desc    Review assessment results
 * @access  Private (Admin)
 */
router.post('/review', authenticate, authorize('admin', 'superadmin'), reviewAssessmentResults);
router.post('/:id/review', authenticate, authorize('admin', 'superadmin'), reviewSingleAssessment);

export default router;
