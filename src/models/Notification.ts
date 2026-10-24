import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminNotification extends Document {
  type: 'new_order' | 'order_cancelled';
  orderId: string;
  orderNumber: string;
  customerName: string;
  total: number;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<IAdminNotification>(
  {
    type: { type: String, enum: ['new_order', 'order_cancelled'], required: true },
    orderId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    total: { type: Number, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const NotificationModel: Model<IAdminNotification> =
  mongoose.models.AdminNotification || mongoose.model<IAdminNotification>('AdminNotification', NotificationSchema);
