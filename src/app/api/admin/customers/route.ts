import { NextResponse } from 'next/server';
import { inMemoryStore, connectToDatabase } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { UserModel } from '@/models/User';
import { OrderModel } from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  await connectToDatabase();

  try {
    const customerMap = new Map<string, any>();

    // 1. Fetch registered users from MongoDB if available
    try {
      const dbUsers = await UserModel.find({ role: 'customer' }).lean();
      dbUsers.forEach((user: any) => {
        const emailKey = user.email.toLowerCase();
        customerMap.set(emailKey, {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.addresses?.[0]?.phone || user.phone || 'N/A',
          role: 'customer',
          walletBalance: user.walletBalance || 0,
          createdAt: user.createdAt
            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            : 'August 1, 2026',
          ordersCount: 0,
          totalSpent: 0,
        });
      });
    } catch (dbErr) {
      // Ignore background DB fetch error
    }

    // 2. Add registered users from inMemoryStore
    inMemoryStore.users.forEach((user) => {
      if (user.role === 'customer' && !customerMap.has(user.email.toLowerCase())) {
        customerMap.set(user.email.toLowerCase(), {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.addresses?.[0]?.phone || user.phone || 'N/A',
          role: 'customer',
          walletBalance: user.walletBalance || 0,
          createdAt: 'August 1, 2026',
          ordersCount: 0,
          totalSpent: 0,
        });
      }
    });

    // 3. Aggregate orders data for customers from MongoDB & Memory Store
    let allOrders: any[] = [...inMemoryStore.orders];
    try {
      const dbOrders = await OrderModel.find().lean();
      if (dbOrders && dbOrders.length > 0) {
        dbOrders.forEach((o: any) => {
          if (!allOrders.some((ord) => ord._id === o._id.toString() || ord.orderNumber === o.orderNumber)) {
            allOrders.push(o);
          }
        });
      }
    } catch (oErr) {}

    allOrders.forEach((order) => {
      const emailKey = order.shippingAddress?.email?.toLowerCase() || '';
      if (!emailKey) return;

      let existing = customerMap.get(emailKey);
      if (existing) {
        existing.ordersCount += 1;
        existing.totalSpent += order.total || 0;
      }
    });

    const customers = Array.from(customerMap.values());

    return NextResponse.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customers list' },
      { status: 500 }
    );
  }
}
