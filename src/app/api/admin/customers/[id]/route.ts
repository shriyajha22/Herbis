import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const auth = verifyAdminToken(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    const params = await context.params;
    const customerId = params?.id?.trim();

    if (!customerId) {
      return NextResponse.json(
        { success: false, message: 'Valid customer ID is required.' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: customerId },
          { email: { equals: customerId, mode: 'insensitive' } },
        ],
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'Customer account not found.' },
        { status: 404 }
      );
    }

    if (
      targetUser.role === Role.ADMIN ||
      targetUser.email.toLowerCase() === 'contact.primebrew@gmail.com'
    ) {
      return NextResponse.json(
        { success: false, message: 'Security restriction: Administrator accounts cannot be deleted.' },
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: { id: targetUser.id },
    });

    await prisma.activeSession.deleteMany({
      where: { email: targetUser.email.toLowerCase() },
    });

    await logAdminAction(auth.admin?.email || 'admin', 'DELETE', 'CUSTOMER', targetUser.id, {
      name: targetUser.name,
      email: targetUser.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully.',
      deletedCustomer: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
      },
    });
  } catch (error) {
    console.error('Error deleting customer account:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
