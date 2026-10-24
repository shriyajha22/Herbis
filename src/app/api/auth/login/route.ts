import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { inMemoryStore, connectToDatabase } from '@/lib/db';
import { UserModel } from '@/models/User';
import { loginSchema } from '@/lib/validators';
import { checkAuthRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await checkAuthRateLimit(ip);
  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, message: rateLimit.message },
      { status: 429 }
    );
  }

  try {
    await connectToDatabase();

    const body = await request.json();
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0]?.message || 'Invalid email or password' },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const cleanEmail = email.trim().toLowerCase();

    let user: any = null;
    try {
      user = await UserModel.findOne({ email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }).lean();
    } catch (dbErr) {
      console.warn('MongoDB lookup warning during login:', dbErr);
    }

    if (!user) {
      user = inMemoryStore.findUserByEmail(cleanEmail);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Password comparison logic
    if (!user.passwordHash) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Record active session
    inMemoryStore.recordUserActivity(user.name, user.email, '/login');

    // Sign JWT session token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = inMemoryStore.sanitizeUser(user);

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
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
    console.error('Error handling customer login:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred during authentication' },
      { status: 500 }
    );
  }
}
