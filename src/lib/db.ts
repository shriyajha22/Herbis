import mongoose from 'mongoose';
import { initialProducts, initialCategories, initialBlogs, initialReviews, initialCoupons } from './seedData';
import { Product, Category, Blog, Review, Coupon, User, Order } from './types';
import { OrderModel } from '@/models/Order';
import { UserModel } from '@/models/User';
import { ProductModel } from '@/models/Product';

const MONGODB_URI = process.env.MONGODB_URI;

// In-Memory Data Store Fallback for instant local execution
class InMemoryStore {
  products: Product[] = [...initialProducts];
  categories: Category[] = [...initialCategories];
  blogs: Blog[] = [...initialBlogs];
  reviews: Review[] = [...initialReviews];
  coupons: Coupon[] = [...initialCoupons];
  users: User[] = [
    {
      _id: "usr-admin",
      name: "PrimeBrew Admin",
      email: "Contact.primebrew@gmail.com",
      role: "admin",
      addresses: [],
      wishlist: [],
      walletBalance: 500
    }
  ];
  orders: Order[] = [];

  contactQueries: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    createdAt: string;
    status: 'Unread' | 'Replied';
  }[] = [];

  activeSessions = new Map<string, {
    email: string;
    name: string;
    currentPage: string;
    loginTime: string;
    lastActive: string;
    isOnline: boolean;
  }>();

  recordUserActivity(name: string, email: string, currentPage: string) {
    if (!email) return;
    const key = email.trim().toLowerCase();
    const existing = this.activeSessions.get(key);
    const now = new Date().toISOString();

    if (existing) {
      existing.name = name || existing.name;
      existing.currentPage = currentPage || existing.currentPage;
      existing.lastActive = now;
      existing.isOnline = true;
      this.activeSessions.set(key, existing);
    } else {
      this.activeSessions.set(key, {
        email: email.trim(),
        name: name || email.split('@')[0],
        currentPage: currentPage || '/',
        loginTime: now,
        lastActive: now,
        isOnline: true,
      });
    }
  }

  setUserOffline(email: string) {
    if (!email) return;
    const key = email.trim().toLowerCase();
    const existing = this.activeSessions.get(key);
    if (existing) {
      existing.isOnline = false;
      this.activeSessions.set(key, existing);
    }
  }

  getActiveSessions() {
    const nowMs = Date.now();
    const list: Array<{
      email: string;
      name: string;
      currentPage: string;
      loginTime: string;
      lastActive: string;
      isOnline: boolean;
    }> = [];

    this.activeSessions.forEach((session, key) => {
      const lastActiveMs = new Date(session.lastActive).getTime();
      // Mark offline if last heartbeat is older than 30 seconds
      if (nowMs - lastActiveMs > 30000) {
        session.isOnline = false;
      }
      list.push(session);
    });

    return list.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
  }

  passwordResetTokens = new Map<string, { email: string; token: string; expiresAt: Date; used: boolean }>();

  createPasswordResetToken(email: string): string {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    this.passwordResetTokens.set(token, {
      email: email.trim().toLowerCase(),
      token,
      expiresAt,
      used: false,
    });

    return token;
  }

  validatePasswordResetToken(token: string, email: string): { valid: boolean; reason?: string } {
    if (!token || !email) {
      return { valid: false, reason: 'Invalid parameters' };
    }

    const record = this.passwordResetTokens.get(token);
    if (!record) {
      return { valid: false, reason: 'Password reset token not found or invalid' };
    }

    if (record.email.toLowerCase() !== email.trim().toLowerCase()) {
      return { valid: false, reason: 'Token email mismatch' };
    }

    if (record.used) {
      return { valid: false, reason: 'This password reset link has already been used' };
    }

    if (new Date() > record.expiresAt) {
      return { valid: false, reason: 'Password reset link has expired. Please request a new one.' };
    }

    return { valid: true };
  }

  resetUserPassword(token: string, email: string, newPassword: string): { success: boolean; message: string } {
    const validation = this.validatePasswordResetToken(token, email);
    if (!validation.valid) {
      return { success: false, message: validation.reason || 'Invalid reset token' };
    }

    // Find user in store
    const user = this.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return { success: false, message: 'User account not found' };
    }

    // Mark token as used
    const record = this.passwordResetTokens.get(token);
    if (record) {
      record.used = true;
      this.passwordResetTokens.set(token, record);
    }

    return { success: true, message: 'Password updated successfully' };
  }

  findUserByEmail(email: string): User | undefined {
    if (!email) return undefined;
    return this.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  createUser(userData: Partial<User> & { name: string; email: string }): User {
    const newUser: User = {
      _id: `usr-${Date.now()}`,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone || '',
      role: userData.role || 'customer',
      addresses: userData.addresses || [],
      wishlist: userData.wishlist || [],
      walletBalance: userData.walletBalance || 250,
      passwordHash: userData.passwordHash,
    };
    this.users.unshift(newUser);
    return newUser;
  }

  sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  deleteUser(idOrEmail: string): boolean {
    if (!idOrEmail) return false;
    const target = idOrEmail.trim().toLowerCase();
    const initialLen = this.users.length;
    this.users = this.users.filter((u) => u._id !== idOrEmail && u.email.toLowerCase() !== target);
    this.activeSessions.delete(target);
    return this.users.length < initialLen;
  }

  resetToDefaults() {
    this.products = [...initialProducts];
    this.categories = [...initialCategories];
    this.blogs = [...initialBlogs];
    this.reviews = [...initialReviews];
    this.coupons = [...initialCoupons];
    this.activeSessions.clear();
    this.passwordResetTokens.clear();
  }
}

