import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCustomerToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const auth = verifyCustomerToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse || NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, wishlist } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Customer email is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(wishlist)) {
      return NextResponse.json(
        { success: false, message: 'Wishlist must be an array of product IDs' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    if (auth.user?.role !== 'admin' && auth.user?.email.toLowerCase() !== cleanEmail) {
      return NextResponse.json(
        { success: false, message: 'Access denied: You cannot modify wishlist for another user.' },
        { status: 403 }
      );
    }

    const cleanWishlist = Array.from(
      new Set(wishlist.filter((id) => typeof id === 'string' && id.trim().length > 0))
    );

    await prisma.user.update({
      where: { email: cleanEmail },
      data: { wishlist: cleanWishlist },
    });

    return NextResponse.json({
      success: true,
      message: 'Wishlist updated successfully.',
      wishlist: cleanWishlist,
    });
  } catch (error) {
    console.error('Error updating customer wishlist:', error);
    return NextResponse.json(
      { success: false, message: 'Server error updating wishlist' },
      { status: 500 }
    );
  }
}
