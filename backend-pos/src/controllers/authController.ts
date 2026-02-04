import { Response } from 'express';
import { Student } from '../models/Student';
import { Professional } from '../models/Professional';
import { Admin } from '../models/Admin';
import { SuperAdmin } from '../models/SuperAdmin';
import { College } from '../models/College';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from '../utils/notifHelper';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { role, email, password, ...userData } = req.body;

    // Check if user already exists
    let existingUser;
    switch (role) {
      case 'student':
        existingUser = await Student.findOne({ email });
        break;
      case 'professional':
        existingUser = await Professional.findOne({ email });
        break;
      case 'admin':
        existingUser = await Admin.findOne({ email });
        break;
      case 'superadmin':
        existingUser = await SuperAdmin.findOne({ email });
        break;
      default:
        return ApiResponse.badRequest(res, 'Invalid role');
    }

    if (existingUser) {
      return ApiResponse.badRequest(res, 'User already exists with this email');
    }

    // Create user based on role
    let user;
    switch (role) {
      case 'student':
        // Extract domain from email
        const emailDomain = email.split('@')[1];
        const college = await College.findOne({ domain: emailDomain });

        if (!college) {
          return ApiResponse.badRequest(res, `Your college domain (@${emailDomain}) is not registered. Please ask your TPO to enroll.`);
        }

        user = await Student.create({
          email,
          password,
          role,
          college: college.name,
          collegeId: college._id,
          ...userData
        });

        // Notify College Admin (TPO)
        const collegeAdmins = await Admin.find({ collegeId: college._id });
        for (const admin of collegeAdmins) {
          await createNotification(
            admin._id.toString(),
            'student_registered',
            'New Student Registered',
            `${user.name} has registered from your college.`,
            `/admin/students`
          );
        }
        break;
      case 'professional':
        user = await Professional.create({
          email,
          password,
          role,
          ...userData
        });

        // Notify SuperAdmins
        const superAdmins = await SuperAdmin.find();
        for (const sa of superAdmins) {
          await createNotification(
            sa._id.toString(),
            'professional_signup',
            'New Professional Signup',
            `${user.name} from ${user.company} has signed up and is pending approval.`,
            `/super-admin/dashboard`
          );
        }
        break;
      case 'admin':
        // Extract domain from email
        const adminEmailDomain = email.split('@')[1];
        const adminCollege = await College.findOne({ domain: adminEmailDomain });

        if (!adminCollege) {
          return ApiResponse.badRequest(res, `Your college domain (@${adminEmailDomain}) is not registered. Please contact Super Admin to enroll your college first.`);
        }

        user = await Admin.create({
          email,
          password,
          role,
          isSuperAdmin: false,
          collegeId: adminCollege._id,
          ...userData
        });
        break;
      case 'superadmin':
        user = await SuperAdmin.create({
          email,
          password,
          role: 'superadmin',
          ...userData
        });
        break;
    }

    // Generate tokens
    const token = generateToken({
      userId: user!._id.toString(),
      email: user!.email,
      role: user!.role as any,
    });

    const refreshToken = generateRefreshToken({
      userId: user!._id.toString(),
      email: user!.email,
      role: user!.role as any,
    });

    // Remove password from response
    const userResponse = user!.toJSON();

    return ApiResponse.created(res, {
      user: userResponse,
      token,
      refreshToken,
    }, 'Registration successful');
  } catch (error: any) {
    console.error('Registration error:', error);
    return ApiResponse.error(res, error.message || 'Registration failed');
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return ApiResponse.badRequest(res, 'Please provide email, password, and role');
    }

    // Find user based on role
    let user;
    switch (role) {
      case 'student':
        user = await Student.findOne({ email });
        break;
      case 'professional':
        user = await Professional.findOne({ email });
        break;
      case 'admin':
        user = await Admin.findOne({ email });
        break;
      case 'superadmin':
        user = await SuperAdmin.findOne({ email });
        break;
      default:
        return ApiResponse.badRequest(res, 'Invalid role');
    }

    if (!user) {
      return ApiResponse.unauthorized(res, 'Invalid credentials');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return ApiResponse.unauthorized(res, 'Invalid credentials');
    }

    // Check if professional is approved
    if (role === 'professional' && (user as any).status !== 'approved') {
      return ApiResponse.forbidden(res, 'Your account is pending approval');
    }

    // Generate tokens
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role as any,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role as any,
    });

    // Remove password from response
    const userResponse = user.toJSON();

    return ApiResponse.success(res, {
      user: userResponse,
      token,
      refreshToken,
    }, 'Login successful');
  } catch (error: any) {
    console.error('Login error:', error);
    return ApiResponse.error(res, error.message || 'Login failed');
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    let user;
    switch (role) {
      case 'student':
        user = await Student.findById(userId);
        break;
      case 'professional':
        user = await Professional.findById(userId);
        break;
      case 'admin':
        user = await Admin.findById(userId);
        break;
      case 'superadmin':
        user = await SuperAdmin.findById(userId);
        break;
    }

    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }

    return ApiResponse.success(res, user);
  } catch (error: any) {
    console.error('Get profile error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch profile');
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const updates = req.body;

    // Prevent updating sensitive fields
    delete updates.password;
    delete updates.email;
    delete updates.role;
    delete updates._id;

    let user;
    switch (role) {
      case 'student':
        user = await Student.findByIdAndUpdate(
          userId,
          updates,
          { new: true, runValidators: true }
        );
        break;
      case 'professional':
        user = await Professional.findByIdAndUpdate(
          userId,
          updates,
          { new: true, runValidators: true }
        );
        break;
      case 'admin':
        user = await Admin.findByIdAndUpdate(
          userId,
          updates,
          { new: true, runValidators: true }
        );
        break;
      case 'superadmin':
        user = await SuperAdmin.findByIdAndUpdate(
          userId,
          updates,
          { new: true, runValidators: true }
        );
        break;
    }

    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }

    return ApiResponse.success(res, user, 'Profile updated successfully');
  } catch (error: any) {
    console.error('Update profile error:', error);
    return ApiResponse.error(res, error.message || 'Failed to update profile');
  }
};

