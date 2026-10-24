import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCustomerToken } from '@/lib/auth';
import { addressSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = verifyCustomerToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse || NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Customer email is required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    if (auth.user?.role !== 'admin' && auth.user?.email.toLowerCase() !== cleanEmail) {
      return NextResponse.json(
        { success: false, message: 'Access denied: You cannot view addresses for another user.' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { addresses: { orderBy: { isDefault: 'desc' } } },
    });

    const addresses = user ? user.addresses : [];

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = verifyCustomerToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse || NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, action, address, addressId } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Customer email is required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    if (auth.user?.role !== 'admin' && auth.user?.email.toLowerCase() !== cleanEmail) {
      return NextResponse.json(
        { success: false, message: 'Access denied: You cannot modify addresses for another user.' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User account not found' },
        { status: 404 }
      );
    }

    if (action === 'delete') {
      if (!addressId) {
        return NextResponse.json(
          { success: false, message: 'addressId is required for deletion' },
          { status: 400 }
        );
      }
      await prisma.address.deleteMany({
        where: { id: addressId, userId: user.id },
      });
    } else if (action === 'setDefault') {
      if (!addressId) {
        return NextResponse.json(
          { success: false, message: 'addressId is required to set default' },
          { status: 400 }
        );
      }
      await prisma.$transaction([
        prisma.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        }),
        prisma.address.update({
          where: { id: addressId },
          data: { isDefault: true },
        }),
      ]);
    } else {
      // Add or update address
      const validation = addressSchema.safeParse(address);
      if (!validation.success) {
        return NextResponse.json(
          { success: false, message: validation.error.errors[0]?.message || 'Invalid address data' },
          { status: 400 }
        );
      }
      const data = validation.data;

      if (data.isDefault) {
        await prisma.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });
      }

      await prisma.address.create({
        data: {
          userId: user.id,
          fullName: data.fullName,
          phone: data.phone,
          addressLine1: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.pincode,
          country: 'India',
          isDefault: Boolean(data.isDefault),
        },
      });
    }

    const updatedAddresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: 'desc' },
    });

    return NextResponse.json({
      success: true,
      message: 'Address saved successfully',
      addresses: updatedAddresses,
    });
  } catch (error) {
    console.error('Error modifying user addresses:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while modifying addresses' },
      { status: 500 }
    );
  }
}
