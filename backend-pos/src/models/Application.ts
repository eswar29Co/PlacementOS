import mongoose, { Schema, Document } from 'mongoose';
import { IApplication } from '../types';

export interface IApplicationDocument extends Omit<IApplication, '_id'>, Document {}

const applicationEventSchema = new Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String },
}, { _id: false });

const interviewFeedbackSchema = new Schema({
  round: { 
    type: String, 
    enum: ['ai', 'professional', 'manager', 'hr'],
    required: true 
  },
  interviewRound: { 
    type: String, 
    enum: ['professional', 'manager', 'hr']
  },
  professionalId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Professional',
    required: true 
  },
  professionalName: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  comments: { type: String },
  strengths: { type: String },
  weaknesses: { type: String },
  improvementAreas: [{ type: String }],
  recommendation: { 
    type: String, 
    enum: ['Strongly Recommend', 'Recommend', 'Maybe', 'Reject', 'Pass', 'Fail'],
    required: true 
  },
  conductedAt: { type: Date, default: Date.now },
}, { _id: false });

const applicationSchema = new Schema<IApplicationDocument>(
  {
    jobId: { 
      type: Schema.Types.ObjectId as any, 
      ref: 'Job',
      required: true,
      index: true
    },
    studentId: { 
      type: Schema.Types.ObjectId as any, 
      ref: 'Student',
      required: true,
      index: true
    },
    status: { 
      type: String, 
      required: true,
      default: 'applied',
      index: true
    },
    appliedAt: { type: Date, default: Date.now },
    
    // Resume phase
    resumeUrl: { type: String },
    resumeScore: { type: Number, min: 0, max: 100 },
    
    // Assessment phase
    assessmentDeadline: { type: Date },
    assessmentCode: { type: String },
    assessmentAnswers: [{ type: Schema.Types.Mixed }],
    assessmentScore: { type: Number, min: 0, max: 100 },
    submittedAt: { type: Date },
    
    // AI Interview
    aiInterviewScore: { type: Number, min: 0, max: 100 },
    aiInterviewAnswers: [{ type: String }],
    
    // Professional assignments
    assignedProfessionalId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Professional'
    },
    assignedManagerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Professional'
    },
    assignedHRId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Professional'
    },
    interviewRound: { 
      type: String, 
      enum: ['professional', 'manager', 'hr']
    },
    
    // Meeting details
    meetingLink: { type: String },
    scheduledDate: { type: Date },
    
    // Feedback
    interviewFeedback: [interviewFeedbackSchema],
    
    // Interview scores
    professionalInterviewScore: { type: Number, min: 0, max: 100 },
    managerInterviewScore: { type: Number, min: 0, max: 100 },
    hrInterviewScore: { type: Number, min: 0, max: 100 },
    
    // Offer
    offerDetails: { type: Schema.Types.Mixed },
    
    // Timeline
    timeline: [applicationEventSchema],
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
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });
applicationSchema.index({ status: 1 });
applicationSchema.index({ appliedAt: -1 });
applicationSchema.index({ assignedProfessionalId: 1 });
applicationSchema.index({ assignedManagerId: 1 });
applicationSchema.index({ assignedHRId: 1 });

// Method to add timeline event
applicationSchema.methods.addTimelineEvent = function(status: string, notes?: string) {
  this.timeline.push({
    status,
    timestamp: new Date(),
    notes
  });
};

export const Application = mongoose.model<IApplicationDocument>('Application', applicationSchema);
