import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPasswordResetDocument extends Document {
  token: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

const PasswordResetSchema = new Schema<IPasswordResetDocument>(
  {
    token: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PasswordResetModel: Model<IPasswordResetDocument> =
  mongoose.models.PasswordReset || mongoose.model<IPasswordResetDocument>('PasswordReset', PasswordResetSchema);
