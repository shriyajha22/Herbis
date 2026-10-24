import { NextResponse } from 'next/server';
import { inMemoryStore, connectToDatabase } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  await connectToDatabase();

  const totalOrders = inMemoryStore.orders.length;
  const totalRevenue = inMemoryStore.orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRevenue = inMemoryStore.orders
    .filter((o) => o.createdAt.startsWith(todayStr))
    .reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0);

  // Status breakdown counts
  const pendingOrders = inMemoryStore.orders.filter((o) => o.orderStatus === 'Pending').length;
  const processingOrders = inMemoryStore.orders.filter((o) => o.orderStatus === 'Processing').length;
  const shippedOrders = inMemoryStore.orders.filter((o) => o.orderStatus === 'Shipped').length;
  const deliveredOrders = inMemoryStore.orders.filter((o) => o.orderStatus === 'Delivered').length;
  const cancelledOrders = inMemoryStore.orders.filter((o) => o.orderStatus === 'Cancelled').length;

  const totalCustomers = inMemoryStore.users.filter((u) => u.role === 'customer').length;
  const lowStockProducts = inMemoryStore.products.filter((p) => p.stock < 50);

  // Calculate top selling products
  const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  inMemoryStore.orders.forEach((o) => {
    o.items.forEach((item) => {
      const existing = productSalesMap.get(item.productName) || { name: item.productName, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += item.price * item.quantity;
      productSalesMap.set(item.productName, existing);
    });
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
      conversionRate: "4.8%",
      visitorsToday: 1240,
    },
    lowStockAlerts: lowStockProducts,
    recentOrders: inMemoryStore.orders.slice(0, 5),
    topProducts,
    salesGraph: [
      { month: "Jan", sales: 18500 },
      { month: "Feb", sales: 22400 },
      { month: "Mar", sales: 28900 },
      { month: "Apr", sales: 31200 },
      { month: "May", sales: 36800 },
      { month: "Jun", sales: 42100 },
      { month: "Jul", sales: 49500 },
      { month: "Aug", sales: totalRevenue },
    ],
  });
}
