import { Response } from 'express';
import { Assessment } from '../models/Assessment';
import { Application } from '../models/Application';
import { Notification } from '../models/Notification';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';

import { createAssessmentRecord } from '../utils/assessmentHelper';

// Admin: Release assessment for application
export const releaseAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const applicationId = req.body.applicationId || req.params.applicationId;
    const { duration = 60 } = req.body;

    const application = await Application.findById(applicationId)
      .populate('jobId')
      .populate('studentId', 'name email');

    if (!application) {
      return ApiResponse.notFound(res, 'Application not found');
    }

    if (!['resume_shortlisted', 'resume_approved', 'assessment_released'].includes(application.status)) {
      // Allow re-releasing or releasing from these states
      return ApiResponse.badRequest(res, 'Application is not in the correct stage for assessment');
    }

    // Check if assessment already exists
    const existingAssessment = await Assessment.findOne({ applicationId });
    if (existingAssessment) {
      return ApiResponse.badRequest(res, 'Assessment already released for this application');
    }

    // Create assessment using helper
    const assessment = await createAssessmentRecord(applicationId, application.jobId as any, duration);

    // Update application
    application.status = 'assessment_pending';
    application.assessmentDeadline = assessment.deadline;
    application.timeline.push({
      status: 'assessment_pending',
      timestamp: new Date(),
      notes: 'Assessment released',
    });
    await application.save();

    // Notify student
    const job = application.jobId as any;
    await Notification.create({
      userId: application.studentId,
      type: 'assessment_released',
      title: 'Assessment Released',
      message: `Your assessment for ${job.roleTitle} at ${job.companyName} is now available. Complete it before ${assessment.deadline.toLocaleDateString()}`,
      read: false,
      createdAt: new Date(),
      actionUrl: `/student/assessments/${assessment._id}`,
    });

    return ApiResponse.created(res, assessment, 'Assessment released successfully');
  } catch (error: any) {
    console.error('Release assessment error:', error);
    return ApiResponse.error(res, error.message || 'Failed to release assessment');
  }
};

// Student: Get assessment
export const getAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const studentId = req.user!.userId;

    const assessment = await Assessment.findById(id)
      .populate('jobId', 'companyName roleTitle');

    if (!assessment) {
      return ApiResponse.notFound(res, 'Assessment not found');
    }

    // Verify student is authorized
    const application = await Application.findById(assessment.applicationId);
    if (!application || application.studentId.toString() !== studentId) {
      return ApiResponse.forbidden(res, 'Not authorized to view this assessment');
    }

    // Check if expired
    if (assessment.deadline < new Date() && assessment.status === 'pending') {
      return ApiResponse.badRequest(res, 'Assessment deadline has passed');
    }

    return ApiResponse.success(res, assessment);
  } catch (error: any) {
    console.error('Get assessment error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch assessment');
  }
};

// Student: Get assessment by application ID
export const getAssessmentByApplicationId = async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.params;
    const studentId = req.user!.userId;

    const assessment = await Assessment.findOne({ applicationId })
      .populate('jobId', 'companyName roleTitle');

    if (!assessment) {
      return ApiResponse.notFound(res, 'Assessment not found for this application');
    }

    // Verify student is authorized OR user is admin
    if (req.user!.role === 'student') {
      const application = await Application.findById(assessment.applicationId);
      if (!application || application.studentId.toString() !== studentId) {
        return ApiResponse.forbidden(res, 'Not authorized to view this assessment');
      }
    }

    return ApiResponse.success(res, assessment);
  } catch (error: any) {
    console.error('Get assessment by application ID error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch assessment');
  }
};

