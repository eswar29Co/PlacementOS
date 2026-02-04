import apiClient, { handleApiError } from './api';
import { User, Student, Professional, Admin } from '@/types';

// Auth API Service
export const authService = {
  // Register new user
  async register(data: {
    role: 'student' | 'professional' | 'admin' | 'superadmin';
    email: string;
    password: string;
    name: string;
    [key: string]: any;
  }): Promise<{ success: boolean; data: { user: User; token: string }; message: string }> {
    try {
      const response = await apiClient.post('/auth/register', data);

      // Store token in localStorage
      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Login user
  async login(data: {
    email: string;
    password: string;
    role: 'student' | 'professional' | 'admin' | 'superadmin';
  }): Promise<{ success: boolean; data: { user: User; token: string }; message: string }> {
    try {
      const response = await apiClient.post('/auth/login', data);

      // Store token in localStorage
      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get current user profile
  async getProfile(): Promise<{ success: boolean; data: User }> {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<{ success: boolean; data: User }> {
    try {
      const response = await apiClient.put('/auth/profile', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
  },
};
