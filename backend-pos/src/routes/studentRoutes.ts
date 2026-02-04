import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentStatistics,
} from '../controllers/studentController';

const router = Router();

/**
 * @route   GET /api/v1/students
 * @desc    Get all students (Admin only)
 * @access  Admin
 */
router.get('/', authenticate, authorize('admin', 'superadmin'), getAllStudents);

/**
 * @route   GET /api/v1/students/statistics
 * @desc    Get student statistics (Admin only)
 * @access  Admin
 */
router.get('/statistics', authenticate, authorize('admin', 'superadmin'), getStudentStatistics);

/**
 * @route   GET /api/v1/students/:id
 * @desc    Get student by ID
 * @access  Admin, Student (own profile)
 */
router.get('/:id', authenticate, authorize('admin', 'superadmin', 'student'), getStudentById);
router.put('/:id', authenticate, authorize('admin', 'superadmin', 'student'), updateStudent);
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), deleteStudent);

export default router;
