import apiClient, { handleApiError } from './api';
import { Notification } from '@/types';

// Notification API Service
export const notificationService = {
  // Get all notifications for current user
  async getNotifications(): Promise<{ success: boolean; data: { notifications: Notification[]; unreadCount: number } }> {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<{ success: boolean; data: Notification }> {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.patch('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete notification
  async deleteNotification(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get unread count
  async getUnreadCount(): Promise<{ success: boolean; data: { count: number } }> {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
