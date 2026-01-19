import { Response } from 'express';
import { Application } from '../models/Application';
import { Job } from '../models/Job';
import { Professional } from '../models/Professional';
import { Notification } from '../models/Notification';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';
import { ApplicationStatus } from '../types';

// Student: Apply for a job
export const applyForJob = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, resumeUrl } = req.body;
    const studentId = req.user!.userId;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return ApiResponse.notFound(res, 'Job not found');
    }

    // Check if job is active and not expired
    if (!job.isActive || job.deadline < new Date()) {
      return ApiResponse.badRequest(res, 'Job is no longer accepting applications');
    }

    // Check if student already applied
    const existingApplication = await Application.findOne({
      jobId,
      studentId,
    });

    if (existingApplication) {
      return ApiResponse.badRequest(res, 'You have already applied for this job');
    }

    // Create application
    const application = await Application.create({
      jobId,
      studentId,
      status: 'applied',
      appliedAt: new Date(),
      resumeUrl,
      timeline: [{
        status: 'applied',
        timestamp: new Date(),
        notes: 'Application submitted',
      }],
    });

    // Create notification for student
    await Notification.create({
      userId: studentId,
      type: 'application_update',
      title: 'Application Submitted',
      message: `Your application for ${job.roleTitle} at ${job.companyName} has been submitted successfully.`,
      read: false,
      createdAt: new Date(),
    });

    return ApiResponse.created(
      res,
      application,
      'Application submitted successfully'
    );
  } catch (error: any) {
    console.error('Apply for job error:', error);
    return ApiResponse.error(res, error.message || 'Failed to submit application');
  }
};

// Admin: Get all applications with filters
export const getAllApplications = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      status, 
      jobId, 
      studentId,
      page = 1,
      limit = 10 
    } = req.query;

    const query: any = {};

    if (status) query.status = status;
    if (jobId) query.jobId = jobId;
    if (studentId) query.studentId = studentId;

    const skip = (Number(page) - 1) * Number(limit);

    const applications = await Application.find(query)
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('jobId', 'companyName roleTitle')
      .populate('studentId', 'name email college degree cgpa skills')
      .populate('assignedProfessionalId', 'name email professionalRole')
      .populate('assignedManagerId', 'name email professionalRole')
      .populate('assignedHRId', 'name email professionalRole');

    const total = await Application.countDocuments(query);

    return ApiResponse.success(res, {
      applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get applications error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch applications');
  }
};

// Student: Get my applications
export const getMyApplications = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;

    const applications = await Application.find({ studentId })
      .sort({ appliedAt: -1 })
      .populate('jobId', 'companyName roleTitle ctcBand locationType')
      .populate('assignedProfessionalId', 'name email professionalRole')
      .populate('assignedManagerId', 'name email professionalRole')
      .populate('assignedHRId', 'name email professionalRole');

    return ApiResponse.success(res, applications);
  } catch (error: any) {
    console.error('Get my applications error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch applications');
  }
};

// Get single application
export const getApplicationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const application = await Application.findById(id)
      .populate('jobId')
      .populate('studentId')
      .populate('assignedProfessionalId')
      .populate('assignedManagerId')
      .populate('assignedHRId');

    if (!application) {
      return ApiResponse.notFound(res, 'Application not found');
    }

    // Check authorization
    if (
      userRole === 'student' &&
      (application.studentId as any)._id?.toString() !== userId &&
      (application.studentId as any).toString() !== userId
    ) {
      return ApiResponse.forbidden(res, 'Not authorized to view this application');
    }

    if (
      userRole === 'professional' &&
      (application.assignedProfessionalId as any)?._id?.toString() !== userId &&
      (application.assignedProfessionalId as any)?.toString() !== userId &&
      (application.assignedManagerId as any)?._id?.toString() !== userId &&
      (application.assignedManagerId as any)?.toString() !== userId &&
      (application.assignedHRId as any)?._id?.toString() !== userId &&
      (application.assignedHRId as any)?.toString() !== userId
    ) {
      return ApiResponse.forbidden(res, 'Not authorized to view this application');
    }

    return ApiResponse.success(res, application);
  } catch (error: any) {
    console.error('Get application error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch application');
  }
};

