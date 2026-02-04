import { Router } from 'express';
import {
  createJob,
  updateJob,
  deleteJob,
  getJobs,
  getJobById,
  getRecommendedJobs,
  getJobStatistics,
} from '../controllers/jobController';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/jobs
 * @desc    Get all jobs with optional filters
 * @access  Public/Private
 */
router.get('/', optionalAuthenticate, getJobs);

/**
 * @route   GET /api/v1/jobs/statistics
 * @desc    Get job statistics
 * @access  Private (Admin)
 */
router.get('/statistics', authenticate, authorize('admin', 'superadmin'), getJobStatistics);

/**
 * @route   GET /api/v1/jobs/recommended
 * @desc    Get recommended jobs for student
 * @access  Private (Student)
 */
router.get('/recommended', authenticate, authorize('student'), getRecommendedJobs);

/**
 * @route   GET /api/v1/jobs/:id
 * @desc    Get a single job by ID
 * @access  Public/Private
 */
router.get('/:id', getJobById);

/**
 * @route   POST /api/v1/jobs
 * @desc    Create a new job
 * @access  Private (Admin)
 */
router.post('/', authenticate, authorize('admin', 'superadmin'), createJob);

/**
 * @route   PUT /api/v1/jobs/:id
 * @desc    Update a job
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, authorize('admin', 'superadmin'), updateJob);

/**
 * @route   DELETE /api/v1/jobs/:id
 * @desc    Delete a job
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), deleteJob);

export default router;
