import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, ApiError, auditLog } from '@/lib/api';
import { relationshipToApi } from '@/lib/serialize';

type Ctx = { params: Promise<{ id: string }> };

/** PUT /api/relationships/:id - sửa loại quan hệ / ghi chú */
export const PUT = handleApi(async (req: NextRequest, { params }: Ctx) => {
  const user = await requireAuth('editor');
  const { id } = await params;
  const body = z.object({
    relationship_type: z.enum(['father', 'mother', 'spouse', 'child', 'sibling']).optional(),
    note: z.string().max(255).nullish(),
  }).parse(await req.json());

  const existed = await prisma.relationship.findUnique({ where: { id } });
  if (!existed) throw new ApiError(404, 'Không tìm thấy quan hệ');

  const row = await prisma.relationship.update({
    where: { id },
    data: {
      relationshipType: body.relationship_type ?? existed.relationshipType,
      note: body.note !== undefined ? body.note : existed.note,
    },
  });
  await auditLog(user.id, 'update', 'relationships', id, body);
  return NextResponse.json(relationshipToApi(row));
});

/** DELETE /api/relationships/:id */
export const DELETE = handleApi(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireAuth('editor');
  const { id } = await params;

  const existed = await prisma.relationship.findUnique({ where: { id } });
  if (!existed) throw new ApiError(404, 'Không tìm thấy quan hệ');

  await prisma.relationship.delete({ where: { id } });
  await auditLog(user.id, 'delete', 'relationships', id, relationshipToApi(existed));
  return NextResponse.json({ message: 'Đã xóa quan hệ' });
});
