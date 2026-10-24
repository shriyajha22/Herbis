import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { inMemoryStore, connectToDatabase } from '@/lib/db';
import { OrderModel } from '@/models/Order';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  await connectToDatabase();

  try {
    const activeSessions = inMemoryStore.getActiveSessions();
    const currentlyOnline = activeSessions.filter((s) => s.isOnline).length;

    let ordersList: any[] = [];
    try {
      ordersList = await OrderModel.find({}).sort({ createdAt: -1 }).lean();
    } catch (err) {}

    if (ordersList.length === 0) {
      ordersList = inMemoryStore.orders;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todaysOrders = ordersList.filter((o) => o.createdAt.startsWith(todayStr)).length;

    const pendingOrders = ordersList.filter((o) => o.orderStatus === 'Pending').length;
    const ordersInDelivery = ordersList.filter((o) =>
      ['Processing', 'Packed', 'Shipped', 'Out for Delivery'].includes(o.orderStatus)
    ).length;
    const completedOrders = ordersList.filter((o) => o.orderStatus === 'Delivered').length;

    const todaysRevenue = ordersList
      .filter((o) => o.createdAt.startsWith(todayStr) && o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const totalRevenue = ordersList
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

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
      activeSessions,
      orders: ordersList,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch live admin data' },
      { status: 500 }
    );
  }
}
