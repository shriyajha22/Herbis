import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics = {
    ENV_PRESENT: Boolean(process.env.DATABASE_URL),
    URI_VALID: false,
    NETWORK_OK: false,
    DATABASE_ACCESS_OK: false,
    TABLES_OK: false,
    DATABASE_ENGINE: 'PostgreSQL',
    SAFE_ERROR_CATEGORY: 'None',
  };

  const rawUri = process.env.DATABASE_URL;

  if (!rawUri) {
    diagnostics.SAFE_ERROR_CATEGORY = 'DATABASE_URL_MISSING';
    return NextResponse.json({ success: false, diagnostics }, { status: 500 });
  }

  if (rawUri.startsWith('postgresql://') || rawUri.startsWith('postgres://')) {
    diagnostics.URI_VALID = true;
  } else {
    diagnostics.SAFE_ERROR_CATEGORY = 'INVALID_URI_SCHEME';
    return NextResponse.json({ success: false, diagnostics }, { status: 500 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    diagnostics.NETWORK_OK = true;
    diagnostics.DATABASE_ACCESS_OK = true;

    const [userCount, productCount, orderCount] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
    ]);

    diagnostics.TABLES_OK = true;

    return NextResponse.json({
      success: true,
      message: 'PostgreSQL database connected and operational via Prisma ORM',
      counts: {
        users: userCount,
        products: productCount,
        orders: orderCount,
      },
      diagnostics,
    });
  } catch (error: any) {
    console.error('Database health check failed:', error);
    diagnostics.SAFE_ERROR_CATEGORY = 'QUERY_FAILED';
    return NextResponse.json(
      { success: false, message: 'Database health check failed', diagnostics },
      { status: 500 }
    );
  }
}
