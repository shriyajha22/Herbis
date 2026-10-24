import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { inMemoryStore, connectToDatabase } from '@/lib/db';
import { UserModel } from '@/models/User';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'pbh_super_secret_jwt_key_2026_primebrew';

export async function GET(request: Request) {
  await connectToDatabase();

  try {
    // 1. Read token from cookie or Authorization header
    let token = request.headers.get('cookie')
      ?.split(';')
      .find((c) => c.trim().startsWith('pbh_token='))
      ?.split('=')[1];

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthenticated - No session token', user: null },
        { status: 401 }
      );
    }

    // 2. Verify JWT signature & expiration
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
      name: string;
    };

    if (!decoded || !decoded.email) {
      return NextResponse.json(
        { success: false, message: 'Invalid token payload', user: null },
        { status: 401 }
      );
    }

    // 3. Find user in MongoDB Atlas or memory store
    const cleanEmail = decoded.email.trim().toLowerCase();
    let dbUser: any = null;

    try {
      dbUser = await UserModel.findOne({ email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }).lean();
    } catch (err) {}

    if (!dbUser) {
      dbUser = inMemoryStore.findUserByEmail(cleanEmail);
    }

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: 'User profile not found in database', user: null },
        { status: 404 }
      );
    }

    const { passwordHash, ...safeUser } = dbUser;

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Token invalid or expired', user: null },
      { status: 401 }
    );
  }
}
