import mongoose, { Schema, Document, Model } from 'mongoose';
import { Order as OrderType } from '@/lib/types';

export interface IOrderDocument extends Omit<OrderType, '_id'>, Document {}

const OrderItemSchema = new Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  weight: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const AddressSchema = new Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: Boolean,
});

const OrderSchema = new Schema<IOrderDocument>(
  {
    userId: { type: String, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    createdAt: { type: String, required: true },
    items: [OrderItemSchema],
    shippingAddress: { type: AddressSchema, required: true },
    gstInvoice: {
      gstin: String,
      companyName: String,
    },
    paymentMethod: { type: String, enum: ['Cash on Delivery', 'COD'], default: 'Cash on Delivery', required: true },
    paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed', 'Refunded'], default: 'Pending' },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    trackingNumber: { type: String },
    courierName: { type: String, default: 'Shiprocket Express' },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    estimatedDelivery: { type: String, default: '3-5 Business Days' },
    cancelledAt: { type: String },
    cancelledBy: { type: String },
    previousStatus: { type: String },
  },
  { timestamps: true }
);

export const OrderModel: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);
