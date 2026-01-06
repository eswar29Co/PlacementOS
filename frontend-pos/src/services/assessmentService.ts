import apiClient, { handleApiError } from './api';
import { Assessment } from '@/types';

// Assessment API Service
export const assessmentService = {
  // Get assessment by application ID
  async getAssessmentByApplicationId(applicationId: string): Promise<{ success: boolean; data: Assessment }> {
    try {
      const response = await apiClient.get(`/assessments/application/${applicationId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Start assessment (student)
  async startAssessment(assessmentId: string): Promise<{ success: boolean; data: Assessment }> {
    try {
      const response = await apiClient.post(`/assessments/${assessmentId}/start`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Submit assessment (student)
  async submitAssessment(
    assessmentId: string,
    data: {
      mcqAnswers: number[];
      codingAnswer: string;
    }
  ): Promise<{ success: boolean; data: Assessment }> {
    try {
      const response = await apiClient.post(`/assessments/${assessmentId}/submit`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Release assessment for application (admin)
  async releaseAssessment(applicationId: string): Promise<{ success: boolean; data: Assessment }> {
    try {
      const response = await apiClient.post(`/assessments/release/${applicationId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Review assessment results (admin)
  async reviewAssessment(
    assessmentId: string,
    data: { passed: boolean; notes?: string }
  ): Promise<{ success: boolean; data: Assessment }> {
    try {
      const response = await apiClient.post(`/assessments/${assessmentId}/review`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
