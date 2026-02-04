import { Notification } from '../models/Notification';
import { NotificationType } from '../types';

export const createNotification = async (
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string
) => {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            actionUrl,
            read: false
        });
        return notification;
    } catch (error) {
        console.error('Create Notification Error:', error);
        return null;
    }
};
