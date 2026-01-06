import { Response } from 'express';
import { Notification } from '../models/Notification';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';

// Get user's notifications
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { read, limit = 50 } = req.query;

    const query: any = { userId };
    if (read !== undefined) {
      query.read = read === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    return ApiResponse.success(res, {
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch notifications');
  }
};

// Mark notification as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return ApiResponse.notFound(res, 'Notification not found');
    }

    notification.read = true;
    await notification.save();

    return ApiResponse.success(res, notification, 'Notification marked as read');
  } catch (error: any) {
    console.error('Mark notification as read error:', error);
    return ApiResponse.error(res, error.message || 'Failed to mark notification as read');
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    return ApiResponse.success(res, null, 'All notifications marked as read');
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    return ApiResponse.error(res, error.message || 'Failed to mark all notifications as read');
  }
};

// Delete notification
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return ApiResponse.notFound(res, 'Notification not found');
    }

    return ApiResponse.success(res, null, 'Notification deleted');
  } catch (error: any) {
    console.error('Delete notification error:', error);
    return ApiResponse.error(res, error.message || 'Failed to delete notification');
  }
};

// Get unread count
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const count = await Notification.countDocuments({
      userId,
      read: false,
    });

    return ApiResponse.success(res, { count });
  } catch (error: any) {
    console.error('Get unread count error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch unread count');
  }
};
