import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { OrderStatus, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken, verifyCustomerToken } from '@/lib/auth';
import { getOrderItemImage } from '@/lib/seedData';
import { orderCreateSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

function formatOrderResponse(order: any) {
  if (!order) return order;
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
    items: (order.items || []).map((it: any) => {
      const resolvedImg = getOrderItemImage(it) || it.productImage || '/images/blue-tea.jpg';
      return {
        _id: it.id,
        productId: it.productId || it.product?.id,
        productName: it.productName,
        productImage: resolvedImg,
        image: resolvedImg,
        price: it.price,
        quantity: it.quantity,
        weight: it.weight || '30 Tea Bags',
      };
    }),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const emailParam = searchParams.get('email');

    // 1. Order Tracking by Order Number (Public / Track Order)
    if (orderNumber) {
      const cleanOrderNumber = orderNumber.trim();
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { orderNumber: { equals: cleanOrderNumber, mode: 'insensitive' } },
            { id: cleanOrderNumber },
          ],
        },
        include: { items: true },
      });

      if (!order) {
        return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
      }

      // Check if current user is owner or admin
      const customerAuth = verifyCustomerToken(request);
      const isOwnerOrAdmin =
        customerAuth.isAuthorized &&
        customerAuth.user &&
        (customerAuth.user.role === 'admin' ||
          customerAuth.user.userId === order.userId ||
          (order.shippingAddress as any)?.email?.toLowerCase() ===
            customerAuth.user.email.toLowerCase());

      if (isOwnerOrAdmin) {
        return NextResponse.json({ success: true, order: formatOrderResponse(order) });
      }

      // Public tracking response - mask sensitive personal data
      const address = (order.shippingAddress as any) || {};
      const publicOrder = {
        orderNumber: order.orderNumber,
        orderStatus: order.status,
        status: order.status,
        createdAt: order.createdAt,
        estimatedDelivery: order.estimatedDelivery || '3-5 Business Days',
        trackingNumber: order.trackingNumber || null,
        courierName: order.courierName || 'Shiprocket Express',
        items: (order.items || []).map((it: any) => ({
          productName: it.productName,
          quantity: it.quantity,
          weight: it.weight,
          image: getOrderItemImage(it) || it.productImage || '/images/blue-tea.jpg',
        })),
        shippingAddress: {
          city: address.city || '',
          state: address.state || '',
          pincode: address.pincode ? `***${String(address.pincode).slice(-3)}` : '',
        },
      };

      return NextResponse.json({ success: true, order: publicOrder });
    }

    // 2. Customer Order History
    const customerAuth = verifyCustomerToken(request);
    if (customerAuth.isAuthorized && customerAuth.user) {
      const authUser = customerAuth.user;

      if (authUser.role === 'admin') {
        const allOrders = await prisma.order.findMany({
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        });
        return NextResponse.json({
          success: true,
          orders: allOrders.map(formatOrderResponse),
        });
      }

      const userOrders = await prisma.order.findMany({
        where: {
          OR: [
            { userId: authUser.userId },
            { shippingAddress: { path: ['email'], equals: authUser.email.toLowerCase() } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      });

      return NextResponse.json({
        success: true,
        orders: userOrders.map(formatOrderResponse),
      });
    }

    // 3. Fallback for unauthenticated email lookup
    if (emailParam) {
      const cleanEmail = emailParam.trim().toLowerCase();
      const guestOrders = await prisma.order.findMany({
        where: {
          shippingAddress: { path: ['email'], equals: cleanEmail },
        },
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      });

      return NextResponse.json({
        success: true,
        orders: guestOrders.map(formatOrderResponse),
      });
    }

    // 4. Default: Admin-only full list
    const adminAuth = verifyAdminToken(request);
    if (adminAuth.isAuthorized) {
      const allOrders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      });
      return NextResponse.json({
        success: true,
        orders: allOrders.map(formatOrderResponse),
      });
    }

    return NextResponse.json(
      { success: false, message: 'Authentication required to view orders' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while fetching orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = orderCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0]?.message || 'Invalid order data' },
        { status: 400 }
      );
    }

    const validData = validation.data;

    if (validData.paymentMethod && validData.paymentMethod !== 'Cash on Delivery') {
      return NextResponse.json(
        {
          success: false,
          message: 'PrimeBrew Herbis accepts Cash on Delivery (COD) only. Online payment options are disabled.',
        },
        { status: 400 }
      );
    }

    const auth = verifyCustomerToken(request);
    const userId = auth.isAuthorized && auth.user ? auth.user.userId : null;
    const customerEmail = (auth.isAuthorized && auth.user ? auth.user.email : validData.shippingAddress.email || '').trim().toLowerCase();
    const customerName = (validData.shippingAddress.fullName || (auth.isAuthorized && auth.user ? auth.user.name : '') || 'Customer').trim();

    const orderNumber = `PBH-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const trackingNumber = `SR-${Math.floor(100000000 + Math.random() * 900000000)}`;

    const shippingAddressJson = {
      fullName: customerName,
      phone: String(validData.shippingAddress.phone || '').trim(),
      email: customerEmail,
      street: String(validData.shippingAddress.street || '').trim(),
      city: String(validData.shippingAddress.city || '').trim(),
      state: String(validData.shippingAddress.state || '').trim(),
      pincode: String(validData.shippingAddress.pincode || '').trim(),
      isDefault: Boolean(validData.shippingAddress.isDefault),
    };

    // Atomic transaction: verify stock, decrement stock, and create order + items
    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1. Verify stock for all items
      for (const item of validData.items) {
        const itemPid = String(item.productId || (item as any).id || '');
        const product = await tx.product.findFirst({
          where: {
            OR: [
              { id: itemPid },
              { slug: { equals: itemPid, mode: 'insensitive' } },
            ],
          },
        });

        if (product && product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} available.`);
        }
      }

      // 2. Decrement stock for matched products
      for (const item of validData.items) {
        const itemPid = String(item.productId || (item as any).id || '');
        const product = await tx.product.findFirst({
          where: {
            OR: [
              { id: itemPid },
              { slug: { equals: itemPid, mode: 'insensitive' } },
            ],
          },
        });

        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await tx.product.update({
            where: { id: product.id },
            data: {
              stock: newStock,
              inStock: newStock > 0,
            },
          });
        }
      }

      // 3. Create the order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: userId || undefined,
          status: OrderStatus.PROCESSING,
          paymentMethod: 'Cash on Delivery',
          paymentStatus: 'Pending',
          subtotal: Number(body.subtotal) || 0,
          discount: Number(body.discount) || 0,
          shippingFee: Number(body.shippingFee) || 0,
          tax: Number(body.tax) || 0,
          total: Number(body.total) || 0,
          trackingNumber,
          courierName: 'Shiprocket Express',
          estimatedDelivery: '3-5 Business Days',
          shippingAddress: shippingAddressJson,
          giftWrap: Boolean(body.giftWrap),
          giftMessage: body.giftMessage || null,
          appliedCoupon: body.couponCode || null,
          items: {
            create: validData.items.map((it: any) => ({
              productId: it.productId || it.id || null,
              productName: it.productName || it.name || 'Herbal Tea',
              productImage: getOrderItemImage(it) || it.productImage || null,
              price: Number(it.price) || 0,
              quantity: Number(it.quantity) || 1,
              weight: String(it.weight || '30 Tea Bags'),
            })),
          },
        },
        include: { items: true },
      });

      // 4. Create in-app notification
      await tx.notification.create({
        data: {
          title: `New Order: ${order.orderNumber}`,
          message: `Received COD order for ₹${order.total.toLocaleString('en-IN')} by ${customerName}.`,
          type: 'order',
          link: `/admin/orders?search=${order.orderNumber}`,
        },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      message: 'Order created successfully!',
      order: formatOrderResponse(createdOrder),
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    const message = error.message?.includes('Insufficient stock')
      ? error.message
      : 'Failed to create order. Please verify your cart and try again.';
    return NextResponse.json(
      { success: false, message },
      { status: error.message?.includes('Insufficient stock') ? 400 : 500 }
    );
  }
}
