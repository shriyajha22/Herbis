import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    const formatted = categories.map((c) => ({
      ...c,
      _id: c.id,
    }));

    return NextResponse.json({
      success: true,
      categories: formatted,
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve categories' },
      { status: 500 }
    );
  }
}
