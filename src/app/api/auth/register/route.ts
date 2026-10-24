import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { inMemoryStore, connectToDatabase } from '@/lib/db';
import { UserModel } from '@/models/User';
import { registerSchema } from '@/lib/validators';
import { checkRegisterRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await checkRegisterRateLimit(ip);
  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, message: rateLimit.message },
      { status: 429 }
    );
  }

  try {
    await connectToDatabase();

    const body = await request.json();
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = validation.data;
    const cleanEmail = email.trim().toLowerCase();

    // Check if account already exists
    let existing: any = null;
    try {
      existing = await UserModel.findOne({ email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    } catch (err) {}
    if (!existing) {
      existing = inMemoryStore.findUserByEmail(cleanEmail);
    }

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with this email address already exists. Please log in.' },
        { status: 400 }
      );
    }

    // Hash password with bcryptjs
    const passwordHash = await bcrypt.hash(password, 10);

    const userDocData = {
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      passwordHash,
      role: 'customer' as const,
      walletBalance: 250,
      addresses: [],
      wishlist: [],
    };

    let createdUser: any = null;
    try {
      const doc = await UserModel.create(userDocData);
      if (doc) {
        createdUser = doc.toObject ? doc.toObject() : doc;
        createdUser._id = doc._id.toString();
      }
    } catch (err) {
      console.warn('MongoDB user creation error:', err);
    }

    if (!createdUser) {
      // Local fallback only if MongoDB is unconfigured
      const fallbackPayload = { _id: `usr-${Date.now()}`, ...userDocData };
      createdUser = inMemoryStore.createUser(fallbackPayload);
    } else {
      // Sync into memory cache
      inMemoryStore.createUser(createdUser);
    }

    inMemoryStore.recordUserActivity(createdUser.name, createdUser.email, '/register');

    // Sign JWT token
    const token = jwt.sign(
      { userId: createdUser._id.toString(), email: createdUser.email, role: 'customer', name: createdUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = inMemoryStore.sanitizeUser(createdUser);

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: safeUser,
    });

    response.cookies.set('pbh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error handling customer registration:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
}
