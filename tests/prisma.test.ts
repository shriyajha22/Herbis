import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { logAdminAction } from '../src/lib/audit';

describe('Phase 2 PostgreSQL & Prisma Integration Tests', () => {
  it('connects to PostgreSQL database and executes raw query', async () => {
    const result = await prisma.$queryRaw<Array<{ result: number }>>`SELECT 1 as result`;
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].result).toBe(1);
  });

  it('queries seeded products with relational consistency', async () => {
    const products = await prisma.product.findMany({
      take: 5,
    });
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty('id');
    expect(products[0]).toHaveProperty('slug');
    expect(products[0]).toHaveProperty('price');
    expect(products[0].stock).toBeGreaterThanOrEqual(0);
  });

  it('queries seeded categories and verifies catalog relations', async () => {
    const categories = await prisma.category.findMany();
    expect(categories.length).toBeGreaterThanOrEqual(3);
    const blueTeaCat = categories.find((c) => c.slug === 'blue-tea');
    expect(blueTeaCat).toBeDefined();
    expect(blueTeaCat?.name).toBe('Blue Tea');
  });

  it('finds seeded admin and customer users', async () => {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    expect(admin).toBeDefined();
    expect(admin?.role).toBe('ADMIN');
    expect(admin?.passwordHash).toBeDefined();

    const customer = await prisma.user.findFirst({
      where: { email: 'customer@primebrew.local' },
      include: { addresses: true },
    });
    expect(customer).toBeDefined();
    expect(customer?.role).toBe('CUSTOMER');
    expect(customer?.addresses.length).toBeGreaterThan(0);
  });

  it('executes atomic stock deduction and order rollback via Prisma transaction', async () => {
    // 1. Find a test product
    const product = await prisma.product.findFirst();
    expect(product).toBeDefined();
    const initialStock = product!.stock;

    const testOrderNumber = `TEST-PBH-${Date.now()}`;

    // 2. Perform atomic transaction: decrement stock & create test order
    const createdOrder = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: product!.id },
        data: { stock: { decrement: 1 } },
      });

      return await tx.order.create({
        data: {
          orderNumber: testOrderNumber,
          status: 'PROCESSING',
          subtotal: product!.price,
          total: product!.price,
          shippingAddress: {
            fullName: 'Test User',
            email: 'test@primebrew.local',
            phone: '9999999999',
            street: '123 Test St',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560001',
          },
          items: {
            create: {
              productId: product!.id,
              productName: product!.name,
              price: product!.price,
              quantity: 1,
            },
          },
        },
      });
    });

    // Verify stock decremented
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product!.id },
    });
    expect(updatedProduct?.stock).toBe(initialStock - 1);

    // 3. Clean up test order and restore stock
    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({
        where: { orderId: createdOrder.id },
      });
      await tx.order.delete({
        where: { id: createdOrder.id },
      });
      await tx.product.update({
        where: { id: product!.id },
        data: { stock: initialStock },
      });
    });

    const restoredProduct = await prisma.product.findUnique({
      where: { id: product!.id },
    });
    expect(restoredProduct?.stock).toBe(initialStock);
  });

  it('records audit log entries accurately', async () => {
    const entry = await logAdminAction(
      'admin@primebrew.local',
      'TEST_ACTION',
      'TEST_TARGET',
      'id-123',
      { key: 'testValue' }
    );
    expect(entry).toBeDefined();
    expect(entry?.adminEmail).toBe('admin@primebrew.local');
    expect(entry?.action).toBe('TEST_ACTION');

    if (entry) {
      await prisma.auditLog.delete({ where: { id: entry.id } });
    }
  });
});
