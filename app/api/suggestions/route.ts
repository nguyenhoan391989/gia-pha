import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, auditLog } from '@/lib/api';

/** POST /api/suggestions - mọi người dùng được gửi đề xuất chỉnh sửa */
export const POST = handleApi(async (req: NextRequest) => {
  const user = await requireAuth();
  const body = z.object({
    entity: z.enum(['member', 'record']),
    entity_id: z.string().uuid().nullish(),
    payload: z.record(z.unknown()),
  }).parse(await req.json());

  const row = await prisma.editSuggestion.create({
    data: {
      userId: user.id,
      entity: body.entity,
      entityId: body.entity_id ?? null,
      payload: JSON.parse(JSON.stringify(body.payload)),
    },
  });
  await auditLog(user.id, 'create', 'edit_suggestions', row.id, body);
  return NextResponse.json(
    { id: row.id, entity: row.entity, entity_id: row.entityId, status: row.status },
    { status: 201 }
  );
});

/** GET /api/suggestions?status=pending - admin xem danh sách chờ duyệt */
export const GET = handleApi(async (req: NextRequest) => {
  await requireAuth('admin');
  const status = req.nextUrl.searchParams.get('status') || 'pending';

  const rows = await prisma.editSuggestion.findMany({
    where: { status },
    include: { user: { select: { email: true, fullName: true } } },
    orderBy: { createdAt: 'asc' },
  });
  type SuggestionRow = {
    id: string; entity: string; entityId: string | null; payload: unknown; status: string;
    user: { email: string; fullName: string }; createdAt: Date;
  };
  return NextResponse.json({
    items: (rows as SuggestionRow[]).map((r) => ({
      id: r.id,
      entity: r.entity,
      entity_id: r.entityId,
      payload: r.payload,
      status: r.status,
      user_email: r.user.email,
      user_name: r.user.fullName,
      created_at: r.createdAt,
    })),
  });
});
