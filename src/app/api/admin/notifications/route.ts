import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = verifyAdminToken(request);
    if (!auth.isAuthorized) {
      return auth.errorResponse!;
    }

    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admin notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = verifyAdminToken(request);
    if (!auth.isAuthorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true },
      });
    } else if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
    }

    const updatedNotifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unreadCount = updatedNotifications.filter((n) => !n.read).length;

    return NextResponse.json({
      success: true,
      message: 'Notifications updated successfully',
      unreadCount,
      notifications: updatedNotifications,
    });
  } catch (error: any) {
    console.error('Patch notifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
