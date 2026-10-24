import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyCustomerToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = verifyCustomerToken(request);
    if (!auth.isAuthorized || !auth.user) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const { orderId, orderNumber } = body;

    const target = orderId || orderNumber;
    if (!target) {
      return NextResponse.json(
        { success: false, message: 'Order ID or Order Number is required for cancellation.' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: String(target) },
          { orderNumber: { equals: String(target).trim(), mode: 'insensitive' } },
        ],
      },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    const isOwner =
      (order.userId && order.userId === auth.user.userId) ||
      ((order.shippingAddress as any)?.email?.toLowerCase() === auth.user.email.toLowerCase());
    const isAdmin = auth.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Access Denied: You can only cancel your own orders.' },
        { status: 403 }
      );
    }

    if (order.status === OrderStatus.CANCELLED) {
      return NextResponse.json(
        { success: false, message: `Order #${order.orderNumber} is already cancelled.` },
        { status: 400 }
      );
    }

    const cancellable: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.CONFIRMED];
    if (!cancellable.includes(order.status) && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: `Order #${order.orderNumber} cannot be cancelled as it is already ${order.status.toLowerCase()}. Please contact support.`,
        },
        { status: 400 }
      );
    }

    // Atomic transaction: restore stock and mark order cancelled
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Restore stock
      for (const item of order.items) {
        if (item.productId) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            await tx.product.update({
              where: { id: product.id },
              data: {
                stock: product.stock + item.quantity,
                inStock: true,
              },
            });
          }
        }
      }

      // 2. Mark order cancelled
      const cancelledOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelledBy: auth.user!.email,
        },
        include: { items: true },
      });

      // 3. Admin notification
      await tx.notification.create({
        data: {
          title: `Order Cancelled: ${order.orderNumber}`,
          message: `Order #${order.orderNumber} was cancelled by ${auth.user!.email}. Stock restored.`,
          type: 'alert',
          link: `/admin/orders?search=${order.orderNumber}`,
        },
      });

      return cancelledOrder;
    });

    return NextResponse.json({
      success: true,
      message: `Order #${order.orderNumber} was successfully cancelled.`,
      order: {
        ...updated,
        _id: updated.id,
        orderStatus: updated.status,
      },
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to cancel order. Please try again.' },
      { status: 500 }
    );
  }
}
