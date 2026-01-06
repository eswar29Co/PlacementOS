import apiClient, { handleApiError } from './api';
import { Professional } from '@/types';

// Professional API Service
export const professionalService = {
  // Get all professionals (admin only)
  async getAllProfessionals(params?: {
    status?: 'pending' | 'approved' | 'rejected';
    role?: 'Technical' | 'Manager' | 'HR';
  }): Promise<{ success: boolean; data: Professional[] }> {
    try {
      const response = await apiClient.get('/professionals', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get pending professionals (admin only)
  async getPendingProfessionals(): Promise<{ success: boolean; data: Professional[] }> {
    try {
      const response = await apiClient.get('/professionals/pending');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get available professionals for interview assignment (admin only)
  async getAvailableProfessionals(params: {
    round: 'professional' | 'manager' | 'hr';
    requiredSkills?: string[];
  }): Promise<{ success: boolean; data: Professional[] }> {
    try {
      const response = await apiClient.get('/professionals/available', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update professional status (admin only)
  async updateProfessionalStatus(
    id: string,
    data: { status: 'approved' | 'rejected'; notes?: string }
  ): Promise<{ success: boolean; data: Professional }> {
    try {
      const response = await apiClient.patch(`/professionals/${id}/status`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
