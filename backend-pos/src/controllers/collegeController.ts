import { Request, Response } from 'express';
import { College } from '../models/College';
import { Admin } from '../models/Admin';
import { SuperAdmin } from '../models/SuperAdmin';
import { Notification } from '../models/Notification';
import { ApiResponse } from '../utils/ApiResponse';

export const registerCollege = async (req: Request, res: Response) => {
    try {
        const { name, domain, address, contactEmail, contactPhone, logo, website, adminData } = req.body;

        // Check if college exists
        const existingCollege = await College.findOne({ $or: [{ name }, { domain }] });
        if (existingCollege) {
            return ApiResponse.badRequest(res, 'College with this name or domain already exists');
        }

        // Create college with pending status
        const college = await College.create({
            name,
            domain,
            address,
            contactEmail,
            contactPhone,
            logo,
            website,
            approvalStatus: 'pending' // Default to pending
        });

        // Create TPO (Admin) for this college - but they can't login until approved
        if (adminData) {
            const existingAdmin = await Admin.findOne({ email: adminData.email });
            if (existingAdmin) {
                return ApiResponse.badRequest(res, 'Admin email already exists');
            }

            await Admin.create({
                ...adminData,
                collegeId: college._id,
                role: 'admin',
                isSuperAdmin: false
            });
        }

        // Notify SuperAdmins
        const superAdmins = await SuperAdmin.find();
        for (const sa of superAdmins) {
            await Notification.create({
                userId: sa._id,
                type: 'admin_note',
                title: 'New College Registration Pending',
                message: `${name} has registered and is awaiting approval. Domain: ${domain}`,
                read: false,
                createdAt: new Date(),
                actionUrl: '/super-admin/dashboard'
            });
        }

        return ApiResponse.created(res, college, 'College registration submitted. Pending SuperAdmin approval.');
    } catch (error: any) {
        console.error('Register College Error:', error);
        return ApiResponse.error(res, error.message || 'Failed to register college');
    }
};

export const getColleges = async (_req: Request, res: Response) => {
    try {
        // Only return approved colleges for public listing
        const colleges = await College.find({ approvalStatus: 'approved' }).select('name domain logo');
        return ApiResponse.success(res, colleges);
    } catch (error: any) {
        console.error('Get Colleges Error:', error);
        return ApiResponse.error(res, error.message || 'Failed to fetch colleges');
    }
};

export const getAllColleges = async (_req: Request, res: Response) => {
    try {
        // For SuperAdmin - return all colleges regardless of status
        const colleges = await College.find().select('name domain logo approvalStatus createdAt');
        return ApiResponse.success(res, colleges);
    } catch (error: any) {
        console.error('Get All Colleges Error:', error);
        return ApiResponse.error(res, error.message || 'Failed to fetch colleges');
    }
};

export const getCollegeDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const college = await College.findById(id);
        if (!college) {
            return ApiResponse.notFound(res, 'College not found');
        }
        return ApiResponse.success(res, college);
    } catch (error: any) {
        return ApiResponse.error(res, error.message || 'Error fetching college');
    }
};

export const approveCollege = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const superAdminId = (req as any).user?.id;

        const college = await College.findById(id);
        if (!college) {
            return ApiResponse.notFound(res, 'College not found');
        }

        if (college.approvalStatus === 'approved') {
            return ApiResponse.badRequest(res, 'College is already approved');
        }

        college.approvalStatus = 'approved';
        college.approvedBy = superAdminId;
        college.approvedAt = new Date();
        await college.save();

        // Notify the college admin
        const admin = await Admin.findOne({ collegeId: college._id });
        if (admin) {
            await Notification.create({
                userId: admin._id,
                type: 'admin_note',
                title: 'College Approved!',
                message: `Congratulations! ${college.name} has been approved. You can now login and start managing placements.`,
                read: false,
                createdAt: new Date(),
                actionUrl: '/admin/dashboard'
            });
        }

        return ApiResponse.success(res, college, 'College approved successfully');
    } catch (error: any) {
        console.error('Approve College Error:', error);
        return ApiResponse.error(res, error.message || 'Failed to approve college');
    }
};

export const rejectCollege = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const college = await College.findById(id);
        if (!college) {
            return ApiResponse.notFound(res, 'College not found');
        }

        college.approvalStatus = 'rejected';
        college.rejectionReason = reason || 'Not specified';
        await college.save();

        // Notify the college admin
        const admin = await Admin.findOne({ collegeId: college._id });
        if (admin) {
            await Notification.create({
                userId: admin._id,
                type: 'admin_note',
                title: 'College Registration Rejected',
                message: `Unfortunately, ${college.name} registration has been rejected. Reason: ${reason || 'Not specified'}`,
                read: false,
                createdAt: new Date()
            });
        }

        return ApiResponse.success(res, college, 'College rejected');
    } catch (error: any) {
        console.error('Reject College Error:', error);
        return ApiResponse.error(res, error.message || 'Failed to reject college');
    }
};
