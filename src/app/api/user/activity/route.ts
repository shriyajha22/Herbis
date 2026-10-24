import { NextResponse } from 'next/server';
import { inMemoryStore, connectToDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  await connectToDatabase();
  try {
    const body = await request.json();
    const { email, name, currentPage, action } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email required for activity tracking' },
        { status: 400 }
      );
    }

    if (action === 'logout') {
      inMemoryStore.setUserOffline(email);
      return NextResponse.json({ success: true, message: 'User set offline' });
    }

    inMemoryStore.recordUserActivity(name, email, currentPage || '/');

    return NextResponse.json({
      success: true,
      message: 'Activity recorded',
      sessionCount: inMemoryStore.getActiveSessions().filter((s) => s.isOnline).length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to record user activity' },
      { status: 500 }
    );
  }
}
