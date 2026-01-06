import { Response } from 'express';
import { Assessment } from '../models/Assessment';
import { Application } from '../models/Application';
import { Notification } from '../models/Notification';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';
import { config } from '../config';

// Sample question bank
const questionBank = {
  mcq: [
    {
      id: 'mcq_1',
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'],
      correctOption: 1,
    },
    {
      id: 'mcq_2',
      question: 'Which data structure uses LIFO principle?',
      options: ['Queue', 'Stack', 'Array', 'Tree'],
      correctOption: 1,
    },
    {
      id: 'mcq_3',
      question: 'What does REST stand for?',
      options: [
        'Representational State Transfer',
        'Remote State Transfer',
        'Resource State Transfer',
        'Representational System Transfer',
      ],
      correctOption: 0,
    },
    {
      id: 'mcq_4',
      question: 'Which HTTP method is used to update a resource?',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      correctOption: 2,
    },
    {
      id: 'mcq_5',
      question: 'What is the purpose of a primary key in a database?',
      options: [
        'To uniquely identify a record',
        'To create an index',
        'To define relationships',
        'To encrypt data',
      ],
      correctOption: 0,
    },
    // Add more MCQ questions here (total 30+ for variety)
    {
      id: 'mcq_6',
      question: 'What is polymorphism in OOP?',
      options: [
        'Ability to take many forms',
        'Data hiding',
        'Code reusability',
        'Multiple inheritance',
      ],
      correctOption: 0,
    },
    {
      id: 'mcq_7',
      question: 'Which sorting algorithm has best average case time complexity?',
      options: ['Bubble Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort'],
      correctOption: 1,
    },
    {
      id: 'mcq_8',
      question: 'What is the default port for HTTPS?',
      options: ['80', '443', '8080', '3000'],
      correctOption: 1,
    },
  ],
  coding: [
    {
      id: 'code_1',
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      examples: [
        { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
        { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      ],
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        'Only one valid answer exists',
      ],
      difficulty: 'Easy' as const,
      testCases: [
        { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
        { input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
        { input: '[3,3]\n6', expectedOutput: '[0,1]' },
      ],
    },
    {
      id: 'code_2',
      title: 'Reverse String',
      description: 'Write a function that reverses a string. The input string is given as an array of characters.',
      examples: [
        { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
        { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
      ],
      constraints: ['1 <= s.length <= 10^5'],
      difficulty: 'Easy' as const,
      testCases: [
        { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' },
        { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]' },
      ],
    },
    {
      id: 'code_3',
      title: 'Valid Palindrome',
      description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
      examples: [
        { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
        { input: 's = "race a car"', output: 'false' },
      ],
      constraints: ['1 <= s.length <= 2 * 10^5'],
      difficulty: 'Easy' as const,
      testCases: [
        { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true' },
        { input: '"race a car"', expectedOutput: 'false' },
      ],
    },
  ],
};

// Admin: Release assessment for application
export const releaseAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId, duration = 60 } = req.body;

    const application = await Application.findById(applicationId)
      .populate('jobId')
      .populate('studentId', 'name email');

    if (!application) {
      return ApiResponse.notFound(res, 'Application not found');
    }

    if (application.status !== 'resume_shortlisted') {
      return ApiResponse.badRequest(res, 'Application is not in the correct stage for assessment');
    }

    // Check if assessment already exists
    const existingAssessment = await Assessment.findOne({ applicationId });
    if (existingAssessment) {
      return ApiResponse.badRequest(res, 'Assessment already released for this application');
    }

    // Select random MCQs
    const shuffledMCQs = [...questionBank.mcq].sort(() => Math.random() - 0.5);
    const selectedMCQs = shuffledMCQs.slice(0, config.assessment.mcqCount);

    // Select random coding question
    const randomCodingQuestion = questionBank.coding[
      Math.floor(Math.random() * questionBank.coding.length)
    ];

    // Create assessment
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3); // 3 days deadline

    const assessment = await Assessment.create({
      applicationId,
      jobId: application.jobId,
      deadline,
      duration,
      mcqQuestions: selectedMCQs,
      codingQuestion: randomCodingQuestion,
      status: 'pending',
    });

    // Update application
    application.status = 'assessment_pending';
    application.assessmentDeadline = deadline;
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
      message: `Your assessment for ${job.roleTitle} at ${job.companyName} is now available. Complete it before ${deadline.toLocaleDateString()}`,
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

    // For coding, we'll use a simple check (in production, use proper test case execution)
    // For now, give 100 if answered, 0 if not
    const codingScore = codingAnswer && codingAnswer.trim().length > 50 ? 100 : 0;

    // Overall score (70% MCQ, 30% Coding)
    const finalScore = Math.round(mcqScore * 0.7 + codingScore * 0.3);

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
    application.status = 'assessment_submitted';
    application.assessmentScore = finalScore;
    application.submittedAt = new Date();
    application.timeline.push({
      status: 'assessment_submitted',
      timestamp: new Date(),
      notes: `Assessment submitted with score: ${finalScore}`,
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
