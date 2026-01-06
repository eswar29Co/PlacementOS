import apiClient, { handleApiError } from './api';

// Dashboard API Service
export const dashboardService = {
  // Get dashboard statistics for current user (role-specific)
  async getDashboardStats(): Promise<{ success: boolean; data: any }> {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
