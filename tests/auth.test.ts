import { describe, it, expect, beforeAll } from 'vitest';
import jwt from 'jsonwebtoken';

const TEST_SECRET = 'test_secret_key_1234567890_primebrew_herbis_secure_key';

describe('Auth Utilities (verifyAdminToken & verifyCustomerToken)', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = TEST_SECRET;
  });

  it('verifies a valid admin session token', async () => {
    const { verifyAdminToken } = await import('@/lib/auth');

    const adminToken = jwt.sign(
      { userId: 'admin-1', email: 'Contact.primebrew@gmail.com', role: 'admin', name: 'Admin' },
      TEST_SECRET,
      { expiresIn: '1h' }
    );

    const req = new Request('http://localhost:3000/api/admin/customers', {
      headers: {
        cookie: `pbh_admin_token=${adminToken}`,
      },
    });

    const result = verifyAdminToken(req);
    expect(result.isAuthorized).toBe(true);
    expect(result.admin?.role).toBe('admin');
    expect(result.admin?.email).toBe('Contact.primebrew@gmail.com');
  });

  it('rejects an admin request when token has role: customer', async () => {
    const { verifyAdminToken } = await import('@/lib/auth');

    const customerToken = jwt.sign(
      { userId: 'cust-1', email: 'user@example.com', role: 'customer', name: 'Customer' },
      TEST_SECRET,
      { expiresIn: '1h' }
    );

    const req = new Request('http://localhost:3000/api/admin/customers', {
      headers: {
        cookie: `pbh_admin_token=${customerToken}`,
      },
    });

    const result = verifyAdminToken(req);
    expect(result.isAuthorized).toBe(false);
    expect(result.errorResponse?.status).toBe(403);
  });

  it('rejects an unauthenticated request without session cookie', async () => {
    const { verifyAdminToken } = await import('@/lib/auth');

    const req = new Request('http://localhost:3000/api/admin/customers');
    const result = verifyAdminToken(req);

    expect(result.isAuthorized).toBe(false);
    expect(result.errorResponse?.status).toBe(401);
  });

  it('verifies a valid customer token', async () => {
    const { verifyCustomerToken } = await import('@/lib/auth');

    const userToken = jwt.sign(
      { userId: 'cust-99', email: 'customer@domain.com', role: 'customer', name: 'John Doe' },
      TEST_SECRET,
      { expiresIn: '1h' }
    );

    const req = new Request('http://localhost:3000/api/orders', {
      headers: {
        cookie: `pbh_token=${userToken}`,
      },
    });

    const result = verifyCustomerToken(req);
    expect(result.isAuthorized).toBe(true);
    expect(result.user?.email).toBe('customer@domain.com');
  });
});