// Admin: Update application status
export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, resumeScore, assessmentScore } = req.body;

    const application = await Application.findById(id)
      .populate('jobId', 'companyName roleTitle')
      .populate('studentId', 'name email');

    if (!application) {
      return ApiResponse.notFound(res, 'Application not found');
    }

    // Update status and timeline
    application.status = status as ApplicationStatus;
    
    if (resumeScore !== undefined) {
      application.resumeScore = resumeScore;
    }
    
    if (assessmentScore !== undefined) {
      application.assessmentScore = assessmentScore;
    }

    application.timeline.push({
      status: status as ApplicationStatus,
      timestamp: new Date(),
      notes,
    });

    await application.save();

    // Create notification for student
    const job = application.jobId as any;
    await Notification.create({
      userId: application.studentId,
      type: 'application_update',
      title: 'Application Status Updated',
      message: `Your application for ${job.roleTitle} at ${job.companyName} has been updated to: ${status}`,
      read: false,
      createdAt: new Date(),
      actionUrl: `/student/applications/${application._id}`,
    });

    return ApiResponse.success(
      res,
      application,
      'Application status updated successfully'
    );
  } catch (error: any) {
    console.error('Update application status error:', error);
    return ApiResponse.error(res, error.message || 'Failed to update application status');
  }
};

// Admin: Shortlist resumes based on ATS score
export const shortlistResumes = async (req: AuthRequest, res: Response) => {
  try {
    const { applicationIds, passingScore = 60 } = req.body;

    const applications = await Application.find({
      _id: { $in: applicationIds },
      status: 'resume_under_review',
    })
      .populate('jobId', 'companyName roleTitle')
      .populate('studentId', 'name email');

    const results = {
      shortlisted: 0,
      rejected: 0,
    };

    for (const application of applications) {
      if (application.resumeScore && application.resumeScore >= passingScore) {
        application.status = 'resume_shortlisted';
        application.timeline.push({
          status: 'resume_shortlisted',
          timestamp: new Date(),
          notes: `Resume shortlisted with score: ${application.resumeScore}`,
        });
        results.shortlisted++;

        // Notification
        const job = application.jobId as any;
        await Notification.create({
          userId: application.studentId,
          type: 'resume_approved',
          title: 'Resume Shortlisted',
          message: `Congratulations! Your resume for ${job.roleTitle} at ${job.companyName} has been shortlisted.`,
          read: false,
          createdAt: new Date(),
        });
      } else {
        application.status = 'resume_rejected';
        application.timeline.push({
          status: 'resume_rejected',
          timestamp: new Date(),
          notes: `Resume rejected. Score: ${application.resumeScore}`,
        });
        results.rejected++;

        // Notification
        const job = application.jobId as any;
        await Notification.create({
          userId: application.studentId,
          type: 'resume_rejected',
          title: 'Application Update',
          message: `Your application for ${job.roleTitle} at ${job.companyName} was not shortlisted at this time.`,
          read: false,
          createdAt: new Date(),
        });
      }

      await application.save();
    }

    return ApiResponse.success(res, results, 'Resume shortlisting completed');
  } catch (error: any) {
    console.error('Shortlist resumes error:', error);
    return ApiResponse.error(res, error.message || 'Failed to shortlist resumes');
  }
};

// Professional: Get assigned applications
export const getAssignedApplications = async (req: AuthRequest, res: Response) => {
  try {
    const professionalId = req.user!.userId;

    const applications = await Application.find({
      $or: [
        { assignedProfessionalId: professionalId },
        { assignedManagerId: professionalId },
        { assignedHRId: professionalId },
      ],
    })
      .sort({ scheduledDate: 1 })
      .populate('jobId', 'companyName roleTitle')
      .populate('studentId', 'name email college degree cgpa skills resumeUrl');

    return ApiResponse.success(res, applications);
  } catch (error: any) {
    console.error('Get assigned applications error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch assigned applications');
  }
};

