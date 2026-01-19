import { Response } from 'express';
import { Professional } from '../models/Professional';
import { Notification } from '../models/Notification';
import { Application } from '../models/Application';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';

// Admin: Get all professionals
export const getAllProfessionals = async (req: AuthRequest, res: Response) => {
  try {
    const { status, professionalRole, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (professionalRole) query.professionalRole = professionalRole;

    const skip = (Number(page) - 1) * Number(limit);

    const professionals = await Professional.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Professional.countDocuments(query);

    return ApiResponse.success(res, {
      professionals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get professionals error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch professionals');
  }
};

// Admin: Get pending professionals
export const getPendingProfessionals = async (_: AuthRequest, res: Response) => {
  try {
    const professionals = await Professional.find({ status: 'pending' })
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, professionals);
  } catch (error: any) {
    console.error('Get pending professionals error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch pending professionals');
  }
};

// Admin: Approve/Reject professional
export const updateProfessionalStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return ApiResponse.badRequest(res, 'Invalid status. Use approved or rejected');
    }

    const professional = await Professional.findById(id);

    if (!professional) {
      return ApiResponse.notFound(res, 'Professional not found');
    }

    professional.status = status;
    await professional.save();

    // Create notification
    await Notification.create({
      userId: professional._id,
      type: status === 'approved' ? 'professional_approved' : 'professional_rejected',
      title: status === 'approved' ? 'Account Approved' : 'Account Status Update',
      message:
        status === 'approved'
          ? 'Congratulations! Your professional account has been approved. You can now conduct interviews.'
          : 'Your professional account application has been reviewed. Please contact admin for more details.',
      read: false,
      createdAt: new Date(),
    });

    return ApiResponse.success(
      res,
      professional,
      `Professional ${status === 'approved' ? 'approved' : 'rejected'} successfully`
    );
  } catch (error: any) {
    console.error('Update professional status error:', error);
    return ApiResponse.error(res, error.message || 'Failed to update professional status');
  }
};

// Get professional statistics
export const getProfessionalStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const professional = await Professional.findById(id);

    if (!professional) {
      return ApiResponse.notFound(res, 'Professional not found');
    }

    // Get interview stats
    const completedInterviews = await Application.countDocuments({
      $or: [
        { assignedProfessionalId: id, status: { $in: ['professional_interview_completed', 'manager_round_completed', 'hr_round_completed'] } },
        { assignedManagerId: id, status: { $in: ['manager_round_completed', 'hr_round_completed'] } },
        { assignedHRId: id, status: 'hr_round_completed' },
      ],
    });

    const activeInterviews = await Application.countDocuments({
      $or: [
        { assignedProfessionalId: id, status: { $in: ['professional_interview_pending', 'professional_interview_scheduled'] } },
        { assignedManagerId: id, status: { $in: ['manager_interview_pending', 'manager_interview_scheduled'] } },
        { assignedHRId: id, status: { $in: ['hr_interview_pending', 'hr_interview_scheduled'] } },
      ],
    });

    return ApiResponse.success(res, {
      professional,
      statistics: {
        completedInterviews,
        activeInterviews,
        totalInterviews: professional.interviewsTaken,
        rating: professional.rating,
      },
    });
  } catch (error: any) {
    console.error('Get professional statistics error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch professional statistics');
  }
};

// Update professional profile (professional only)
export const updateProfessionalProfile = async (req: AuthRequest, res: Response) => {
  try {
    const professionalId = req.user!.userId;
    const { techStack, yearsOfExperience, bio } = req.body;

    const professional = await Professional.findById(professionalId);

    if (!professional) {
      return ApiResponse.notFound(res, 'Professional not found');
    }

    // Update allowed fields
    if (techStack !== undefined) professional.techStack = techStack;
    if (yearsOfExperience !== undefined) {
      professional.yearsOfExperience = yearsOfExperience;
      professional.experience = yearsOfExperience; // Keep both fields in sync
    }
    if (bio !== undefined) professional.bio = bio;

    await professional.save();

    return ApiResponse.success(res, professional, 'Profile updated successfully');
  } catch (error: any) {
    console.error('Update professional profile error:', error);
    return ApiResponse.error(res, error.message || 'Failed to update profile');
  }
};

// Get available professionals for assignment
export const getAvailableProfessionals = async (req: AuthRequest, res: Response) => {
  try {
    const { round } = req.query;

    const roleMap: any = {
      professional: 'Technical',
      manager: 'Manager',
      hr: 'HR',
    };

    const query: any = {
      status: 'approved',
      activeInterviewCount: { $lt: 10 }, // Maximum 10 active interviews
    };

    if (round && roleMap[round as string]) {
      query.professionalRole = roleMap[round as string];
    }

    const professionals = await Professional.find(query)
      .sort({ activeInterviewCount: 1, rating: -1 })
      .select('name email professionalRole company designation activeInterviewCount rating interviewsTaken');

    return ApiResponse.success(res, professionals);
  } catch (error: any) {
    console.error('Get available professionals error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch available professionals');
  }
};
