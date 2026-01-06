import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/dashboard/stats
 * @desc    Get dashboard statistics based on user role
 * @access  Private
 */
router.get('/stats', authenticate, getDashboardStats);

export default router;
