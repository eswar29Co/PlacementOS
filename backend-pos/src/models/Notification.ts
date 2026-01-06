import mongoose, { Schema, Document } from 'mongoose';
import { INotification } from '../types';

export interface INotificationDocument extends Omit<INotification, '_id'>, Document {}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: { 
      type: Schema.Types.ObjectId as any, 
      required: true,
      index: true
    },
    type: { 
      type: String, 
      required: true,
      enum: [
        'professional_approved',
        'professional_rejected',
        'resume_approved',
        'resume_rejected',
        'assessment_released',
        'assessment_approved',
        'assessment_rejected',
        'interview_assigned',
        'interview_scheduled',
        'interview_completed',
        'application_update',
        'offer_released'
      ]
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, index: true },
    actionUrl: { type: String },
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(_, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotificationDocument>('Notification', notificationSchema);
