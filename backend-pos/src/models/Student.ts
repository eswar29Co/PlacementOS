import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IStudent } from '../types';

export interface IStudentDocument extends Omit<IStudent, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const studentSchema = new Schema<IStudentDocument>(
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
    role: { type: String, default: 'student', enum: ['student'] },
    avatar: { type: String },
    phone: { type: String },

    // Student specific fields
    college: { type: String, required: true },
    degree: { type: String, required: true },
    branch: { type: String },
    cgpa: { type: Number, required: true, min: 0, max: 10 },
    graduationYear: { type: Number, required: true },
    skills: [{ type: String }],
    resumeUrl: { type: String },
    linkedinUrl: { type: String },
    githubUrl: { type: String },
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
studentSchema.pre('save', async function (next) {
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
studentSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for efficient queries
studentSchema.index({ skills: 1 });
studentSchema.index({ graduationYear: 1 });

export const Student = mongoose.model<IStudentDocument>('Student', studentSchema);
