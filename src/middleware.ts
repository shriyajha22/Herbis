import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function parseJwtRole(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded?.role || null;
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract session tokens
  const adminToken = request.cookies.get('pbh_admin_token')?.value || request.cookies.get('pbh_token')?.value;
  const userRole = adminToken ? parseJwtRole(adminToken) : null;

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
