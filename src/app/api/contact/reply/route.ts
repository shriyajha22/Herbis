import { NextResponse } from 'next/server';
import { inMemoryStore } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { sendContactReplyEmail } from '@/lib/mailer';

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

    // Update query status to Replied
    if (queryId) {
      const query = inMemoryStore.contactQueries.find((q) => q.id === queryId);
      if (query) {
        query.status = 'Replied';
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reply recorded and sent to ${customerEmail}.`,
      queries: inMemoryStore.contactQueries,
    });
  } catch (error: any) {
    console.error('Error dispatching contact reply:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while dispatching email reply' },
      { status: 500 }
    );
  }
}