// Admin: Assign professional to application
export const assignProfessional = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { professionalId, round } = req.body;

    const application = await Application.findById(id)
      .populate('jobId', 'companyName roleTitle')
      .populate('studentId', 'name email');
    
    const professional = await Professional.findById(professionalId);

    if (!application) {
      return ApiResponse.notFound(res, 'Application not found');
    }

    if (!professional) {
      return ApiResponse.notFound(res, 'Professional not found');
    }

    if (professional.status !== 'approved') {
      return ApiResponse.badRequest(res, 'Professional is not approved');
    }

    // Assign based on round
    switch (round) {
      case 'professional':
        application.assignedProfessionalId = professionalId;
        application.interviewRound = 'professional';
        application.status = 'professional_interview_pending';
        break;
      case 'manager':
        application.assignedManagerId = professionalId;
        application.interviewRound = 'manager';
        application.status = 'manager_interview_pending';
        break;
      case 'hr':
        application.assignedHRId = professionalId;
        application.interviewRound = 'hr';
        application.status = 'hr_interview_pending';
        break;
      default:
        return ApiResponse.badRequest(res, 'Invalid round');
    }

    application.timeline.push({
      status: application.status,
      timestamp: new Date(),
      notes: `Assigned to ${professional.name} for ${round} round`,
    });

    await application.save();

    // Update professional's active interview count
    professional.activeInterviewCount += 1;
    await professional.save();

    // Notifications
    const job = application.jobId as any;
    
    // Notify professional
    await Notification.create({
      userId: professionalId,
      type: 'interview_assigned',
      title: 'New Interview Assigned',
      message: `You have been assigned a ${round} interview for ${job.roleTitle} at ${job.companyName}`,
      read: false,
      createdAt: new Date(),
      actionUrl: `/professional/interviews/${application._id}`,
    });

    // Notify student
    await Notification.create({
      userId: application.studentId,
      type: 'interview_assigned',
      title: 'Interview Scheduled',
      message: `Your ${round} interview for ${job.roleTitle} at ${job.companyName} has been assigned to an interviewer`,
      read: false,
      createdAt: new Date(),
    });

    return ApiResponse.success(
      res,
      application,
      'Professional assigned successfully'
    );
  } catch (error: any) {
    console.error('Assign professional error:', error);
    return ApiResponse.error(res, error.message || 'Failed to assign professional');
  }
};

// Professional: Schedule interview
export const scheduleInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { meetingLink, scheduledDate } = req.body;
    const professionalId = req.user!.userId;

    const application = await Application.findById(id)
      .populate('jobId', 'companyName roleTitle')
      .populate('studentId', 'name email');

    if (!application) {
      return ApiResponse.notFound(res, 'Application not found');
    }

    // Verify professional is assigned
    const isAssigned =
      application.assignedProfessionalId?.toString() === professionalId ||
      application.assignedManagerId?.toString() === professionalId ||
      application.assignedHRId?.toString() === professionalId;

    if (!isAssigned) {
      return ApiResponse.forbidden(res, 'Not authorized to schedule this interview');
    }

    // Update application
    application.meetingLink = meetingLink;
    application.scheduledDate = new Date(scheduledDate);

    // Update status based on current round
    if (application.interviewRound === 'professional') {
      application.status = 'professional_interview_scheduled';
    } else if (application.interviewRound === 'manager') {
      application.status = 'manager_interview_scheduled';
    } else if (application.interviewRound === 'hr') {
      application.status = 'hr_interview_scheduled';
    }

    application.timeline.push({
      status: application.status,
      timestamp: new Date(),
      notes: `Interview scheduled for ${scheduledDate}`,
    });

    await application.save();

    // Notify student
    const job = application.jobId as any;
    await Notification.create({
      userId: application.studentId,
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      message: `Your ${application.interviewRound} interview for ${job.roleTitle} at ${job.companyName} has been scheduled`,
      read: false,
      createdAt: new Date(),
      actionUrl: `/student/applications/${application._id}`,
    });

    return ApiResponse.success(
      res,
      application,
      'Interview scheduled successfully'
    );
  } catch (error: any) {
    console.error('Schedule interview error:', error);
    return ApiResponse.error(res, error.message || 'Failed to schedule interview');
  }
};

