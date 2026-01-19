import apiClient, { handleApiError } from './api';
import { Application, ApplicationStatus } from '@/types';

// Application API Service
export const applicationService = {
  // Apply for a job
  async applyForJob(data: {
    jobId: string;
    resumeUrl?: string;
    coverLetter?: string;
  }): Promise<{ success: boolean; data: Application }> {
    try {
      const response = await apiClient.post('/applications/apply', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get all applications (with filters)
  async getAllApplications(params?: {
    studentId?: string;
    jobId?: string;
    status?: ApplicationStatus;
  }): Promise<{ success: boolean; data: Application[] }> {
    try {
      const response = await apiClient.get('/applications', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get student's own applications
  async getMyApplications(): Promise<{ success: boolean; data: Application[] }> {
    try {
      const response = await apiClient.get('/applications/my-applications');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get assigned applications (professional only)
  async getAssignedApplications(): Promise<{ success: boolean; data: Application[] }> {
    try {
      const response = await apiClient.get('/applications/assigned');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get application by ID
  async getApplicationById(id: string): Promise<{ success: boolean; data: Application }> {
    try {
      const response = await apiClient.get(`/applications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update application status (admin/professional)
  async updateApplicationStatus(
    id: string,
    data: { status: ApplicationStatus; notes?: string }
  ): Promise<{ success: boolean; data: Application }> {
    try {
      const response = await apiClient.put(`/applications/${id}/status`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Shortlist resumes (admin only)
  async shortlistResumes(jobId: string): Promise<{ success: boolean; data: { shortlisted: number; rejected: number } }> {
    try {
      const response = await apiClient.post(`/applications/shortlist-resumes/${jobId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Assign professional to application (admin only)
  async assignProfessional(data: {
    applicationId: string;
    professionalId: string;
    round: 'professional' | 'manager' | 'hr';
  }): Promise<{ success: boolean; data: Application }> {
    try {
      const { applicationId, ...payload } = data;
      const response = await apiClient.post(`/applications/${applicationId}/assign-professional`, payload);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Schedule interview (admin/professional)
  async scheduleInterview(data: {
    applicationId: string;
    scheduledDate: Date;
    zoomLink?: string;
  }): Promise<{ success: boolean; data: Application }> {
    try {
      const { applicationId, ...body } = data;
      const response = await apiClient.post(`/applications/${applicationId}/schedule-interview`, body);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Submit interview feedback (professional)
  async submitInterviewFeedback(data: {
    applicationId: string;
    round: 'professional' | 'manager' | 'hr';
    rating: number;
    comments: string;
    strengths?: string;
    weaknesses?: string;
    improvementAreas?: string[];
    recommendation: 'Strongly Recommend' | 'Recommend' | 'Maybe' | 'Reject' | 'Pass' | 'Fail';
  }): Promise<{ success: boolean; data: Application }> {
    try {
      const { applicationId, ...body } = data;
      const response = await apiClient.post(`/applications/${applicationId}/interview-feedback`, body);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Submit assessment (student)
  async submitAssessment(data: {
    applicationId: string;
    assessmentCode?: string;
    assessmentAnswers?: { questionId: string; answer: string }[];
  }): Promise<{ success: boolean; data: Application }> {
    try {
      const response = await apiClient.post('/applications/submit-assessment', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Submit AI interview (student)
  async submitAIInterview(data: {
    applicationId: string;
    aiInterviewAnswers: string[];
  }): Promise<{ success: boolean; data: Application }> {
    try {
      const response = await apiClient.post('/applications/submit-ai-interview', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Approve resume (admin)
  async approveResume(id: string): Promise<{ success: boolean; data: Application }> {
    try {
      const response = await apiClient.post(`/applications/${id}/approve-resume`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Reject resume (admin)
  async rejectResume(id: string, feedback?: string): Promise<{ success: boolean; data: Application }> {
    try {
      const response = await apiClient.post(`/applications/${id}/reject-resume`, { feedback });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Approve assessment (admin)
  async approveAssessment(id: string): Promise<{ success: boolean; data: Application }> {
    try {
      const response = await apiClient.post(`/applications/${id}/approve-assessment`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Reject assessment (admin)
  async rejectAssessment(id: string, feedback?: string): Promise<{ success: boolean; data: Application }> {
    try {
      const response = await apiClient.post(`/applications/${id}/reject-assessment`, { feedback });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Approve AI interview (admin)
  async approveAIInterview(id: string): Promise<{ success: boolean; data: Application }> {
    try {
      const response = await apiClient.post(`/applications/${id}/approve-ai-interview`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Reject AI interview (admin)
  async rejectAIInterview(id: string, feedback?: string): Promise<{ success: boolean; data: Application }> {
    try {
      const response = await apiClient.post(`/applications/${id}/reject-ai-interview`, { feedback });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Accept offer (student)
  async acceptOffer(id: string): Promise<{ success: boolean; data: Application }> {
    try {
      const response = await apiClient.post(`/applications/${id}/accept-offer`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Reject offer (student)
  async rejectOffer(id: string, reason?: string): Promise<{ success: boolean; data: Application }> {
    try {
      const response = await apiClient.post(`/applications/${id}/reject-offer`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
