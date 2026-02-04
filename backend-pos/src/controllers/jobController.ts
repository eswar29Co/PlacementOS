import { Response } from 'express';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { Student } from '../models/Student';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';
import { Admin } from '../models/Admin';
import { Notification } from '../models/Notification';

// Admin: Create a job
export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    let collegeId = req.body.collegeId;

    if (role === 'admin') {
      const admin = await Admin.findById(userId);
      collegeId = admin?.collegeId || collegeId;
    }

    const jobData = {
      ...req.body,
      createdBy: userId,
      collegeId
    };

    const job = await Job.create(jobData);

    // Notify students of the college
    if (collegeId) {
      const students = await Student.find({ collegeId });
      for (const student of students) {
        await Notification.create({
          userId: student._id,
          type: 'new_job_posted',
          title: 'New Opportunity!',
          message: `${job.companyName} is hiring for ${job.roleTitle}. Apply now!`,
          read: false,
          createdAt: new Date(),
          actionUrl: `/student/jobs/${job._id}`
        });
      }
    }

    return ApiResponse.created(res, job, 'Job created successfully');
  } catch (error: any) {
    console.error('Create job error:', error);
    return ApiResponse.error(res, error.message || 'Failed to create job');
  }
};

// Admin: Update a job
export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const job = await Job.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return ApiResponse.notFound(res, 'Job not found');
    }

    return ApiResponse.success(res, job, 'Job updated successfully');
  } catch (error: any) {
    console.error('Update job error:', error);
    return ApiResponse.error(res, error.message || 'Failed to update job');
  }
};

// Admin: Delete a job
export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return ApiResponse.notFound(res, 'Job not found');
    }

    return ApiResponse.success(res, null, 'Job deleted successfully');
  } catch (error: any) {
    console.error('Delete job error:', error);
    return ApiResponse.error(res, error.message || 'Failed to delete job');
  }
};

// Get all jobs (with optional filters)
export const getJobs = async (req: AuthRequest, res: Response) => {
  try {
    const {
      isActive,
      locationType,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const query: any = {};

    if (req.user) {
      const { role, userId } = req.user;
      if (role === 'admin') {
        const admin = await Admin.findById(userId);
        if (admin && admin.collegeId) {
          query.collegeId = admin.collegeId;
        }
      }
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (locationType) {
      query.locationType = locationType;
    }

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { roleTitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name email');

    const total = await Job.countDocuments(query);

    return ApiResponse.success(res, {
      jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get jobs error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch jobs');
  }
};

// Get a single job
export const getJobById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate('createdBy', 'name email');

    if (!job) {
      return ApiResponse.notFound(res, 'Job not found');
    }

    return ApiResponse.success(res, job);
  } catch (error: any) {
    console.error('Get job error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch job');
  }
};

// Student: Get recommended jobs based on skills
export const getRecommendedJobs = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;

    // Get student's skills
    const student = await Student.findById(studentId);
    if (!student) {
      return ApiResponse.notFound(res, 'Student not found');
    }

    const studentSkills = student.skills.map(s => s.toLowerCase());

    // Find jobs matching student's skills
    const recommendedJobs = await Job.find({
      isActive: true,
      deadline: { $gte: new Date() },
      $or: [
        { skills: { $in: studentSkills } },
        { requiredTechStack: { $in: studentSkills } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('createdBy', 'name email');

    // Calculate match score for each job
    const jobsWithScore = recommendedJobs.map(job => {
      const jobSkills = [
        ...job.skills.map(s => s.toLowerCase()),
        ...job.requiredTechStack.map(s => s.toLowerCase()),
      ];

      const matchedSkills = studentSkills.filter(skill =>
        jobSkills.includes(skill)
      );

      const matchScore = (matchedSkills.length / jobSkills.length) * 100;

      return {
        ...job.toJSON(),
        matchScore: Math.round(matchScore),
        matchedSkills,
      };
    });

    // Sort by match score
    jobsWithScore.sort((a, b) => b.matchScore - a.matchScore);

    // Return at least 3 jobs
    const finalJobs = jobsWithScore.length >= 3
      ? jobsWithScore
      : jobsWithScore;

    return ApiResponse.success(res, finalJobs);
  } catch (error: any) {
    console.error('Get recommended jobs error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch recommended jobs');
  }
};

// Get job statistics (for admin dashboard)
export const getJobStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    let filter: any = {};

    if (role === 'admin') {
      const admin = await Admin.findById(userId);
      if (admin && admin.collegeId) {
        filter.collegeId = admin.collegeId;
      }
    }

    const totalJobs = await Job.countDocuments(filter);
    const activeJobs = await Job.countDocuments({ ...filter, isActive: true });
    const expiredJobs = await Job.countDocuments({
      ...filter,
      deadline: { $lt: new Date() }
    });

    let appFilter: any = {};
    if (filter.collegeId) {
      const collegeJobs = await Job.find({ collegeId: filter.collegeId }).select('_id');
      const jobIds = collegeJobs.map((j: any) => j._id);
      appFilter.jobId = { $in: jobIds };
    }

    const totalApplications = await Application.countDocuments(appFilter);

    // Get applications per job
    const jobsWithApplications = await Application.aggregate([
      { $match: appFilter },
      {
        $group: {
          _id: '$jobId',
          applicationCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job',
        },
      },
      {
        $unwind: '$job',
      },
      {
        $project: {
          jobTitle: '$job.roleTitle',
          companyName: '$job.companyName',
          applicationCount: 1,
        },
      },
      {
        $sort: { applicationCount: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    return ApiResponse.success(res, {
      totalJobs,
      activeJobs,
      expiredJobs,
      totalApplications,
      topJobs: jobsWithApplications,
    });
  } catch (error: any) {
    console.error('Get job statistics error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch job statistics');
  }
};
