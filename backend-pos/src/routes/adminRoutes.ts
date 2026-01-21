import { Router } from 'express';
import { getAdminAnalytics } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/admin/analytics
 * @desc    Get comprehensive analytics for admin dashboard
 * @access  Private (Admin only)
 */
router.get('/analytics', authenticate, authorize('admin'), getAdminAnalytics);

export default router;
