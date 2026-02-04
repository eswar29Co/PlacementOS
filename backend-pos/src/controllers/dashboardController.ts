import { Student } from '../models/Student';
import { Professional } from '../models/Professional';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { Notification } from '../models/Notification';
import { ApiResponse } from '../utils/ApiResponse';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Admin } from '../models/Admin';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;

    let stats: any = {};
    let collegeId;

    if (role === 'admin') {
      const admin = await Admin.findById(userId);
      collegeId = admin?.collegeId;
    }

    switch (role) {
      case 'superadmin':
        stats = await getAdminStats();
        break;
      case 'admin':
        stats = await getAdminStats(collegeId);
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

const getAdminStats = async (collegeId?: any) => {
  let filter: any = {};
  if (collegeId) {
    filter.collegeId = collegeId;
  }

  const totalJobs = await Job.countDocuments(filter);
  const activeJobs = await Job.countDocuments({ ...filter, isActive: true });

  // Application filter
  let appFilter: any = {};
  if (collegeId) {
    const studentsInCollege = await Student.find({ collegeId }).select('_id');
    const studentIds = studentsInCollege.map((s: any) => s._id);
    appFilter.studentId = { $in: studentIds };
  }

  const totalApplications = await Application.countDocuments(appFilter);
  const totalStudents = await Student.countDocuments(collegeId ? { collegeId } : {});
  const totalProfessionals = await Professional.countDocuments(); // Professionals are global
  const pendingProfessionals = await Professional.countDocuments({ status: 'pending' });
  const approvedProfessionals = await Professional.countDocuments({ status: 'approved' });

  // Application status breakdown
  const applicationsByStatus = await Application.aggregate([
    { $match: appFilter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Recent applications
  const recentApplications = await Application.find(appFilter)
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

  // Platform wide stats
  const activeJobs = await Job.countDocuments({ isActive: true });
  const totalStudents = await Student.countDocuments();
  const totalOffers = await Application.countDocuments({ status: { $in: ['offer_released', 'offer_accepted', 'hired'] } });

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

  // Calculate completed rounds for this specific student
  const studentApplications = await Application.find({ studentId });
  const completedRounds = studentApplications.reduce((acc, app) => acc + (app.timeline?.length || 0), 0);

  const unreadNotifications = await Notification.countDocuments({
    userId: studentId,
    read: false,
  });

  return {
    totalApplications,
    platformStats: {
      activeJobs,
      totalStudents,
      totalOffers,
      completedRounds
    },
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
