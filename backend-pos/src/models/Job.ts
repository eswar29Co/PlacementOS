import mongoose, { Schema, Document } from 'mongoose';
import { IJob } from '../types';

export interface IJobDocument extends Omit<IJob, '_id'>, Document {}

const jobSchema = new Schema<IJobDocument>(
  {
    companyName: { type: String, required: true, trim: true },
    roleTitle: { type: String, required: true, trim: true },
    ctcBand: { type: String, required: true },
    locationType: { 
      type: String, 
      required: true,
      enum: ['Onsite', 'Hybrid', 'Remote']
    },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    skills: [{ type: String }],
    requiredTechStack: [{ type: String }],
    deadline: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    selectionProcess: [{ type: String }],
    package: { type: String },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'Admin',
      required: true 
    },
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(_, ret) {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      }
    }
  }
);

// Indexes for efficient queries
jobSchema.index({ isActive: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ requiredTechStack: 1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ createdAt: -1 });

// Virtual for checking if job is expired
jobSchema.virtual('isExpired').get(function() {
  return this.deadline < new Date();
});

export const Job = mongoose.model<IJobDocument>('Job', jobSchema);
