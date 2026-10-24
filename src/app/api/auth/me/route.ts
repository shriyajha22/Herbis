import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');

export async function GET(request: Request) {
  try {
    let token = request.headers
      .get('cookie')
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

    const cleanEmail = decoded.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { addresses: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User profile not found in database', user: null },
        { status: 404 }
      );
    }

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

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Token invalid or expired', user: null },
      { status: 401 }
    );
  }
}
