import mongoose, { Schema, Document } from 'mongoose';

export interface ICollege extends Document {
  name: string;
  domain: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  logo?: string;
  website?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CollegeSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  domain: { type: String, required: true, unique: true }, // e.g. "mit.edu"
  address: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  logo: { type: String },
  website: { type: String },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'SuperAdmin' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
}, {
  timestamps: true,
  toJSON: {
    transform: function (_doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const College = mongoose.model<ICollege>('College', CollegeSchema);
