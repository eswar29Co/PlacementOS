import { Response } from 'express';
import { Student } from '../models/Student';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all students (Admin only)
 */
export const getAllStudents = async (_req: AuthRequest, res: Response) => {
  try {
    const students = await Student.find()
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, students, 'Students fetched successfully');
  } catch (error: any) {
    console.error('Get all students error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch students');
  }
};

/**
 * Get student by ID
 */
export const getStudentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id).select('-password -refreshToken');

    if (!student) {
      return ApiResponse.notFound(res, 'Student not found');
    }

    return ApiResponse.success(res, student, 'Student fetched successfully');
  } catch (error: any) {
    console.error('Get student error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch student');
  }
};

/**
 * Update student profile
 */
export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.email;
    delete updates.role;
    delete updates.refreshToken;

    const student = await Student.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!student) {
      return ApiResponse.notFound(res, 'Student not found');
    }

    return ApiResponse.success(res, student, 'Student updated successfully');
  } catch (error: any) {
    console.error('Update student error:', error);
    return ApiResponse.error(res, error.message || 'Failed to update student');
  }
};

/**
 * Delete student (Admin only)
 */
export const deleteStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return ApiResponse.notFound(res, 'Student not found');
    }

    return ApiResponse.success(res, null, 'Student deleted successfully');
  } catch (error: any) {
    console.error('Delete student error:', error);
    return ApiResponse.error(res, error.message || 'Failed to delete student');
  }
};

/**
 * Get student statistics
 */
export const getStudentStatistics = async (_req: AuthRequest, res: Response) => {
  try {
    const totalStudents = await Student.countDocuments();
    const graduationYears = await Student.aggregate([
      {
        $group: {
          _id: '$graduationYear',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const topColleges = await Student.aggregate([
      {
        $group: {
          _id: '$college',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return ApiResponse.success(res, {
      totalStudents,
      graduationYears,
      topColleges,
    }, 'Statistics fetched successfully');
  } catch (error: any) {
    console.error('Get student statistics error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch statistics');
  }
};
