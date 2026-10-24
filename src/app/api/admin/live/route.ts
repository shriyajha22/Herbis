import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    const activeThreshold = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes
    const activeSessions = await prisma.activeSession.findMany({
      where: {
        isOnline: true,
        lastActive: { gte: activeThreshold },
      },
      orderBy: { lastActive: 'desc' },
    });

    const currentlyOnline = activeSessions.length;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayStart = new Date(todayStr);

    const [
      todaysOrders,
      pendingOrders,
      ordersInDelivery,
      completedOrders,
      allOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.order.count({
        where: { status: OrderStatus.PENDING },
      }),
      prisma.order.count({
        where: {
          status: {
            in: [
              OrderStatus.PROCESSING,
              OrderStatus.PACKED,
              OrderStatus.SHIPPED,
              OrderStatus.OUT_FOR_DELIVERY,
            ],
          },
        },
      }),
      prisma.order.count({
        where: { status: OrderStatus.DELIVERED },
      }),
      prisma.order.findMany({
        where: { status: { not: OrderStatus.CANCELLED } },
        select: { total: true, createdAt: true },
      }),
    ]);

    const todaysRevenue = allOrders
      .filter((o) => o.createdAt >= todayStart)
      .reduce((sum, o) => sum + o.total, 0);

    const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      kpis: {
        currentlyOnline,
        todaysOrders,
        pendingOrders,
        ordersInDelivery,
        completedOrders,
        todaysRevenue,
        totalRevenue,
      },
      activeSessions: activeSessions.map((s) => ({
        email: s.email,
        name: s.name,
        currentPage: s.currentPage,
        loginTime: s.loginTime,
        lastActive: s.lastActive,
        isOnline: s.isOnline,
      })),
    });
  } catch (error) {
    console.error('Live status error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve live metrics' },
      { status: 500 }
    );
  }
}
