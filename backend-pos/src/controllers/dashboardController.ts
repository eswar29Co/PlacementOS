import { Student } from '../models/Student';
import { Professional } from '../models/Professional';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { Notification } from '../models/Notification';
import { ApiResponse } from '../utils/ApiResponse';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user!.role;
    const userId = req.user!.userId;

    let stats: any = {};

    switch (role) {
      case 'admin':
        stats = await getAdminStats();
        break;
      case 'student':
        stats = await getStudentStats(userId);
        break;
      case 'professional':
        stats = await getProfessionalStats(userId);
        break;
    }

    return ApiResponse.success(res, stats);
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch dashboard statistics');
  }
};

const getAdminStats = async () => {
  const totalJobs = await Job.countDocuments();
  const activeJobs = await Job.countDocuments({ isActive: true });
  const totalApplications = await Application.countDocuments();
  const totalStudents = await Student.countDocuments();
  const totalProfessionals = await Professional.countDocuments();
  const pendingProfessionals = await Professional.countDocuments({ status: 'pending' });
  const approvedProfessionals = await Professional.countDocuments({ status: 'approved' });

  // Application status breakdown
  const applicationsByStatus = await Application.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Recent applications
  const recentApplications = await Application.find()
    .sort({ appliedAt: -1 })
    .limit(5)
    .populate('jobId', 'companyName roleTitle')
    .populate('studentId', 'name email');

  return {
    overview: {
      totalJobs,
      activeJobs,
      totalApplications,
      totalStudents,
      totalProfessionals,
      pendingProfessionals,
      approvedProfessionals,
    },
    applicationsByStatus,
    recentApplications,
  };
};

const getStudentStats = async (studentId: string) => {
  const totalApplications = await Application.countDocuments({ studentId });
  
  const applicationsByStatus = await Application.aggregate([
    { $match: { studentId: studentId as any } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const activeApplications = await Application.find({
    studentId,
    status: {
      $nin: ['rejected', 'offer_rejected', 'offer_accepted'],
    },
  })
    .sort({ appliedAt: -1 })
    .populate('jobId', 'companyName roleTitle locationType ctcBand');

  const unreadNotifications = await Notification.countDocuments({
    userId: studentId,
    read: false,
  });

  return {
    totalApplications,
    applicationsByStatus,
    activeApplications,
    unreadNotifications,
  };
};

const getProfessionalStats = async (professionalId: string) => {
  const professional = await Professional.findById(professionalId);

  const totalInterviewsAssigned = await Application.countDocuments({
    $or: [
      { assignedProfessionalId: professionalId },
      { assignedManagerId: professionalId },
      { assignedHRId: professionalId },
    ],
  });

  const upcomingInterviews = await Application.find({
    $or: [
      { assignedProfessionalId: professionalId },
      { assignedManagerId: professionalId },
      { assignedHRId: professionalId },
    ],
    status: {
      $in: [
        'professional_interview_scheduled',
        'manager_interview_scheduled',
        'hr_interview_scheduled',
      ],
    },
  })
    .sort({ scheduledDate: 1 })
    .populate('jobId', 'companyName roleTitle')
    .populate('studentId', 'name email college');

  const completedInterviews = await Application.countDocuments({
    $or: [
      { assignedProfessionalId: professionalId, status: 'professional_interview_completed' },
      { assignedManagerId: professionalId, status: 'manager_round_completed' },
      { assignedHRId: professionalId, status: 'hr_round_completed' },
    ],
  });

  const unreadNotifications = await Notification.countDocuments({
    userId: professionalId,
    read: false,
  });

  return {
    profile: {
      status: professional?.status,
      professionalRole: professional?.professionalRole,
      rating: professional?.rating,
      interviewsTaken: professional?.interviewsTaken,
      activeInterviewCount: professional?.activeInterviewCount,
    },
    totalInterviewsAssigned,
    completedInterviews,
    upcomingInterviews,
    unreadNotifications,
  };
};
