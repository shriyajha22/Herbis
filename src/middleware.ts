import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose/jwt/verify';

async function verifyJwtRole(token: string): Promise<string | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return (payload?.role as string) || null;
  } catch (e) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract session tokens
  const adminToken = request.cookies.get('pbh_admin_token')?.value;
  const customerToken = request.cookies.get('pbh_token')?.value;

  const adminRole = adminToken ? await verifyJwtRole(adminToken) : null;
  const customerRole = customerToken ? await verifyJwtRole(customerToken) : null;
  const isAdmin = adminRole === 'admin' || customerRole === 'admin';

  // 1. ADMIN ROUTE PROTECTION
  if (pathname.startsWith('/admin')) {
    // If accessing /admin/login while already authenticated as admin, go to /admin/dashboard
    if (pathname === '/admin/login') {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // All other /admin routes require admin authentication
    if (!isAdmin) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Allow authenticated admin
    return NextResponse.next();
  }

  // 2. PROTECT /api/admin API ENDPOINTS
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Access Denied: Admin privileges required.' },
        { status: 403 }
      );
    }
  }

  // 3. STOREFRONT & PUBLIC PAGES:
  // Allow all users (guests, customers, and admins) to freely browse the storefront!
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets, internal Next.js files, and public images
     */
    '/((?!_next/static|_next/image|favicon.ico|site.webmanifest|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
