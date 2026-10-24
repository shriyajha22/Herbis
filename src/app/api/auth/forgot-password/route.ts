import { NextResponse } from 'next/server';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { inMemoryStore, connectToDatabase } from '@/lib/db';
import { UserModel } from '@/models/User';
import { PasswordResetModel } from '@/models/PasswordReset';
import { sendPasswordResetEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    // Verify user exists in database
    let userExists = false;
    if (isDbConnected) {
      const dbUser = await UserModel.findOne({ email: cleanEmail });
      if (dbUser) userExists = true;
    }
    if (!userExists) {
      userExists = inMemoryStore.users.some(
        (u) => u.email.toLowerCase() === cleanEmail
      );
    }

    if (!userExists) {
      return NextResponse.json(
        {
          success: false,
          message: 'No account found with this email address. Please check your email or register a new account.',
        },
        { status: 404 }
      );
    }

    // Generate secure 32-byte token valid for 1 hour
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    if (isDbConnected) {
      await PasswordResetModel.create({
        token,
        email: cleanEmail,
        expiresAt,
        used: false,
      });
    }

    // Store token in inMemoryStore as well
    inMemoryStore.createPasswordResetToken(cleanEmail);
    inMemoryStore.passwordResetTokens.set(token, {
      token,
      email: cleanEmail,
      expiresAt,
      used: false,
    });

    // Send reset email via Resend API
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
      message: `Password reset verification email sent to ${cleanEmail}. Please check your inbox.`,
    });
  } catch (error: any) {
    console.error('Error handling forgot password request:', error?.message);
    return NextResponse.json(
      { success: false, message: 'Server error processing password reset request.' },
      { status: 500 }
    );
  }
}
