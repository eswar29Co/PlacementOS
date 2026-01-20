import apiClient, { handleApiError } from './api';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    filename: string;
    originalName: string;
    size: number;
  };
}

export const uploadService = {
  uploadFile: async (file: File): Promise<UploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<UploadResponse>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },
};
