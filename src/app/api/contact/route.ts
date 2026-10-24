import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    const queries = await prisma.contactQuery.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      queries,
    });
  } catch (error) {
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

    const newQuery = await prisma.contactQuery.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        subject: subject ? subject.trim() : 'General Customer Query',
        message: message.trim(),
        status: 'Unread',
      },
    });

    // Notify admin
    await prisma.notification.create({
      data: {
        title: `New Support Query: ${newQuery.name}`,
        message: `${newQuery.email}: "${newQuery.message.slice(0, 80)}..."`,
        type: 'info',
        link: '/admin/support',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Query sent successfully! Our customer support representative will get back to you soon.',
      query: newQuery,
    });
  } catch (error) {
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

    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'ID and status are required' }, { status: 400 });
    }

    await prisma.contactQuery.update({
      where: { id },
      data: { status },
    });

    const queries = await prisma.contactQuery.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      queries,
    });
  } catch (error) {
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

    if (!id) {
      return NextResponse.json({ success: false, message: 'Query ID is required' }, { status: 400 });
    }

    await prisma.contactQuery.delete({
      where: { id },
    });

    const queries = await prisma.contactQuery.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      message: 'Query deleted successfully',
      queries,
    });
  } catch (error) {
    console.error('Error deleting contact query:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while deleting query' },
      { status: 500 }
    );
  }
}
