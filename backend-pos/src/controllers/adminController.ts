import { Response } from 'express';
import { Job } from '../models/Job';
import { Student } from '../models/Student';
import { Professional } from '../models/Professional';
import { Application } from '../models/Application';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';

export const getAdminAnalytics = async (_req: AuthRequest, res: Response) => {
    try {
        // 1. Overall Statistics
        const totalJobs = await Job.countDocuments();
        const totalStudents = await Student.countDocuments();
        const totalProfessionals = await Professional.countDocuments();
        const totalApplications = await Application.countDocuments();

        // 2. Job Categories/Types Distribution
        const jobsByCategory = await Job.aggregate([
            { $group: { _id: '$jobCategory', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } }
        ]);

        // 3. Student Skills Distribution
        const studentSkills = await Student.aggregate([
            { $unwind: '$skills' },
            { $group: { _id: '$skills', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { name: '$_id', value: '$count', _id: 0 } }
        ]);

        // 4. Professional Tech Stack Distribution
        const professionalTechStack = await Professional.aggregate([
            { $unwind: '$techStack' },
            { $group: { _id: '$techStack', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { name: '$_id', value: '$count', _id: 0 } }
        ]);

        // 5. Application Status Distribution
        const applicationStatus = await Application.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } }
        ]);

        // 6. Monthly Application Trends (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyTrends = await Application.aggregate([
            { $match: { appliedAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        month: { $month: '$appliedAt' },
                        year: { $year: '$appliedAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        return ApiResponse.success(res, {
            overview: {
                totalJobs,
                totalStudents,
                totalProfessionals,
                totalApplications
            },
            jobsByCategory,
            studentSkills,
            professionalTechStack,
            applicationStatus,
            monthlyTrends
        });
    } catch (error: any) {
        console.error('Admin analytics error:', error);
        return ApiResponse.error(res, error.message || 'Failed to fetch admin analytics');
    }
};
