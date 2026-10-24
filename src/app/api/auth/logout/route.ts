import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');

export async function POST(request: Request) {
  try {
    const token = request.headers
      .get('cookie')
      ?.split(';')
      .find((c) => c.trim().startsWith('pbh_token='))
      ?.split('=')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded && decoded.email) {
          await prisma.activeSession.updateMany({
            where: { email: decoded.email.trim().toLowerCase() },
            data: { isOnline: false },
          });
        }
      } catch (e) {
        // Token invalid or expired
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    response.cookies.set('pbh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    });
    response.cookies.set('pbh_admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred during logout' },
      { status: 500 }
    );
  }
}
