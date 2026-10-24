import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase, inMemoryStore } from '@/lib/db';
import { OrderModel } from '@/models/Order';
import { NotificationModel } from '@/models/Notification';
import { verifyCustomerToken } from '@/lib/auth';
import { getOrderItemImage } from '@/lib/seedData';

export const dynamic = 'force-dynamic';

const normalizeOrder = (order: any) => {
  if (!order) return order;
  const items = (order.items || []).map((it: any) => {
    const resolvedImg = getOrderItemImage(it);
    return {
      ...it,
      productImage: resolvedImg,
      image: resolvedImg,
    };
  });
  return {
    ...order,
    items,
  };
};

export async function POST(request: Request) {
  try {
    // 1. Mandatory Customer Authentication
    const auth = verifyCustomerToken(request);
    if (!auth.isAuthorized || !auth.user) {
      return auth.errorResponse!;
    }

    await connectToDatabase();
    const body = await request.json();
    const { orderId, orderNumber } = body;

    const targetIdentifier = orderId || orderNumber;
    if (!targetIdentifier) {
      return NextResponse.json(
        { success: false, message: 'Order ID or Order Number is required for cancellation.' },
        { status: 400 }
      );
    }

    // 2. Find Order in MongoDB or Memory Store
    let order: any = null;
    try {
      order = await OrderModel.findOne({
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(targetIdentifier) ? targetIdentifier : null },
          { orderNumber: new RegExp(`^${String(targetIdentifier).trim()}$`, 'i') },
        ],
      }).lean();
    } catch (err) {}

    if (!order) {
      order = inMemoryStore.orders.find(
        (o) => o._id === targetIdentifier || o.orderNumber.toLowerCase() === String(targetIdentifier).trim().toLowerCase()
      );
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found.' },
        { status: 404 }
      );
    }

    // 3. Security Check: Customer can ONLY cancel their own order
    const isOwner =
      (order.userId && order.userId === auth.user.userId) ||
      (order.shippingAddress?.email?.toLowerCase() === auth.user.email.toLowerCase());
    const isAdmin = auth.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Access Denied: You can only cancel your own orders.' },
        { status: 403 }
      );
    }

    // 4. Status Check: Cancellation is ONLY allowed for Pending / Processing / Confirmed
    const currentStatus = order.orderStatus || 'Processing';
    const currentStatusLower = String(currentStatus).trim().toLowerCase();
    const cancellableStatuses = ['pending', 'processing', 'confirmed'];

    if (currentStatusLower === 'cancelled') {
      return NextResponse.json(
        {
          success: false,
          message: `Order #${order.orderNumber} is already cancelled.`,
        },
        { status: 400 }
      );
    }

    if (!cancellableStatuses.includes(currentStatusLower)) {
      return NextResponse.json(
        {
          success: false,
          message: `Order cannot be cancelled because it is currently "${currentStatus}". Only orders in Pending, Processing, or Confirmed state can be cancelled.`,
        },
        { status: 400 }
      );
    }

    // 5. Perform Cancellation Persistence
    const cancellationTimestamp = new Date().toISOString();
    const initiator = auth.user.role === 'admin' ? 'Admin' : 'Customer';

    const updatePayload = {
      orderStatus: 'Cancelled' as const,
      cancelledAt: cancellationTimestamp,
      cancelledBy: initiator,
      previousStatus: currentStatus,
    };

    let updatedOrder: any = null;
    try {
      const doc = await OrderModel.findOneAndUpdate(
        { $or: [{ _id: order._id }, { orderNumber: order.orderNumber }] },
        { $set: updatePayload },
        { new: true }
      ).lean();
      if (doc) {
        updatedOrder = doc;
      }
    } catch (dbErr) {
      console.warn('MongoDB cancellation update warning:', dbErr);
    }

    // Also update inMemoryStore cache
    const memIdx = inMemoryStore.orders.findIndex(
      (o) => o._id === order._id || o.orderNumber === order.orderNumber
    );
    if (memIdx !== -1) {
      inMemoryStore.orders[memIdx] = {
        ...inMemoryStore.orders[memIdx],
        ...updatePayload,
      };
      if (!updatedOrder) {
        updatedOrder = inMemoryStore.orders[memIdx];
      }
    }

    if (!updatedOrder) {
      updatedOrder = { ...order, ...updatePayload };
    }

    // Save Admin Notification for cancellation in MongoDB Atlas
    try {
      const customerName = order.shippingAddress?.fullName || order.customerName || auth.user.name || 'Customer';
      const notifMsg = `Order #${order.orderNumber} has been cancelled by ${customerName}. Total: ₹${order.total}`;
      await NotificationModel.create({
        type: 'order_cancelled',
        orderId: order._id ? order._id.toString() : targetIdentifier,
        orderNumber: order.orderNumber,
        customerName,
        total: order.total || 0,
        message: notifMsg,
        read: false,
      });
    } catch (notifErr) {
      console.warn('Cancellation notification fallback:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: `Order #${order.orderNumber} has been cancelled successfully.`,
      order: normalizeOrder(updatedOrder),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error processing order cancellation.' },
      { status: 500 }
    );
  }
}
