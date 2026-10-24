import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/mailer';
import { passwordResetRequestSchema } from '@/lib/validators';
import { checkForgotPasswordRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const ipLimit = await checkForgotPasswordRateLimit(ip);
  if (!ipLimit.success) {
    return NextResponse.json(
      { success: false, message: ipLimit.message },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const validation = passwordResetRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0]?.message || 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const cleanEmail = email.trim().toLowerCase();

    const emailLimit = await checkForgotPasswordRateLimit(cleanEmail);
    if (!emailLimit.success) {
      return NextResponse.json(
        { success: false, message: emailLimit.message },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'No account found with this email address. Please check your email or register a new account.',
        },
        { status: 404 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: {
        token,
        email: cleanEmail,
        expiresAt,
        used: false,
      },
    });

    const mailResult = await sendPasswordResetEmail(cleanEmail, token);

    if (!mailResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unable to send password reset email. Please try again later or contact support.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent! Please check your inbox and spam folder.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while processing your request' },
      { status: 500 }
    );
  }
}
