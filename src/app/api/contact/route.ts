import { NextResponse } from 'next/server';
import { inMemoryStore } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

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
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch contact queries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const newQuery = {
      id: `q-${Date.now()}`,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : '',
      subject: subject ? String(subject).trim() : 'General Customer Query',
      message: String(message).trim(),
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
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to send message' },
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
    return NextResponse.json(
      { success: false, message: 'Failed to update query status' },
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
    return NextResponse.json(
      { success: false, message: 'Failed to delete query' },
      { status: 500 }
    );
  }
}
