import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

export interface IAdminDocument extends Omit<IUser, '_id'>, Document {
  collegeId?: mongoose.Types.ObjectId;
  isSuperAdmin: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const adminSchema = new Schema<IAdminDocument>(
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
    role: { type: String, default: 'admin', enum: ['admin', 'superadmin'] },
    isSuperAdmin: { type: Boolean, default: false },
    collegeId: { type: Schema.Types.ObjectId, ref: 'College' },
    avatar: { type: String },
    phone: { type: String },
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
adminSchema.pre('save', async function (next) {
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
adminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index
// adminSchema.index({ email: 1 }); // Email is already indexed via unique: true

export const Admin = mongoose.model<IAdminDocument>('Admin', adminSchema);
