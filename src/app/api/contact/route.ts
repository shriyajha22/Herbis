import { NextResponse } from 'next/server';
import { inMemoryStore } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { contactSchema } from '@/lib/validators';
import { checkContactRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse || NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json({
      success: true,
      queries: inMemoryStore.contactQueries,
    });
  } catch (error: any) {
    console.error('Error fetching contact queries:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while fetching contact queries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await checkContactRateLimit(ip);
  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, message: rateLimit.message },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0]?.message || 'Invalid contact form data' },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = validation.data;

    const newQuery = {
      id: `q-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      subject: subject ? subject.trim() : 'General Customer Query',
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'Unread' as const,
    };

    inMemoryStore.contactQueries.unshift(newQuery);

    return NextResponse.json({
      success: true,
      message: 'Query sent successfully! Our customer support representative will get back to you soon.',
      query: newQuery,
    });
  } catch (error: any) {
    console.error('Error handling contact submission:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while sending your message' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse || NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    const query = inMemoryStore.contactQueries.find((q) => q.id === id);
    if (query && status) {
      query.status = status;
    }

    return NextResponse.json({
      success: true,
      queries: inMemoryStore.contactQueries,
    });
  } catch (error: any) {
    console.error('Error updating contact query status:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while updating query status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse || NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      inMemoryStore.contactQueries = inMemoryStore.contactQueries.filter((q) => q.id !== id);
    }

    return NextResponse.json({
      success: true,
      queries: inMemoryStore.contactQueries,
    });
  } catch (error: any) {
    console.error('Error deleting contact query:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while deleting query' },
      { status: 500 }
    );
  }
}
