import { NextResponse } from 'next/server';
import { OrderStatus, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (o.status !== OrderStatus.CANCELLED ? o.total : 0),
      0
    );

    const todayStr = new Date().toISOString().split('T')[0];
    const todayRevenue = orders
      .filter((o) => o.createdAt.toISOString().startsWith(todayStr) && o.status !== OrderStatus.CANCELLED)
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = orders.filter((o) => o.status === OrderStatus.PENDING).length;
    const processingOrders = orders.filter((o) => o.status === OrderStatus.PROCESSING).length;
    const shippedOrders = orders.filter((o) => o.status === OrderStatus.SHIPPED).length;
    const deliveredOrders = orders.filter((o) => o.status === OrderStatus.DELIVERED).length;
    const cancelledOrders = orders.filter((o) => o.status === OrderStatus.CANCELLED).length;

    const totalCustomers = await prisma.user.count({
      where: { role: Role.CUSTOMER },
    });

    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lt: 50 } },
    });

    // Top selling products calculation
    const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    orders.forEach((o) => {
      if (o.status !== OrderStatus.CANCELLED) {
        o.items.forEach((item) => {
          const existing = productSalesMap.get(item.productName) || {
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };
          existing.quantity += item.quantity;
          existing.revenue += item.price * item.quantity;
          productSalesMap.set(item.productName, existing);
        });
      }
    });

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        todayRevenue,
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalCustomers,
        conversionRate: '4.8%',
        visitorsToday: 1240,
      },
      lowStockAlerts: lowStockProducts,
      recentOrders: orders.slice(0, 5).map((o) => ({
        _id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        total: o.total,
        createdAt: o.createdAt,
        itemsCount: o.items.length,
      })),
      topProducts,
      salesGraph: [
        { month: 'Jan', sales: 18500 },
        { month: 'Feb', sales: 22400 },
        { month: 'Mar', sales: 28900 },
        { month: 'Apr', sales: 31200 },
        { month: 'May', sales: 36800 },
        { month: 'Jun', sales: 42100 },
        { month: 'Jul', sales: 49500 },
        { month: 'Aug', sales: totalRevenue },
      ],
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve analytics' },
      { status: 500 }
    );
  }
}
