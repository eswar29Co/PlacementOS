import { Response } from 'express';
import { Student } from '../models/Student';
import { Professional } from '../models/Professional';
import { Admin } from '../models/Admin';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';

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
        user = await Student.create({ 
          email, 
          password, 
          role,
          ...userData 
        });
        break;
      case 'professional':
        user = await Professional.create({ 
          email, 
          password, 
          role,
          ...userData 
        });
        break;
      case 'admin':
        user = await Admin.create({ 
          email, 
          password, 
          role,
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
