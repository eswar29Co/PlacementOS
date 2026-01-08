import apiClient from './api';
import { Student } from '@/types';

export const studentService = {
  /**
   * Get all students (Admin only)
   */
  getAllStudents: async () => {
    const response = await apiClient.get<{ success: boolean; data: Student[] }>('/students');
    return response.data;
  },

  /**
   * Get student by ID
   */
  getStudentById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: Student }>(`/students/${id}`);
    return response.data;
  },

  /**
   * Update student profile
   */
  updateStudent: async (id: string, updates: Partial<Student>) => {
    const response = await apiClient.put<{ success: boolean; data: Student }>(`/students/${id}`, updates);
    return response.data;
  },

  /**
   * Delete student (Admin only)
   */
  deleteStudent: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean }>(`/students/${id}`);
    return response.data;
  },

  /**
   * Get student statistics
   */
  getStudentStatistics: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/students/statistics');
    return response.data;
  },
};
