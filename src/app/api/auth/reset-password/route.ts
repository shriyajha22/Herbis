import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { inMemoryStore, connectToDatabase } from '@/lib/db';
import { PasswordResetModel } from '@/models/PasswordReset';
import { UserModel } from '@/models/User';
import { passwordResetSubmitSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

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
    const isDbConnected = mongoose.connection.readyState === 1;

    // 1. Verify in MongoDB if connected
    if (isDbConnected) {
      const resetRecord = await PasswordResetModel.findOne({ token, email: cleanEmail });
      if (!resetRecord) {
        return NextResponse.json(
          { success: false, message: 'Invalid reset link. Token not found.' },
          { status: 400 }
        );
      }
      if (resetRecord.used) {
        return NextResponse.json(
          { success: false, message: 'This password reset link has already been used.' },
          { status: 400 }
        );
      }
      if (new Date() > new Date(resetRecord.expiresAt)) {
        return NextResponse.json(
          { success: false, message: 'Password reset link has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Token is valid and active',
      });
    }

    // 2. Fallback to inMemoryStore verification
    const validation = inMemoryStore.validatePasswordResetToken(token, cleanEmail);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.reason || 'Invalid or expired reset link' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Token is valid and active',
    });
  } catch (error: any) {
    console.error('Error validating reset token:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while validating reset token' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

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
    const isDbConnected = mongoose.connection.readyState === 1;

    // Hash the new password using bcryptjs
    const passwordHash = await bcrypt.hash(newPassword, 10);

    if (isDbConnected) {
      const resetRecord = await PasswordResetModel.findOne({ token, email: cleanEmail });
      if (!resetRecord || resetRecord.used || new Date() > new Date(resetRecord.expiresAt)) {
        return NextResponse.json(
          { success: false, message: 'Invalid, used, or expired reset token' },
          { status: 400 }
        );
      }

      // Mark token as used
      resetRecord.used = true;
      await resetRecord.save();

      // Update password hash in UserModel
      await UserModel.findOneAndUpdate(
        { email: cleanEmail },
        { passwordHash },
        { new: true }
      );
    }

    // Also update inMemoryStore for fallback consistency
    inMemoryStore.resetUserPassword(token, cleanEmail, newPassword);

    const user = inMemoryStore.findUserByEmail(cleanEmail);
    if (user) {
      user.passwordHash = passwordHash;
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while resetting password' },
      { status: 500 }
    );
  }
}
