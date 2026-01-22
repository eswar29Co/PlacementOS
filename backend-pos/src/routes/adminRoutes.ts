import { Router } from 'express';
import { getAdminAnalytics, getStudentProfileHistory, getProfessionalProfileHistory } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/admin/analytics
 * @desc    Get comprehensive analytics for admin dashboard
 * @access  Private (Admin only)
 */
router.get('/analytics', authenticate, authorize('admin'), getAdminAnalytics);

/**
 * @route   GET /api/v1/admin/students/:id/history
 * @desc    Get student profile with full application history
 * @access  Private (Admin only)
 */
router.get('/students/:id/history', authenticate, authorize('admin'), getStudentProfileHistory);

/**
 * @route   GET /api/v1/admin/professionals/:id/history
 * @desc    Get professional profile with interview history
 * @access  Private (Admin only)
 */
router.get('/professionals/:id/history', authenticate, authorize('admin'), getProfessionalProfileHistory);

export default router;
