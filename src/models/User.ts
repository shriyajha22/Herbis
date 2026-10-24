import mongoose, { Schema, Document, Model } from 'mongoose';
import { User as UserType } from '@/lib/types';

export interface IUserDocument extends Omit<UserType, '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    avatar: { type: String },
    addresses: [
      {
        fullName: String,
        phone: String,
        email: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
        isDefault: Boolean,
      },
    ],
    wishlist: [{ type: String }],
    walletBalance: { type: Number, default: 250 },
    passwordHash: { type: String },
  },
  { timestamps: true }
);

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
