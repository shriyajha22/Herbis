import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
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

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with this email address already exists. Please log in.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : null,
        passwordHash,
        role: Role.CUSTOMER,
        walletBalance: 250,
      },
      include: {
        addresses: true,
      },
    });

    // Record session activity
    await prisma.activeSession.upsert({
      where: { email: cleanEmail },
      update: {
        name: user.name,
        currentPage: '/register',
        lastActive: new Date(),
        isOnline: true,
      },
      create: {
        email: cleanEmail,
        name: user.name,
        currentPage: '/register',
        isOnline: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'customer', name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: 'customer' as const,
      walletBalance: user.walletBalance,
      wishlist: user.wishlist,
      addresses: user.addresses,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully! Welcome bonus ₹250 added to your wallet.',
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
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