// Professional: Submit interview feedback
export const submitInterviewFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comments, strengths, weaknesses, improvementAreas, recommendation } = req.body;
    const professionalId = req.user!.userId;

    const application = await Application.findById(id)
      .populate('jobId', 'companyName roleTitle')
      .populate('studentId', 'name email');
    
    const professional = await Professional.findById(professionalId);

    if (!application) {
      return ApiResponse.notFound(res, 'Application not found');
    }

    if (!professional) {
      return ApiResponse.notFound(res, 'Professional not found');
    }

    // Verify professional is assigned
    const isAssigned =
      application.assignedProfessionalId?.toString() === professionalId ||
      application.assignedManagerId?.toString() === professionalId ||
      application.assignedHRId?.toString() === professionalId;

    if (!isAssigned) {
      return ApiResponse.forbidden(res, 'Not authorized to submit feedback for this interview');
    }

    // Add feedback
    if (!application.interviewFeedback) {
      application.interviewFeedback = [];
    }

    application.interviewFeedback.push({
      round: application.interviewRound as any,
      interviewRound: application.interviewRound,
      professionalId,
      professionalName: professional.name,
      rating,
      comments,
      strengths,
      weaknesses,
      improvementAreas,
      recommendation,
      conductedAt: new Date(),
    });

    // Update status and score based on round
    const score = (rating / 5) * 100;
    
    if (application.interviewRound === 'professional') {
      application.professionalInterviewScore = score;
      
      if (recommendation === 'Pass' || recommendation === 'Strongly Recommend' || recommendation === 'Recommend') {
        application.status = 'professional_interview_completed';
      } else {
        application.status = 'rejected';
      }
    } else if (application.interviewRound === 'manager') {
      application.managerInterviewScore = score;
      
      if (recommendation === 'Pass' || recommendation === 'Strongly Recommend' || recommendation === 'Recommend') {
        application.status = 'manager_round_completed';
      } else {
        application.status = 'rejected';
      }
    } else if (application.interviewRound === 'hr') {
      application.hrInterviewScore = score;
      
      if (recommendation === 'Pass' || recommendation === 'Strongly Recommend' || recommendation === 'Recommend') {
        application.status = 'hr_round_completed';
      } else {
        application.status = 'rejected';
      }
    }

    application.timeline.push({
      status: application.status,
      timestamp: new Date(),
      notes: `${application.interviewRound} interview completed - ${recommendation}`,
    });

    await application.save();

    // Update professional statistics
    professional.interviewsTaken += 1;
    professional.activeInterviewCount = Math.max(0, professional.activeInterviewCount - 1);
    await professional.save();

    // Notify student
    const job = application.jobId as any;
    await Notification.create({
      userId: application.studentId,
      type: 'interview_completed',
      title: 'Interview Completed',
      message: `Your ${application.interviewRound} interview for ${job.roleTitle} at ${job.companyName} has been completed`,
      read: false,
      createdAt: new Date(),
      actionUrl: `/student/applications/${application._id}`,
    });

    return ApiResponse.success(
      res,
      application,
      'Interview feedback submitted successfully'
    );
  } catch (error: any) {
    console.error('Submit interview feedback error:', error);
    return ApiResponse.error(res, error.message || 'Failed to submit interview feedback');
  }
};

