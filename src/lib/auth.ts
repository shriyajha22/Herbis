import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pbh_super_secret_jwt_key_2026_primebrew';

export interface AdminAuthResult {
  isAuthorized: boolean;
  admin?: {
    userId: string;
    email: string;
    role: string;
    name: string;
  };
  errorResponse?: NextResponse;
}

export function verifyAdminToken(request: Request): AdminAuthResult {
  try {
    // 1. Extract token from cookie or Authorization header
    let token = request.headers.get('cookie')
      ?.split(';')
      .find((c) => c.trim().startsWith('pbh_admin_token='))
      ?.split('=')[1];

    if (!token) {
      token = request.headers.get('cookie')
        ?.split(';')
        .find((c) => c.trim().startsWith('pbh_token='))
        ?.split('=')[1];
    }

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return {
        isAuthorized: false,
        errorResponse: NextResponse.json(
          { success: false, message: 'Access Denied: Unauthenticated. Admin session token required.' },
          { status: 401 }
        ),
      };
    }

    // 2. Verify JWT signature & payload
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
      name: string;
    };

    if (!decoded || decoded.role !== 'admin') {
      return {
        isAuthorized: false,
        errorResponse: NextResponse.json(
          { success: false, message: 'Access Denied: Forbidden. Admin privileges required.' },
          { status: 403 }
        ),
      };
    }

    return {
      isAuthorized: true,
      admin: decoded,
    };
  } catch (error) {
    return {
      isAuthorized: false,
      errorResponse: NextResponse.json(
        { success: false, message: 'Access Denied: Invalid or expired admin session token.' },
        { status: 401 }
      ),
    };
  }
}

export interface CustomerAuthResult {
  isAuthorized: boolean;
  user?: {
    userId: string;
    email: string;
    role: string;
    name: string;
  };
  errorResponse?: NextResponse;
}

export function verifyCustomerToken(request: Request): CustomerAuthResult {
  try {
    let token = request.headers.get('cookie')
      ?.split(';')
      .find((c) => c.trim().startsWith('pbh_token='))
      ?.split('=')[1];

    if (!token) {
      token = request.headers.get('cookie')
        ?.split(';')
        .find((c) => c.trim().startsWith('pbh_admin_token='))
        ?.split('=')[1];
    }

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return {
        isAuthorized: false,
        errorResponse: NextResponse.json(
          { success: false, message: 'Please login or create an account to place your order.' },
          { status: 401 }
        ),
      };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
      name: string;
    };

    if (!decoded || !decoded.email) {
      return {
        isAuthorized: false,
        errorResponse: NextResponse.json(
          { success: false, message: 'Please login or create an account to place your order.' },
          { status: 401 }
        ),
      };
    }

    return {
      isAuthorized: true,
      user: decoded,
    };
  } catch (error) {
    return {
      isAuthorized: false,
      errorResponse: NextResponse.json(
        { success: false, message: 'Please login or create an account to place your order.' },
        { status: 401 }
      ),
    };
  }
}

