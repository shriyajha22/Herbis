import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { inMemoryStore, connectToDatabase } from '@/lib/db';
import { OrderModel } from '@/models/Order';
import { Order } from '@/lib/types';
import { verifyAdminToken, verifyCustomerToken } from '@/lib/auth';
import { getOrderItemImage } from '@/lib/seedData';

import { NotificationModel } from '@/models/Notification';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'pbh_super_secret_jwt_key_2026_primebrew';

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

const normalizeOrders = (orders: any[]) => {
  if (!Array.isArray(orders)) return orders;
  return orders.map(normalizeOrder);
};

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const emailParam = searchParams.get('email');

    // 1. Order Tracking by Order Number (Public / Track Order)
    if (orderNumber) {
      let order: any = null;
      try {
        order = await OrderModel.findOne({ orderNumber: new RegExp(`^${orderNumber.trim()}$`, 'i') }).lean();
      } catch (err) {}
      if (!order) {
        order = inMemoryStore.orders.find(
          (o) => o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase()
        );
      }

      if (!order) {
        return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, order: normalizeOrder(order) });
    }

    // 2. Customer Order History (Protected with JWT verification & customer cross-account isolation)
    const customerAuth = verifyCustomerToken(request);
    if (customerAuth.isAuthorized && customerAuth.user) {
      const authUser = customerAuth.user;
      const cleanAuthEmail = authUser.email.toLowerCase();

      // If customer attempts to request another customer's email
      if (emailParam && emailParam.trim().toLowerCase() !== cleanAuthEmail && authUser.role !== 'admin') {
        return NextResponse.json(
          { success: false, message: 'Access Denied: You are not authorized to view orders for another account.' },
          { status: 403 }
        );
      }

      const targetEmail = authUser.role === 'admin' && emailParam ? emailParam.trim().toLowerCase() : cleanAuthEmail;

      let filteredOrders: any[] = [];
      try {
        filteredOrders = await OrderModel.find({
          $or: [
            { userId: authUser.userId },
            { 'shippingAddress.email': new RegExp(`^${targetEmail}$`, 'i') },
          ],
        }).sort({ createdAt: -1 }).lean();
      } catch (err) {}

      if (filteredOrders.length === 0) {
        filteredOrders = inMemoryStore.orders.filter(
          (o) => (o.userId && o.userId === authUser.userId) || o.shippingAddress?.email?.toLowerCase() === targetEmail
        );
      }
      return NextResponse.json({ success: true, orders: normalizeOrders(filteredOrders) });
    }

    // 3. Storewide Orders Listing (Requires Admin Authorization)
    const auth = verifyAdminToken(request);
    if (!auth.isAuthorized) {
      return auth.errorResponse!;
    }

    let allOrders: any[] = [];
    try {
      allOrders = await OrderModel.find({}).sort({ createdAt: -1 }).lean();
    } catch (err) {}

    if (allOrders.length === 0) {
      allOrders = inMemoryStore.orders;
    }

    return NextResponse.json({
      success: true,
      orders: normalizeOrders(allOrders),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Database query error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.items || body.items.length === 0 || !body.shippingAddress) {
      return NextResponse.json(
        { success: false, message: 'Invalid order data. Items and shipping address are required.' },
        { status: 400 }
      );
    }

    if (body.paymentMethod && body.paymentMethod !== 'Cash on Delivery') {
      return NextResponse.json(
        { success: false, message: 'PrimeBrew Herbis accepts Cash on Delivery (COD) only. Online payment options are disabled.' },
        { status: 400 }
      );
    }

    // Optional Customer Authentication check (supports guest & logged in users)
    const auth = verifyCustomerToken(request);
    const userId = auth.isAuthorized && auth.user ? auth.user.userId : `guest-${Date.now()}`;
    const customerEmail = (auth.isAuthorized && auth.user ? auth.user.email : body.shippingAddress?.email || '').trim().toLowerCase();
    const customerName = (body.shippingAddress?.fullName || (auth.isAuthorized && auth.user ? auth.user.name : '') || 'Customer').trim();

    const formattedItems = body.items.map((item: any) => {
      const itemImg = getOrderItemImage(item);
      return {
        productId: String(item.productId || item._id || 'prod-unknown'),
        productName: String(item.productName || item.name || 'Herbal Tea'),
        productImage: itemImg,
        image: itemImg,
        price: Number(item.price || item.unitPrice) || 0,
        weight: String(item.weight || item.selectedWeight || '30 Tea Bags'),
        quantity: Number(item.quantity) || 1,
      };
    });

    const uniqueId = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `PBH-2026-${randomSuffix}`;
    const trackingNumber = `SR-${Math.floor(100000000 + Math.random() * 900000000)}`;

    const orderDocData = {
      userId,
      orderNumber,
      createdAt: new Date().toISOString(),
      items: formattedItems,
      shippingAddress: {
        fullName: customerName,
        phone: String(body.shippingAddress.phone || '').trim(),
        email: customerEmail,
        street: String(body.shippingAddress.street || '').trim(),
        city: String(body.shippingAddress.city || '').trim(),
        state: String(body.shippingAddress.state || '').trim(),
        pincode: String(body.shippingAddress.pincode || '').trim(),
        isDefault: Boolean(body.shippingAddress.isDefault),
      },
      gstInvoice: body.gstInvoice ? {
        gstin: String(body.gstInvoice.gstin || ''),
        companyName: String(body.gstInvoice.companyName || ''),
      } : undefined,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      orderStatus: 'Processing',
      trackingNumber,
      courierName: 'Shiprocket Express',
      subtotal: Number(body.subtotal) || 0,
      discount: Number(body.discount) || 0,
      shippingFee: Number(body.shippingFee) || 0,
      tax: Number(body.tax) || 0,
      total: Number(body.total) || 0,
      estimatedDelivery: '3-5 Business Days',
    };

    console.log('Order creation request received at /api/orders', {
      userId,
      email: customerEmail,
      itemCount: formattedItems.length,
      hasShippingAddress: Boolean(body.shippingAddress),
      paymentMethod: 'Cash on Delivery',
    });

    let createdOrder: any = null;
    try {
      console.log('Attempting OrderModel.create() in MongoDB Atlas...');
      const doc = await OrderModel.create(orderDocData);
      if (doc) {
        createdOrder = doc.toObject ? doc.toObject() : doc;
        createdOrder._id = doc._id.toString();
        console.log('✅ Order created successfully in MongoDB Atlas primebrew.orders', {
          orderId: createdOrder._id,
          orderNumber: createdOrder.orderNumber,
          userId: createdOrder.userId,
        });
      }
    } catch (dbErr: any) {
      console.error('❌ OrderModel.create() failed in MongoDB Atlas:', {
        name: dbErr?.name,
        message: dbErr?.message ? String(dbErr.message).replace(/\/\/[^:]+:[^@]+@/g, '//***:***@') : '',
        code: dbErr?.code || null,
        codeName: dbErr?.codeName || null,
        errors: dbErr?.errors ? Object.keys(dbErr.errors) : [],
      });
    }

    if (!createdOrder) {
      createdOrder = { _id: `ord-${uniqueId}`, ...orderDocData };
      inMemoryStore.orders.unshift(createdOrder);
    } else {
      inMemoryStore.orders.unshift(createdOrder);
    }

    // Persistent Admin Notification in MongoDB Atlas
    try {
      const notifMsg = `Order #${orderNumber} has been placed by ${customerName}. Total: ₹${orderDocData.total}`;
      await NotificationModel.create({
        type: 'new_order',
        orderId: createdOrder._id,
        orderNumber,
        customerName,
        total: orderDocData.total,
        message: notifMsg,
        read: false,
      });
    } catch (notifErr) {
      console.warn('Notification creation fallback:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: normalizeOrder(createdOrder),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