// Student: Submit assessment
export const submitAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId, assessmentCode, assessmentAnswers } = req.body;
    const studentId = req.user!.userId;

    const application = await Application.findOne({
      _id: applicationId,
      studentId,
    })
      .populate('jobId', 'companyName roleTitle');

    if (!application) {
      return ApiResponse.notFound(res, 'Application not found');
    }

    // Check if assessment can be submitted
    if (!['assessment_pending', 'resume_shortlisted', 'assessment_released'].includes(application.status)) {
      return ApiResponse.badRequest(res, 'Assessment cannot be submitted at this stage');
    }

    // Update application with assessment data
    application.assessmentCode = assessmentCode;
    application.assessmentAnswers = assessmentAnswers;
    application.status = 'assessment_completed';
    application.submittedAt = new Date();

    application.timeline.push({
      status: 'assessment_completed',
      timestamp: new Date(),
      notes: 'Assessment submitted by student',
    });

    await application.save();

    // Note: Admin notifications would require proper admin user management
    // For now, admins can see new assessments in the dashboard

    return ApiResponse.success(
      res,
      application,
      'Assessment submitted successfully'
    );
  } catch (error: any) {
    console.error('Submit assessment error:', error);
    return ApiResponse.error(res, error.message || 'Failed to submit assessment');
  }
};

// Admin: Approve Resume
export const approveResume = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;

    const application = await Application.findById(id).populate('jobId studentId');
    if (!application) {
      return ApiResponse.notFound(res, 'Application not found');
    }

    // Update approval status
    application.resumeApproved = true;
    application.resumeApprovedAt = new Date();
    application.resumeApprovedBy = adminId as any;
    application.status = 'assessment_released' as ApplicationStatus;
    application.assessmentDeadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days

    application.timeline.push({
      status: 'assessment_released',
      timestamp: new Date(),
      notes: 'Resume approved by admin, assessment released',
    });

    await application.save();

    // Notify student
    const job = application.jobId as any;
    await Notification.create({
      userId: application.studentId,
      type: 'resume_approved',
      title: 'Resume Approved!',
      message: `Your resume has been shortlisted for ${job.roleTitle} at ${job.companyName}! Assessment is now available.`,
      read: false,
      createdAt: new Date(),
      actionUrl: '/student/applications',
    });

    return ApiResponse.success(res, application, 'Resume approved successfully');
  } catch (error: any) {
    console.error('Approve resume error:', error);
    return ApiResponse.error(res, error.message || 'Failed to approve resume');
  }
};

// Admin: Reject Resume
export const rejectResume = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const adminId = req.user!.userId;

    const application = await Application.findById(id).populate('jobId studentId');
    if (!application) {
      return ApiResponse.notFound(res, 'Application not found');
    }

    // Update approval status
    application.resumeApproved = false;
    application.resumeApprovedAt = new Date();
    application.resumeApprovedBy = adminId as any;
    application.status = 'rejected' as ApplicationStatus;

    application.timeline.push({
      status: 'rejected',
      timestamp: new Date(),
      notes: feedback || 'Resume rejected by admin',
    });

    await application.save();

    // Notify student
    const job = application.jobId as any;
    await Notification.create({
      userId: application.studentId,
      type: 'resume_rejected',
      title: 'Application Update',
      message: `Unfortunately, your application for ${job.roleTitle} at ${job.companyName} was not shortlisted.`,
      read: false,
      createdAt: new Date(),
      actionUrl: '/student/applications',
    });

    return ApiResponse.success(res, application, 'Resume rejected');
  } catch (error: any) {
    console.error('Reject resume error:', error);
    return ApiResponse.error(res, error.message || 'Failed to reject resume');
  }
};

// Admin: Approve Assessment
export const approveAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;

    const application = await Application.findById(id).populate('jobId studentId');
    if (!application) {
      return ApiResponse.notFound(res, 'Application not found');
    }

    // Update approval status
    application.assessmentApproved = true;
    application.assessmentApprovedAt = new Date();
    application.assessmentApprovedBy = adminId as any;
    application.status = 'ai_interview_pending' as ApplicationStatus;

    application.timeline.push({
      status: 'ai_interview_pending',
      timestamp: new Date(),
      notes: 'Assessment approved by admin, AI interview available',
    });

    await application.save();

    // Notify student
    const job = application.jobId as any;
    await Notification.create({
      userId: application.studentId,
      type: 'assessment_approved',
      title: 'Assessment Approved!',
      message: `You passed the assessment for ${job.roleTitle} at ${job.companyName}! AI Mock Interview is now available.`,
      read: false,
      createdAt: new Date(),
      actionUrl: '/student/applications',
    });

    return ApiResponse.success(res, application, 'Assessment approved successfully');
  } catch (error: any) {
    console.error('Approve assessment error:', error);
    return ApiResponse.error(res, error.message || 'Failed to approve assessment');
  }
};

