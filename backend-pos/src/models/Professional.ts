import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IProfessional } from '../types';

export interface IProfessionalDocument extends Omit<IProfessional, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const professionalSchema = new Schema<IProfessionalDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, default: 'professional', enum: ['professional'] },
    avatar: { type: String },
    phone: { type: String },

    // Professional specific fields
    professionalRole: {
      type: String,
      enum: ['Technical', 'Manager', 'HR', 'Admin'],
      default: 'Technical'
    },
    company: { type: String, required: true },
    designation: { type: String, required: true },
    yearsOfExperience: { type: Number, required: true, min: 0 },
    experience: { type: Number, required: true, min: 0 },
    techStack: [{ type: String }],
    expertise: [{ type: String }],
    linkedinUrl: { type: String },
    bio: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    interviewsTaken: { type: Number, default: 0 },
    activeInterviewCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_, ret) {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
        delete (ret as any).password;
        return ret;
      }
    }
  }
);

// Hash password before saving
professionalSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
professionalSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for efficient queries
professionalSchema.index({ status: 1 });
professionalSchema.index({ professionalRole: 1 });
professionalSchema.index({ techStack: 1 });

export const Professional = mongoose.model<IProfessionalDocument>('Professional', professionalSchema);