// Student: Start assessment
export const startAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const studentId = req.user!.userId;

    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return ApiResponse.notFound(res, 'Assessment not found');
    }

    // Verify student
    const application = await Application.findById(assessment.applicationId);
    if (!application || application.studentId.toString() !== studentId) {
      return ApiResponse.forbidden(res, 'Not authorized');
    }

    if (assessment.status !== 'pending') {
      return ApiResponse.badRequest(res, 'Assessment already started or completed');
    }

    if (assessment.deadline < new Date()) {
      return ApiResponse.badRequest(res, 'Assessment deadline has passed');
    }

    // Start assessment
    assessment.status = 'in_progress';
    assessment.startedAt = new Date();
    await assessment.save();

    // Update application
    application.status = 'assessment_in_progress';
    application.timeline.push({
      status: 'assessment_in_progress',
      timestamp: new Date(),
      notes: 'Assessment started',
    });
    await application.save();

    return ApiResponse.success(res, assessment, 'Assessment started');
  } catch (error: any) {
    console.error('Start assessment error:', error);
    return ApiResponse.error(res, error.message || 'Failed to start assessment');
  }
};

// Student: Submit assessment
export const submitAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { mcqAnswers, codingAnswer } = req.body;
    const studentId = req.user!.userId;

    const assessment = await Assessment.findById(id)
      .populate('applicationId');

    if (!assessment) {
      return ApiResponse.notFound(res, 'Assessment not found');
    }

    // Verify student
    const application = await Application.findById(assessment.applicationId)
      .populate('jobId', 'companyName roleTitle');

    if (!application || application.studentId.toString() !== studentId) {
      return ApiResponse.forbidden(res, 'Not authorized');
    }

    if (assessment.status === 'completed') {
      return ApiResponse.badRequest(res, 'Assessment already submitted');
    }

    // Calculate MCQ score
    let correctAnswers = 0;
    assessment.mcqQuestions.forEach((question, index) => {
      if (question.correctOption === mcqAnswers[index]) {
        correctAnswers++;
      }
    });

    const mcqScore = (correctAnswers / assessment.mcqQuestions.length) * 100;

    // Improved Coding Score Algorithm
    // Evaluates length, technical keywords, and structure
    let codingScore = 0;
    if (codingAnswer && codingAnswer.trim().length > 50) {
      const code = codingAnswer.trim();
      const lengthScore = Math.min(code.length / 500 * 40, 40); // Max 40 points for length up to 500 chars

      const technicalKeywords = ['function', 'const', 'let', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', '=>', 'async', 'await', 'try', 'catch'];
      const keywordMatches = technicalKeywords.filter(kw => code.includes(kw)).length;
      const kwScore = Math.min((keywordMatches / technicalKeywords.length) * 40, 40); // Max 40 points for technical structure

      const logicDensity = (code.match(/[\{\}\(\)\[\];=<>!]/g) || []).length;
      const logicScore = Math.min((logicDensity / 20) * 20, 20); // Max 20 points for logical symbols

      codingScore = Math.round(lengthScore + kwScore + logicScore);
    }

    // Overall score (60% MCQ, 40% Coding for more focus on technical depth)
    const finalScore = Math.round(mcqScore * 0.6 + codingScore * 0.4);

    // Update assessment
    assessment.status = 'completed';
    assessment.completedAt = new Date();
    assessment.score = finalScore;
    assessment.answers = {
      mcqAnswers,
      codingAnswer,
    };
    await assessment.save();

    // Update application
    application.status = 'assessment_completed';
    application.assessmentScore = finalScore;
    application.assessmentCode = codingAnswer;
    application.submittedAt = new Date();
    application.timeline.push({
      status: 'assessment_completed',
      timestamp: new Date(),
      notes: `Assessment completed with score: ${finalScore}`,
    });
    await application.save();

    // Notify student
    const job = application.jobId as any;
    await Notification.create({
      userId: studentId,
      type: 'assessment_approved',
      title: 'Assessment Submitted',
      message: `Your assessment for ${job.roleTitle} at ${job.companyName} has been submitted successfully`,
      read: false,
      createdAt: new Date(),
    });

    return ApiResponse.success(res, { score: finalScore }, 'Assessment submitted successfully');
  } catch (error: any) {
    console.error('Submit assessment error:', error);
    return ApiResponse.error(res, error.message || 'Failed to submit assessment');
  }
};

