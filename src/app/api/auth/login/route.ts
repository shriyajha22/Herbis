import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
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

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { addresses: true },
    });

    if (!user || !user.passwordHash) {
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

    // Record session activity
    await prisma.activeSession.upsert({
      where: { email: cleanEmail },
      update: {
        name: user.name,
        currentPage: '/login',
        lastActive: new Date(),
        isOnline: true,
      },
      create: {
        email: cleanEmail,
        name: user.name,
        currentPage: '/login',
        isOnline: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role.toLowerCase(), name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role.toLowerCase() as 'customer' | 'admin',
      walletBalance: user.walletBalance,
      wishlist: user.wishlist,
      addresses: user.addresses,
    };

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
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred during login' },
      { status: 500 }
    );
  }
}
