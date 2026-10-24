import { NextResponse } from 'next/server';
import { Role, OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    const users = await prisma.user.findMany({
      where: { role: Role.CUSTOMER },
      include: {
        addresses: true,
        orders: {
          select: {
            total: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const customers = users.map((u) => {
      const validOrders = u.orders.filter((o) => o.status !== OrderStatus.CANCELLED);
      const totalSpent = validOrders.reduce((sum, o) => sum + o.total, 0);

      return {
        _id: u.id,
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || u.addresses[0]?.phone || 'N/A',
        role: 'customer',
        walletBalance: u.walletBalance,
        createdAt: new Date(u.createdAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        ordersCount: u.orders.length,
        totalSpent,
      };
    });

    return NextResponse.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error('Fetch customers error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customers list' },
      { status: 500 }
    );
  }
}
