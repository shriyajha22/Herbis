import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';
import { sendContactReplyEmail } from '@/lib/mailer';
import { logAdminAction } from '@/lib/audit';

export async function POST(request: Request) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse || NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { queryId, customerEmail, customerName, subject, replyMessage } = await request.json();

    if (!customerEmail || !replyMessage) {
      return NextResponse.json(
        { success: false, message: 'Customer email and reply message are required.' },
        { status: 400 }
      );
    }

    await sendContactReplyEmail(
      customerEmail,
      customerName,
      subject || 'Customer Support',
      replyMessage
    );

    if (queryId) {
      await prisma.contactQuery.update({
        where: { id: queryId },
        data: {
          status: 'Replied',
          replyMessage,
          repliedAt: new Date(),
        },
      });
    }

    await logAdminAction(auth.admin?.email || 'admin', 'REPLY', 'CONTACT_QUERY', queryId, {
      customerEmail,
      subject,
    });

    const queries = await prisma.contactQuery.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      message: `Reply recorded and sent to ${customerEmail}.`,
      queries,
    });
  } catch (error) {
    console.error('Error dispatching contact reply:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while dispatching email reply' },
      { status: 500 }
    );
  }
}
