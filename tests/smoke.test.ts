import { describe, it, expect } from 'vitest';

const BASE_URL = 'http://localhost:3000';

describe('Local End-to-End Smoke Testing Suite', () => {
  let customerCookie = '';
  let customerEmail = `smoke_user_${Date.now()}@primebrew.local`;
  let customerPassword = 'SecurePassword2026!';
  let testOrderNumber = '';
  let testOrderId = '';
  let targetProductId = '';
  let initialStock = 0;
  let adminCookie = '';

  // 1. Health Check
  it('1. Database Health Check (/api/health/db)', async () => {
    const res = await fetch(`${BASE_URL}/api/health/db`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.diagnostics.DATABASE_ACCESS_OK).toBe(true);
    expect(data.counts.products).toBeGreaterThan(0);
    console.log(`   ✅ DB Connected. Products in DB: ${data.counts.products}, Users: ${data.counts.users}, Orders: ${data.counts.orders}`);
  });

  // 2. Catalog & Categories
  it('2. Categories & Products Catalog Retrieval', async () => {
    const catRes = await fetch(`${BASE_URL}/api/categories`);
    expect(catRes.status).toBe(200);
    const catData = await catRes.json();
    expect(catData.categories.length).toBeGreaterThanOrEqual(3);

    const prodRes = await fetch(`${BASE_URL}/api/products`);
    expect(prodRes.status).toBe(200);
    const prodData = await prodRes.json();
    expect(prodData.products.length).toBeGreaterThan(0);

    const firstProduct = prodData.products[0];
    targetProductId = firstProduct._id;
    initialStock = firstProduct.stock;
    expect(firstProduct.price).toBeGreaterThan(0);

    // Slug lookup
    const singleRes = await fetch(`${BASE_URL}/api/products/${firstProduct.slug}`);
    expect(singleRes.status).toBe(200);
    const singleData = await singleRes.json();
    expect(singleData.product.name).toBe(firstProduct.name);
    console.log(`   ✅ Catalog verified: "${firstProduct.name}" (Stock: ${initialStock}, Price: ₹${firstProduct.price})`);
  });

  // 3. Customer Registration
  it('3. Customer Registration with 8+ char password & wallet bonus', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Smoke Test User',
        email: customerEmail,
        phone: '9888877777',
        password: customerPassword,
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.email).toBe(customerEmail);
    expect(data.user.walletBalance).toBe(250);

    // Save session cookie
    const setCookie = (res.headers as any).getSetCookie?.() || [res.headers.get('set-cookie')];
    customerCookie = (setCookie[0] || '').split(';')[0];
    console.log(`   ✅ Customer registered: ${customerEmail} (Wallet: ₹${data.user.walletBalance})`);
  });

  // 4. Customer Login
  it('4. Customer Authentication (/api/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerEmail,
        password: customerPassword,
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.role).toBe('customer');

    const setCookie = (res.headers as any).getSetCookie?.() || [res.headers.get('set-cookie')];
    customerCookie = (setCookie[0] || '').split(';')[0];
    console.log(`   ✅ Customer logged in successfully: ${data.user.name}`);
  });

  // 5. Customer Profile Retrieval (/api/auth/me)
  it('5. Profile Verification via JWT Cookie (/api/auth/me)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: customerCookie },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe(customerEmail);
    console.log(`   ✅ Session verified: ${data.user.email}`);
  });

  // 6. Address Management
  it('6. Save Customer Shipping Address (/api/user/addresses)', async () => {
    const res = await fetch(`${BASE_URL}/api/user/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        email: customerEmail,
        action: 'add',
        address: {
          fullName: 'Smoke Test User',
          phone: '9888877777',
          street: '42 Herbal Blossom Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
          isDefault: true,
        },
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.addresses.length).toBeGreaterThan(0);
    console.log(`   ✅ Shipping address added: ${data.addresses[0].addressLine1}, ${data.addresses[0].city}`);
  });

  // 7. Wishlist Management
  it('7. Update Customer Wishlist (/api/user/wishlist)', async () => {
    const res = await fetch(`${BASE_URL}/api/user/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        email: customerEmail,
        wishlist: [targetProductId],
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.wishlist).toContain(targetProductId);
    console.log(`   ✅ Wishlist synchronized in PostgreSQL`);
  });

  // 8. Order Placement & Atomic Stock Deduction
  it('8. Place Cash on Delivery Order with Atomic Stock Deduction (/api/orders)', async () => {
    const orderPayload = {
      items: [
        {
          productId: targetProductId,
          productName: 'Blue Tea',
          price: 249,
          quantity: 2,
          weight: '30 Tea Bags',
        },
      ],
      shippingAddress: {
        fullName: 'Smoke Test User',
        email: customerEmail,
        phone: '9888877777',
        street: '42 Herbal Blossom Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        isDefault: true,
      },
      paymentMethod: 'Cash on Delivery',
      subtotal: 498,
      discount: 0,
      shippingFee: 0,
      tax: 0,
      total: 498,
    };

    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: customerCookie,
      },
      body: JSON.stringify(orderPayload),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.order.orderNumber).toMatch(/^PBH-[0-9A-F]{8}$/);
    expect(data.order.status).toBe('PROCESSING');

    testOrderNumber = data.order.orderNumber;
    testOrderId = data.order._id || data.order.id;

    // Verify stock deduction in database
    const prodRes = await fetch(`${BASE_URL}/api/products`);
    const prodData = await prodRes.json();
    const updatedProd = prodData.products.find((p: any) => p._id === targetProductId);
    expect(updatedProd.stock).toBe(initialStock - 2);

    console.log(`   ✅ Order placed: ${testOrderNumber} (Total: ₹498)`);
    console.log(`   ✅ Stock atomically deducted: ${initialStock} -> ${updatedProd.stock}`);
  });

  // 9. Order Tracking (Public masked vs Authenticated)
  it('9. Order Tracking: Public Masked vs Authenticated (/api/orders?orderNumber=...)', async () => {
    // Public unauthenticated tracking
    const publicRes = await fetch(`${BASE_URL}/api/orders?orderNumber=${testOrderNumber}`);
    expect(publicRes.status).toBe(200);
    const publicData = await publicRes.json();
    expect(publicData.success).toBe(true);
    expect(publicData.order.shippingAddress.pincode).toBe('***001');
    expect(publicData.order.shippingAddress.street).toBeUndefined(); // Masked!

    // Authenticated owner tracking
    const authRes = await fetch(`${BASE_URL}/api/orders?orderNumber=${testOrderNumber}`, {
      headers: { Cookie: customerCookie },
    });
    expect(authRes.status).toBe(200);
    const authData = await authRes.json();
    expect(authData.success).toBe(true);
    expect(authData.order.shippingAddress.street).toBe('42 Herbal Blossom Road'); // Full details visible!
    console.log(`   ✅ Privacy verified: Unauthenticated tracking masked to pincode: ${publicData.order.shippingAddress.pincode}`);
  });

  // 10. Admin Authentication
  it('10. Admin Login (/api/admin/login)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'Contact.primebrew@gmail.com',
        password: 'Admin@PrimeBrew2026',
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user.role).toBe('admin');

    const setCookie = (res.headers as any).getSetCookie?.() || [res.headers.get('set-cookie')];
    adminCookie = (setCookie[0] || '').split(';')[0];
    console.log(`   ✅ Admin authenticated: ${data.user.name}`);
  });

  // 11. Admin Live Monitor & Analytics
  it('11. Admin Real-Time Metrics & Live Sessions (/api/admin/live)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/live`, {
      headers: { Cookie: adminCookie },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.kpis).toBeDefined();
    expect(data.kpis.totalRevenue).toBeGreaterThan(0);
    console.log(`   ✅ Live Metrics: Revenue ₹${data.kpis.totalRevenue}, Orders in delivery: ${data.kpis.ordersInDelivery}`);
  });

  // 12. Admin Order Status Update
  it('12. Admin Order Management (/api/orders/[orderId])', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        orderStatus: 'CONFIRMED',
        trackingNumber: 'SR-SMOKE99999',
        courierName: 'Shiprocket Bluedart Air',
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.order.status).toBe('CONFIRMED');
    expect(data.order.trackingNumber).toBe('SR-SMOKE99999');
    console.log(`   ✅ Admin updated order ${testOrderNumber} to CONFIRMED (Tracking: SR-SMOKE99999)`);
  });

  // 13. Customer Support Inquiry & Admin Reply
  it('13. Contact Inquiry & Admin Reply (/api/contact)', async () => {
    const contactRes = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Smoke Test User',
        email: customerEmail,
        phone: '9888877777',
        subject: 'Inquiry on Blue Tea brewing temperature',
        message: 'Could you please advise if 85 degrees Celsius is ideal for Butterfly Pea tea bags?',
      }),
    });

    expect(contactRes.status).toBe(200);
    const contactData = await contactRes.json();
    expect(contactData.success).toBe(true);
    const queryId = contactData.query.id;

    // Admin view
    const adminQueryRes = await fetch(`${BASE_URL}/api/contact`, {
      headers: { Cookie: adminCookie },
    });
    expect(adminQueryRes.status).toBe(200);
    const adminQueryData = await adminQueryRes.json();
    expect(adminQueryData.queries.some((q: any) => q.id === queryId)).toBe(true);

    // Admin patch status
    const patchRes = await fetch(`${BASE_URL}/api/contact`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        id: queryId,
        status: 'Replied',
      }),
    });
    expect(patchRes.status).toBe(200);
    console.log(`   ✅ Support workflow verified: customer submitted -> admin reviewed & status updated`);
  });

  // 14. Customer Order Cancellation & Atomic Stock Restoration
  it('14. Customer Cancels Order with Atomic Stock Restoration (/api/orders/cancel)', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        orderNumber: testOrderNumber,
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    // Verify stock was restored in database
    const prodRes = await fetch(`${BASE_URL}/api/products`);
    const prodData = await prodRes.json();
    const restoredProd = prodData.products.find((p: any) => p._id === targetProductId);
    expect(restoredProd.stock).toBe(initialStock);

    console.log(`   ✅ Order ${testOrderNumber} cancelled successfully`);
    console.log(`   ✅ Stock automatically restored: ${initialStock - 2} -> ${restoredProd.stock}`);
  });
});
