import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { inMemoryStore, connectToDatabase } from '@/lib/db';
import { OrderModel } from '@/models/Order';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  context: { params: { orderId: string } | Promise<{ orderId: string }> }
) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  await connectToDatabase();
  try {
    const params = await context.params;
    const { orderId } = params;
    const body = await request.json();

    const updateFields: any = {};
    if (body.orderStatus) updateFields.orderStatus = body.orderStatus;
    if (body.paymentStatus) updateFields.paymentStatus = body.paymentStatus;
    if (body.trackingNumber !== undefined) updateFields.trackingNumber = body.trackingNumber;
    if (body.courierName !== undefined) updateFields.courierName = body.courierName;

    // 1. Update in MongoDB if connected
    let updatedOrder: any = null;
    if (mongoose.connection.readyState === 1) {
      updatedOrder = await OrderModel.findOneAndUpdate(
        { $or: [{ _id: orderId }, { orderNumber: new RegExp(`^${orderId.trim()}$`, 'i') }] },
        { $set: updateFields },
        { new: true }
      ).lean();
    }

    // 2. Update in memory store
    const orderIndex = inMemoryStore.orders.findIndex(
      (o) => o._id === orderId || o.orderNumber.toLowerCase() === orderId.toLowerCase()
    );

    if (orderIndex !== -1) {
      const currentOrder = inMemoryStore.orders[orderIndex];
      if (body.orderStatus) currentOrder.orderStatus = body.orderStatus;
      if (body.paymentStatus) currentOrder.paymentStatus = body.paymentStatus;
      if (body.trackingNumber !== undefined) currentOrder.trackingNumber = body.trackingNumber;
      if (body.courierName !== undefined) currentOrder.courierName = body.courierName;
      inMemoryStore.orders[orderIndex] = currentOrder;
      if (!updatedOrder) updatedOrder = currentOrder;
    }

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update order' },
      { status: 500 }
    );
  }
}