export const inMemoryStore = new InMemoryStore();

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGO_URI || process.env.NEXT_PUBLIC_MONGODB_URI || MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

  if (!uri || uri.includes("username:password")) {
    if (isProduction) {
      throw new Error(
        "Production Database Error [Missing Environment Variable]: MONGODB_URI is missing or unconfigured in Vercel settings."
      );
    }
    console.log("Local Dev Mode: Using In-Memory Database Fallback");
    return;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: 'primebrew',
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log("Connected to MongoDB Atlas successfully (Database: primebrew)");
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    
    // Auto-seed initial catalog and orders if collections are currently empty
    try {
      const orderCount = await OrderModel.countDocuments();
      if (orderCount === 0) {
        await OrderModel.insertMany(inMemoryStore.orders);
      }
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        await UserModel.insertMany(inMemoryStore.users);
      }
      const prodCount = await ProductModel.countDocuments();
      if (prodCount === 0) {
        await ProductModel.insertMany(initialProducts);
      }
    } catch (sErr) {
      // Ignore background seed warnings
    }
  } catch (error: any) {
    cached.promise = null;
    cached.conn = null;

    const rawMessage = String(error?.message || error?.name || 'Unknown Error');
    const sanitizedMessage = rawMessage.replace(/\/\/[^:]+:[^@]+@/g, '//***:***@');

    let category = "Connection Failure";
    const lowerMsg = rawMessage.toLowerCase();
    if (error?.name === 'MongoParseError' || lowerMsg.includes('uri') || lowerMsg.includes('scheme')) {
      category = "Invalid Connection URI Format";
    } else if (error?.name === 'MongoServerSelectionError' || lowerMsg.includes('selection timed out') || lowerMsg.includes('etimedout') || lowerMsg.includes('enotfound')) {
      category = "Network Access Denied / Timeout (Check IP Access List 0.0.0.0/0 in Atlas)";
    } else if (lowerMsg.includes('authentication failed') || error?.code === 18 || lowerMsg.includes('bad auth')) {
      category = "Authentication Failed (Check Username & Password in MONGODB_URI)";
    }

    const safeDiagnostic = {
      name: error?.name || 'Error',
      message: sanitizedMessage,
      code: error?.code || null,
      codeName: error?.codeName || null,
      hasMongoUri: Boolean(process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGO_URI || process.env.NEXT_PUBLIC_MONGODB_URI),
      connectionState: mongoose.connection.readyState,
    };

    console.error(`MongoDB connection failed [Category: ${category}]:`, safeDiagnostic);

    if (isProduction) {
      throw new Error(`Production Database Error [${category}]: ${sanitizedMessage}`);
    }
    console.warn(`MongoDB local connection fallback [${category}]:`, safeDiagnostic);
  }

  return cached.conn;
}
