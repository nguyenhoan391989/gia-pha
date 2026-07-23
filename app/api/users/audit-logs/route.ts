import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth } from '@/lib/api';

/** GET /api/users/audit-logs - nhật ký chỉnh sửa (admin) */
export const GET = handleApi(async (req: NextRequest) => {
  await requireAuth('admin');
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '100', 10) || 100, 500);

  const rows = await prisma.auditLog.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  type AuditRow = {
    id: bigint; userId: string | null; user: { email: string } | null;
    action: string; entity: string; entityId: string | null; changes: unknown; createdAt: Date;
  };
  return NextResponse.json({
    items: (rows as AuditRow[]).map((r) => ({
      id: r.id.toString(),
      user_id: r.userId,
      user_email: r.user?.email ?? null,
      action: r.action,
      entity: r.entity,
      entity_id: r.entityId,
      changes: r.changes,
      created_at: r.createdAt,
    })),
  });
});