// Admin: Review assessment results
export const reviewAssessmentResults = async (req: AuthRequest, res: Response) => {
  try {
    const { assessmentIds, passingScore = 60 } = req.body;

    const assessments = await Assessment.find({
      _id: { $in: assessmentIds },
      status: 'completed',
    }).populate('applicationId');

    const results = {
      passed: 0,
      failed: 0,
    };

    for (const assessment of assessments) {
      const application = await Application.findById(assessment.applicationId)
        .populate('jobId', 'companyName roleTitle')
        .populate('studentId', 'name email');

      if (!application) continue;

      if (assessment.score! >= passingScore) {
        application.status = 'assessment_approved';
        application.timeline.push({
          status: 'assessment_approved',
          timestamp: new Date(),
          notes: `Assessment passed with score: ${assessment.score}`,
        });
        results.passed++;

        // Notify
        const job = application.jobId as any;
        await Notification.create({
          userId: application.studentId,
          type: 'assessment_approved',
          title: 'Assessment Passed',
          message: `Congratulations! You passed the assessment for ${job.roleTitle} at ${job.companyName}`,
          read: false,
          createdAt: new Date(),
        });
      } else {
        application.status = 'assessment_rejected';
        application.timeline.push({
          status: 'assessment_rejected',
          timestamp: new Date(),
          notes: `Assessment failed. Score: ${assessment.score}`,
        });
        results.failed++;

        // Notify
        const job = application.jobId as any;
        await Notification.create({
          userId: application.studentId,
          type: 'assessment_rejected',
          title: 'Assessment Result',
          message: `Your assessment for ${job.roleTitle} at ${job.companyName} did not meet the passing criteria`,
          read: false,
          createdAt: new Date(),
        });
      }

      await application.save();
    }

    return ApiResponse.success(res, results, 'Assessment review completed');
  } catch (error: any) {
    console.error('Review assessment error:', error);
    return ApiResponse.error(res, error.message || 'Failed to review assessments');
  }
};

// Admin: Review single assessment result
export const reviewSingleAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { passed, notes } = req.body;

    const assessment = await Assessment.findById(id).populate('applicationId');
    if (!assessment) {
      return ApiResponse.notFound(res, 'Assessment not found');
    }

    const application = await Application.findById(assessment.applicationId)
      .populate('jobId', 'companyName roleTitle')
      .populate('studentId', 'name email');

    if (!application) {
      return ApiResponse.notFound(res, 'Application not found');
    }

    const job = application.jobId as any;

    if (passed) {
      application.status = 'assessment_approved';
      application.timeline.push({
        status: 'assessment_approved',
        timestamp: new Date(),
        notes: notes || `Assessment passed with score: ${assessment.score}`,
      });

      await Notification.create({
        userId: application.studentId,
        type: 'assessment_approved',
        title: 'Assessment Passed',
        message: `Congratulations! You passed the assessment for ${job.roleTitle} at ${job.companyName}`,
        read: false,
        createdAt: new Date(),
        actionUrl: `/student/applications/${application._id}`
      });
    } else {
      application.status = 'assessment_rejected';
      application.timeline.push({
        status: 'assessment_rejected',
        timestamp: new Date(),
        notes: notes || `Assessment failed. Score: ${assessment.score}`,
      });

      await Notification.create({
        userId: application.studentId,
        type: 'assessment_rejected',
        title: 'Assessment Result',
        message: `Your assessment for ${job.roleTitle} at ${job.companyName} did not meet the criteria`,
        read: false,
        createdAt: new Date(),
        actionUrl: `/student/applications/${application._id}`
      });
    }

    await application.save();
    return ApiResponse.success(res, application, 'Assessment reviewed successfully');
  } catch (error: any) {
    console.error('Review single assessment error:', error);
    return ApiResponse.error(res, error.message || 'Failed to review assessment');
  }
};

// Get student's assessments
export const getMyAssessments = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;

    // Find all applications for this student
    const applications = await Application.find({ studentId });
    const applicationIds = applications.map(app => app._id);

    const assessments = await Assessment.find({
      applicationId: { $in: applicationIds },
    })
      .sort({ createdAt: -1 })
      .populate('jobId', 'companyName roleTitle')
      .populate('applicationId');

    return ApiResponse.success(res, assessments);
  } catch (error: any) {
    console.error('Get my assessments error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch assessments');
  }
};
