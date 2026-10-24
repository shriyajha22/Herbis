import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken, verifyCustomerToken } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import { getOrderItemImage } from '@/lib/seedData';

export const dynamic = 'force-dynamic';

function formatOrder(order: any) {
  return {
    _id: order.id,
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    status: order.status,
    orderStatus: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    discount: order.discount,
    shippingFee: order.shippingFee,
    tax: order.tax,
    total: order.total,
    trackingNumber: order.trackingNumber,
    courierName: order.courierName,
    estimatedDelivery: order.estimatedDelivery,
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
    items: (order.items || []).map((it: any) => ({
      _id: it.id,
      productId: it.productId,
      productName: it.productName,
      productImage: getOrderItemImage(it) || it.productImage || '/images/blue-tea.jpg',
      image: getOrderItemImage(it) || it.productImage || '/images/blue-tea.jpg',
      price: it.price,
      quantity: it.quantity,
      weight: it.weight || '30 Tea Bags',
    })),
  };
}

export async function GET(
  request: Request,
  context: { params: { orderId: string } | Promise<{ orderId: string }> }
) {
  try {
    const params = await context.params;
    const { orderId } = params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: { equals: orderId.trim(), mode: 'insensitive' } },
        ],
      },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const auth = verifyCustomerToken(request);
    const isOwnerOrAdmin =
      auth.isAuthorized &&
      auth.user &&
      (auth.user.role === 'admin' ||
        auth.user.userId === order.userId ||
        (order.shippingAddress as any)?.email?.toLowerCase() === auth.user.email.toLowerCase());

    if (!isOwnerOrAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      order: formatOrder(order),
    });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: { orderId: string } | Promise<{ orderId: string }> }
) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    const params = await context.params;
    const { orderId } = params;
    const body = await request.json();

    const existing = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: { equals: orderId.trim(), mode: 'insensitive' } },
        ],
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const data: any = {};
    if (body.orderStatus || body.status) {
      const rawStatus = (body.orderStatus || body.status).toUpperCase();
      if (Object.values(OrderStatus).includes(rawStatus as OrderStatus)) {
        data.status = rawStatus as OrderStatus;
      }
    }
    if (body.paymentStatus) data.paymentStatus = body.paymentStatus;
    if (body.trackingNumber !== undefined) data.trackingNumber = body.trackingNumber;
    if (body.courierName !== undefined) data.courierName = body.courierName;
    if (body.estimatedDelivery !== undefined) data.estimatedDelivery = body.estimatedDelivery;

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data,
      include: { items: true },
    });

    await logAdminAction(auth.admin?.email || 'admin', 'UPDATE', 'ORDER', updated.id, {
      orderNumber: updated.orderNumber,
      changes: data,
    });

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: formatOrder(updated),
    });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order' },
      { status: 500 }
    );
  }
}
