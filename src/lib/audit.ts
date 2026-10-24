import { prisma } from './prisma';
import type { Prisma } from '@prisma/client';

export async function logAdminAction(
  adminEmail: string,
  action: string,
  targetType: string,
  targetId?: string,
  changes?: Prisma.InputJsonValue
) {
  try {
    return await prisma.auditLog.create({
      data: {
        adminEmail,
        action,
        targetType,
        targetId: targetId || null,
        changes: changes ?? undefined,
      },
    });
  } catch (error) {
    console.error('Failed to write admin audit log:', error);
    return null;
  }
}
