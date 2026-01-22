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

        // 2. Round Analytics (Passed/Failed for each round)
        const roundStats = await Application.aggregate([
            {
                $project: {
                    resumePassed: { $eq: ['$resumeApproved', true] },
                    resumeFailed: { $eq: ['$resumeApproved', false] },
                    assessmentPassed: { $eq: ['$assessmentApproved', true] },
                    assessmentFailed: { $eq: ['$assessmentApproved', false] },
                    aiPassed: { $eq: ['$aiInterviewApproved', true] },
                    aiFailed: { $eq: ['$aiInterviewApproved', false] },
                    status: 1
                }
            },
            {
                $group: {
                    _id: null,
                    resumePass: { $sum: { $cond: ['$resumePassed', 1, 0] } },
                    resumeFail: { $sum: { $cond: ['$resumeFailed', 1, 0] } },
                    assessmentPass: { $sum: { $cond: ['$assessmentPassed', 1, 0] } },
                    assessmentFail: { $sum: { $cond: ['$assessmentFailed', 1, 0] } },
                    aiPass: { $sum: { $cond: ['$aiPassed', 1, 0] } },
                    aiFail: { $sum: { $cond: ['$aiFailed', 1, 0] } }
                }
            }
        ]);

        const stats = roundStats[0] || {};

        // 3. Round Breakdown
        const roundBreakdown = [
            { name: 'Resume Review', passed: stats.resumePass || 0, failed: stats.resumeFail || 0 },
            { name: 'Assessment', passed: stats.assessmentPass || 0, failed: stats.assessmentFail || 0 },
            { name: 'AI Interview', passed: stats.aiPass || 0, failed: stats.aiFail || 0 }
        ];

        // 4. CGPA Stats
        const cgpaStats = await Application.aggregate([
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
            {
                $project: {
                    cgpa: '$student.cgpa',
                    isOffer: { $in: ['$status', ['offer_released', 'offer_accepted', 'hired']] },
                    isRejected: {
                        $regexMatch: {
                            input: '$status',
                            regex: 'rejected|fail|reject',
                            options: 'i'
                        }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $concat: [
                            { $cond: [{ $lt: ['$cgpa', 7] }, ' < 7', ''] },
                            { $cond: [{ $and: [{ $gte: ['$cgpa', 7] }, { $lt: ['$cgpa', 8] }] }, '7 - 8', ''] },
                            { $cond: [{ $and: [{ $gte: ['$cgpa', 8] }, { $lt: ['$cgpa', 9] }] }, '8 - 9', ''] },
                            { $cond: [{ $gte: ['$cgpa', 9] }, '9+', ''] }
                        ]
                    },
                    passed: { $sum: { $cond: ['$isOffer', 1, 0] } },
                    failed: { $sum: { $cond: ['$isRejected', 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 5. Monthly Application Trends (Last 6 months)
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
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            {
                $project: {
                    name: {
                        $concat: [
                            { $toString: '$_id.month' },
                            '/',
                            { $toString: '$_id.year' }
                        ]
                    },
                    value: '$count',
                    _id: 0
                }
            }
        ]);

        // 6. Application Status Distribution
        const applicationStatus = await Application.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } }
        ]);

        return ApiResponse.success(res, {
            overview: {
                totalJobs,
                totalStudents,
                totalProfessionals,
                totalApplications,
                activeApplications: await Application.countDocuments({ status: { $nin: ['hired', 'rejected', 'offer_accepted'] } })
            },
            roundBreakdown,
            cgpaStats: cgpaStats.map(s => ({ range: s._id, passed: s.passed, failed: s.failed })),
            monthlyTrends,
            applicationStatus
        });
    } catch (error: any) {
        console.error('Admin analytics error:', error);
        return ApiResponse.error(res, error.message || 'Failed to fetch admin analytics');
    }
};

/**
 * Get student profile with full application history (Admin Only)
 */
export const getStudentProfileHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id).select('-password -refreshToken');

        if (!student) {
            return ApiResponse.notFound(res, 'Student not found');
        }

        const applications = await Application.find({ studentId: id })
            .populate('jobId', 'companyName roleTitle')
            .sort({ createdAt: -1 });

        return ApiResponse.success(res, {
            student,
            applications
        });
    } catch (error: any) {
        console.error('Get student profile history error:', error);
        return ApiResponse.error(res, error.message || 'Failed to fetch student profile history');
    }
};

/**
 * Get professional profile with interview history (Admin Only)
 */
export const getProfessionalProfileHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const professional = await Professional.findById(id).select('-password -refreshToken');

        if (!professional) {
            return ApiResponse.notFound(res, 'Professional not found');
        }

        const interviews = await Application.find({
            $or: [
                { assignedProfessionalId: id },
                { assignedManagerId: id },
                { assignedHRId: id }
            ]
        })
            .populate('jobId', 'companyName roleTitle')
            .populate('studentId', 'name email college')
            .sort({ createdAt: -1 });

        return ApiResponse.success(res, {
            professional,
            interviews
        });
    } catch (error: any) {
        console.error('Get professional profile history error:', error);
        return ApiResponse.error(res, error.message || 'Failed to fetch professional profile history');
    }
};
