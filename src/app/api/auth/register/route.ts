import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { inMemoryStore, connectToDatabase } from '@/lib/db';
import { UserModel } from '@/models/User';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'pbh_super_secret_jwt_key_2026_primebrew';

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

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
      token,
    });

    response.cookies.set('pbh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error handling customer registration:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error processing registration' },
      { status: 500 }
    );
  }
}