// Admin: Reject Assessment
export const rejectAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const adminId = req.user!.userId;

    const application = await Application.findById(id).populate('jobId studentId');
    if (!application) {
      return ApiResponse.notFound(res, 'Application not found');
    }

    // Update approval status
    application.assessmentApproved = false;
    application.assessmentApprovedAt = new Date();
    application.assessmentApprovedBy = adminId as any;
    application.status = 'rejected' as ApplicationStatus;

    application.timeline.push({
      status: 'rejected',
      timestamp: new Date(),
      notes: feedback || 'Assessment rejected by admin',
    });

    await application.save();

    // Notify student
    const job = application.jobId as any;
    await Notification.create({
      userId: application.studentId,
      type: 'assessment_rejected',
      title: 'Assessment Result',
      message: `Unfortunately, you did not pass the assessment for ${job.roleTitle} at ${job.companyName}.`,
      read: false,
      createdAt: new Date(),
      actionUrl: '/student/applications',
    });

    return ApiResponse.success(res, application, 'Assessment rejected');
  } catch (error: any) {
    console.error('Reject assessment error:', error);
    return ApiResponse.error(res, error.message || 'Failed to reject assessment');
  }
};

// Admin: Approve AI Interview
export const approveAIInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;

    const application = await Application.findById(id).populate('jobId studentId');
    if (!application) {
      return ApiResponse.notFound(res, 'Application not found');
    }

    // Update approval status
    application.aiInterviewApproved = true;
    application.aiInterviewApprovedAt = new Date();
    application.aiInterviewApprovedBy = adminId as any;
    application.status = 'professional_interview_pending' as ApplicationStatus;

    application.timeline.push({
      status: 'professional_interview_pending',
      timestamp: new Date(),
      notes: 'AI interview approved by admin, awaiting professional assignment',
    });

    await application.save();

    // Notify student
    const job = application.jobId as any;
    await Notification.create({
      userId: application.studentId,
      type: 'application_update',
      title: 'AI Interview Passed!',
      message: `You passed the AI interview for ${job.roleTitle} at ${job.companyName}! A professional will be assigned soon.`,
      read: false,
      createdAt: new Date(),
      actionUrl: '/student/applications',
    });

    return ApiResponse.success(res, application, 'AI interview approved successfully');
  } catch (error: any) {
    console.error('Approve AI interview error:', error);
    return ApiResponse.error(res, error.message || 'Failed to approve AI interview');
  }
};

// Admin: Reject AI Interview
export const rejectAIInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const adminId = req.user!.userId;

    const application = await Application.findById(id).populate('jobId studentId');
    if (!application) {
      return ApiResponse.notFound(res, 'Application not found');
    }

    // Update approval status
    application.aiInterviewApproved = false;
    application.aiInterviewApprovedAt = new Date();
    application.aiInterviewApprovedBy = adminId as any;
    application.status = 'rejected' as ApplicationStatus;

    application.timeline.push({
      status: 'rejected',
      timestamp: new Date(),
      notes: feedback || 'AI interview rejected by admin',
    });

    await application.save();

    // Notify student
    const job = application.jobId as any;
    await Notification.create({
      userId: application.studentId,
      type: 'application_update',
      title: 'AI Interview Result',
      message: `Unfortunately, you did not pass the AI interview for ${job.roleTitle} at ${job.companyName}.`,
      read: false,
      createdAt: new Date(),
      actionUrl: '/student/applications',
    });

    return ApiResponse.success(res, application, 'AI interview rejected');
  } catch (error: any) {
    console.error('Reject AI interview error:', error);
    return ApiResponse.error(res, error.message || 'Failed to reject AI interview');
  }
};
