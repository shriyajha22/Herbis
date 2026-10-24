import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISessionDocument extends Document {
  email: string;
  name: string;
  currentPage: string;
  lastActive: Date;
  isOnline: boolean;
}

const SessionSchema = new Schema<ISessionDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true },
    currentPage: { type: String, default: '/' },
    lastActive: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SessionModel: Model<ISessionDocument> =
  mongoose.models.Session || mongoose.model<ISessionDocument>('Session', SessionSchema);
