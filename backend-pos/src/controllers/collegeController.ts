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

        // Create college
        const college = await College.create({
            name,
            domain,
            address,
            contactEmail,
            contactPhone,
            logo,
            website
        });

        // Create TPO (Admin) for this college
        if (adminData) {
            const existingAdmin = await Admin.findOne({ email: adminData.email });
            if (existingAdmin) {
                // If admin exists, maybe link them? But usually we create a new one.
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
                title: 'New College Registered',
                message: `${name} has been registered by ${adminData?.name || 'an admin'}.`,
                read: false,
                createdAt: new Date(),
                actionUrl: '/super-admin/colleges'
            });
        }

        return ApiResponse.created(res, college, 'College registered successfully');
    } catch (error: any) {
        console.error('Register College Error:', error);
        return ApiResponse.error(res, error.message || 'Failed to register college');
    }
};

export const getColleges = async (_req: Request, res: Response) => {
    try {
        const colleges = await College.find().select('name domain logo');
        return ApiResponse.success(res, colleges);
    } catch (error: any) {
        console.error('Get Colleges Error:', error);
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
