import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { NotificationModel } from '@/models/Notification';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = verifyAdminToken(request);
    if (!auth.isAuthorized) {
      return auth.errorResponse!;
    }

    await connectToDatabase();

    let notifications: any[] = [];
    try {
      notifications = await NotificationModel.find({}).sort({ createdAt: -1 }).limit(50).lean();
    } catch (err) {}

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch admin notifications' },
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

    await connectToDatabase();
    const body = await request.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await NotificationModel.updateMany({ read: false }, { $set: { read: true } });
    } else if (notificationId) {
      await NotificationModel.findByIdAndUpdate(notificationId, { $set: { read: true } });
    }

    const updatedNotifications = await NotificationModel.find({}).sort({ createdAt: -1 }).limit(50).lean();
    const unreadCount = updatedNotifications.filter((n) => !n.read).length;

    return NextResponse.json({
      success: true,
      message: 'Notifications updated successfully',
      unreadCount,
      notifications: updatedNotifications,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update notification status' },
      { status: 500 }
    );
  }
}
