import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, currentPage, action } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email required for activity tracking' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    if (action === 'logout') {
      await prisma.activeSession.updateMany({
        where: { email: cleanEmail },
        data: { isOnline: false },
      });
      return NextResponse.json({ success: true, message: 'User set offline' });
    }

    await prisma.activeSession.upsert({
      where: { email: cleanEmail },
      update: {
        name: name || cleanEmail.split('@')[0],
        currentPage: currentPage || '/',
        lastActive: new Date(),
        isOnline: true,
      },
      create: {
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        currentPage: currentPage || '/',
        isOnline: true,
      },
    });

    const activeCount = await prisma.activeSession.count({
      where: {
        isOnline: true,
        lastActive: { gte: new Date(Date.now() - 60000) },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Activity recorded',
      sessionCount: activeCount,
    });
  } catch (error) {
    console.error('Error recording user activity:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to record user activity' },
      { status: 500 }
    );
  }
}
