import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

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
  const adminToken = request.cookies.get('pbh_admin_token')?.value || request.cookies.get('pbh_token')?.value;
  const userRole = adminToken ? await verifyJwtRole(adminToken) : null;

  // 1. STRICT ADMIN ROLE ENFORCEMENT:
  // An authenticated admin (role === 'admin') is strictly restricted to /admin routes.
  // If an admin attempts to access any customer route (or /admin/login), redirect back to /admin immediately.
  if (userRole === 'admin') {
    if (pathname === '/admin/login' || (!pathname.startsWith('/admin') && !pathname.startsWith('/api/'))) {
      const adminDashboardUrl = new URL('/admin', request.url);
      return NextResponse.redirect(adminDashboardUrl);
    }
    return NextResponse.next();
  }

  // 2. STRICT NON-ADMIN PROTECTION FOR ADMIN ROUTES:
  // If a non-admin (customer or guest) attempts to access /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. PROTECT /api/admin API ENDPOINTS
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
    return NextResponse.json(
      { success: false, message: 'Access Denied: Admin privileges required.' },
      { status: 403 }
    );
  }

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
