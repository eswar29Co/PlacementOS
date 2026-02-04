import { Router } from 'express';
import {
  getAllProfessionals,
  getPendingProfessionals,
  updateProfessionalStatus,
  getProfessionalStatistics,
  getAvailableProfessionals,
  updateProfessionalProfile,
} from '../controllers/professionalController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/professionals
 * @desc    Get all professionals
 * @access  Private (Admin)
 */
router.get('/', authenticate, authorize('admin', 'superadmin'), getAllProfessionals);

/**
 * @route   GET /api/v1/professionals/pending
 * @desc    Get pending professionals
 * @access  Private (Admin)
 */
router.get('/pending', authenticate, authorize('superadmin'), getPendingProfessionals);

/**
 * @route   GET /api/v1/professionals/available
 * @desc    Get available professionals for assignment
 * @access  Private (Admin)
 */
router.get('/available', authenticate, authorize('admin', 'superadmin'), getAvailableProfessionals);

/**
 * @route   GET /api/v1/professionals/:id/statistics
 * @desc    Get professional statistics
 * @access  Private
 */
router.get('/:id/statistics', authenticate, getProfessionalStatistics);

/**
 * @route   PUT /api/v1/professionals/:id/status
 * @desc    Approve/Reject professional
 * @access  Private (Admin)
 */
router.put('/:id/status', authenticate, authorize('superadmin'), updateProfessionalStatus);

/**
 * @route   PUT /api/v1/professionals/profile
 * @desc    Update professional profile
 * @access  Private (Professional)
 */
router.put('/profile', authenticate, authorize('professional'), updateProfessionalProfile);

export default router;
