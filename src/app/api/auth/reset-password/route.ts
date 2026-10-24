import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { passwordResetSubmitSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json(
        { success: false, message: 'Missing token or email parameter' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const record = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!record || record.email.toLowerCase() !== cleanEmail) {
      return NextResponse.json(
        { success: false, message: 'Invalid reset link. Token not found or mismatch.' },
        { status: 400 }
      );
    }

    if (record.used) {
      return NextResponse.json(
        { success: false, message: 'This password reset link has already been used.' },
        { status: 400 }
      );
    }

    if (new Date() > record.expiresAt) {
      return NextResponse.json(
        { success: false, message: 'Password reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Token is valid and active',
    });
  } catch (error) {
    console.error('Error validating reset token:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while validating reset token' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = passwordResetSubmitSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }

    const { token, email, newPassword } = validation.data;
    const cleanEmail = email.trim().toLowerCase();

    const record = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!record || record.email.toLowerCase() !== cleanEmail) {
      return NextResponse.json(
        { success: false, message: 'Invalid reset link. Token not found or mismatch.' },
        { status: 400 }
      );
    }

    if (record.used) {
      return NextResponse.json(
        { success: false, message: 'This password reset link has already been used.' },
        { status: 400 }
      );
    }

    if (new Date() > record.expiresAt) {
      return NextResponse.json(
        { success: false, message: 'Password reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: cleanEmail },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Error executing password reset:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while resetting your password' },
      { status: 500 }
    );
  }
}
