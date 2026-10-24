import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validators';
import { checkAuthRateLimit, getClientIp } from '@/lib/rateLimit';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'Contact.primebrew@gmail.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
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

    // Verify admin credentials
    const adminUser = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
        role: Role.ADMIN,
      },
    });

    if (!adminUser || !adminUser.passwordHash) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    let isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash);

    // If environment variable ADMIN_PASSWORD has changed, check and update hash
    if (!isPasswordValid && ADMIN_PASSWORD && password === ADMIN_PASSWORD) {
      const newHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { passwordHash: newHash },
      });
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    // Record session activity
    await prisma.activeSession.upsert({
      where: { email: cleanEmail },
      update: {
        name: adminUser.name,
        currentPage: '/admin/dashboard',
        lastActive: new Date(),
        isOnline: true,
      },
      create: {
        email: cleanEmail,
        name: adminUser.name,
        currentPage: '/admin/dashboard',
        isOnline: true,
      },
    });

    // Create admin token (24h)
    const token = jwt.sign(
      {
        userId: adminUser.id,
        email: adminUser.email,
        role: 'admin',
        name: adminUser.name,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logAdminAction(cleanEmail, 'LOGIN', 'ADMIN_SESSION', adminUser.id);

    const safeUser = {
      _id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: 'admin' as const,
      walletBalance: adminUser.walletBalance,
      wishlist: adminUser.wishlist,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Admin authentication successful',
      user: safeUser,
    });

    response.cookies.set('pbh_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred during admin authentication' },
      { status: 500 }
    );
  }
}
