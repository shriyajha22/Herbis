import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Full name is required').max(100, 'Name must be 100 characters or less'),
  email: z.string().trim().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^[6-9]\d{9}$/.test(val.replace(/[\s-]/g, '').replace(/^\+91/, '')),
      'Phone number must be a valid 10-digit Indian mobile number'
    ),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(100),
  phone: z.string().trim().min(10, 'Valid phone number is required'),
  street: z.string().trim().min(3, 'Street address is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  pincode: z.string().trim().regex(/^\d{6}$/, 'PIN code must be exactly 6 digits'),
  email: z.string().trim().email().optional().or(z.literal('')),
  isDefault: z.boolean().optional(),
});

export const orderItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  name: z.string().optional(),
  productName: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  weight: z.string().optional(),
  image: z.string().optional(),
  productImage: z.string().optional(),
});

export const orderCreateSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one product item'),
  shippingAddress: addressSchema,
  paymentMethod: z.string().optional(),
  subtotal: z.number().nonnegative(),
  discount: z.number().nonnegative().optional(),
  shippingFee: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),
  total: z.number().positive('Order total must be greater than 0'),
  couponCode: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required').max(200),
  slug: z.string().trim().optional(),
  description: z.string().trim().min(5, 'Product description is required'),
  price: z.number().positive('Price must be greater than zero'),
  mrp: z.number().positive('MRP must be greater than zero'),
  discountPercentage: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  category: z.string().trim().min(1, 'Category is required'),
  categoryName: z.string().optional(),
  packagingSizes: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  caffeineLevel: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address format'),
  phone: z.string().trim().optional(),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(5, 'Message must be at least 5 characters long').max(2000, 'Message cannot exceed 2000 characters'),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
});

export const passwordResetSubmitSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  token: z.string().trim().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});
