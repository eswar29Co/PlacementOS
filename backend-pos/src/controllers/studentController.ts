import { Response } from 'express';
import { Student } from '../models/Student';
import { Admin } from '../models/Admin';
import { Notification } from '../models/Notification';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all students (Admin only)
 */
export const getAllStudents = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;

    let filter: any = {};
    if (role === 'admin') {
      const admin = await Admin.findById(userId);
      if (admin && admin.collegeId) {
        filter.collegeId = admin.collegeId;
      }
    }

    const students = await Student.find(filter)
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
    const { userId, role } = req.user!;

    const student = await Student.findById(id).select('-password -refreshToken');

    if (!student) {
      return ApiResponse.notFound(res, 'Student not found');
    }

    // Security check for TPO
    if (role === 'admin') {
      const admin = await Admin.findById(userId);
      if (admin && admin.collegeId) {
        if (!student.collegeId || student.collegeId.toString() !== admin.collegeId.toString()) {
          return ApiResponse.forbidden(res, 'You are not authorized to view this student');
        }
      }
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
    const { userId, role } = req.user!;
    const updates = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return ApiResponse.notFound(res, 'Student not found');
    }

    // Security check for TPO
    if (role === 'admin') {
      const admin = await Admin.findById(userId);
      if (admin && admin.collegeId) {
        if (!student.collegeId || student.collegeId.toString() !== admin.collegeId.toString()) {
          return ApiResponse.forbidden(res, 'You are not authorized to update this student');
        }
      }
    }

    // Remove fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.email;
    delete updates.role;
    delete updates.refreshToken;

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    // Create notification
    await Notification.create({
      userId: student._id,
      type: 'profile_update',
      title: 'Profile Updated',
      message: 'Your student profile has been successfully updated.',
      read: false,
      createdAt: new Date(),
    });

    return ApiResponse.success(res, updatedStudent, 'Student updated successfully');
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
    const { userId, role } = req.user!;

    const student = await Student.findById(id);
    if (!student) {
      return ApiResponse.notFound(res, 'Student not found');
    }

    // Security check for TPO
    if (role === 'admin') {
      const admin = await Admin.findById(userId);
      if (admin && admin.collegeId) {
        if (!student.collegeId || student.collegeId.toString() !== admin.collegeId.toString()) {
          return ApiResponse.forbidden(res, 'You are not authorized to delete this student');
        }
      }
    }

    await Student.findByIdAndDelete(id);

    return ApiResponse.success(res, null, 'Student deleted successfully');
  } catch (error: any) {
    console.error('Delete student error:', error);
    return ApiResponse.error(res, error.message || 'Failed to delete student');
  }
};

/**
 * Get student statistics
 */
export const getStudentStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    let filter: any = {};

    if (role === 'admin') {
      const admin = await Admin.findById(userId);
      if (admin && admin.collegeId) {
        filter.collegeId = admin.collegeId;
      }
    }

    const totalStudents = await Student.countDocuments(filter);
    const graduationYears = await Student.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$graduationYear',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const topColleges = await Student.aggregate([
      { $match: filter },
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
