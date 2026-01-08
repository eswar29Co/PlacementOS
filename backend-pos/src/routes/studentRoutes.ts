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
router.get('/', authenticate, authorize('admin'), getAllStudents);

/**
 * @route   GET /api/v1/students/statistics
 * @desc    Get student statistics (Admin only)
 * @access  Admin
 */
router.get('/statistics', authenticate, authorize('admin'), getStudentStatistics);

/**
 * @route   GET /api/v1/students/:id
 * @desc    Get student by ID
 * @access  Admin, Student (own profile)
 */
router.get('/:id', authenticate, getStudentById);

/**
 * @route   PUT /api/v1/students/:id
 * @desc    Update student profile
 * @access  Admin, Student (own profile)
 */
router.put('/:id', authenticate, updateStudent);

/**
 * @route   DELETE /api/v1/students/:id
 * @desc    Delete student (Admin only)
 * @access  Admin
 */
router.delete('/:id', authenticate, authorize('admin'), deleteStudent);

export default router;
