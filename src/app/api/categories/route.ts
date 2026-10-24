import { NextResponse } from 'next/server';
import { inMemoryStore, connectToDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDatabase();
  return NextResponse.json({
    success: true,
    categories: inMemoryStore.categories,
  });
}
