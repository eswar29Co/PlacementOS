import apiClient, { handleApiError } from './api';
import { Job } from '@/types';

// Job API Service
export const jobService = {
  // Get all jobs
  async getAllJobs(params?: {
    isActive?: boolean;
    skills?: string[];
  }): Promise<{ success: boolean; data: { jobs: Job[]; pagination: any } | Job[] }> {
    try {
      const response = await apiClient.get('/jobs', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get job by ID
  async getJobById(id: string): Promise<{ success: boolean; data: Job }> {
    try {
      const response = await apiClient.get(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get recommended jobs (for students)
  async getRecommendedJobs(): Promise<{ success: boolean; data: Job[] }> {
    try {
      const response = await apiClient.get('/jobs/recommended');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create new job (admin only)
  async createJob(data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data: Job }> {
    try {
      const response = await apiClient.post('/jobs', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update job (admin only)
  async updateJob(id: string, data: Partial<Job>): Promise<{ success: boolean; data: Job }> {
    try {
      const response = await apiClient.put(`/jobs/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete job (admin only)
  async deleteJob(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Toggle job active status (admin only)
  async toggleJobStatus(id: string): Promise<{ success: boolean; data: Job }> {
    try {
      const response = await apiClient.patch(`/jobs/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get job statistics (admin only)
  async getJobStatistics(): Promise<{ success: boolean; data: any }> {
    try {
      const response = await apiClient.get('/jobs/statistics');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
