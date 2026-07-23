import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, ApiError, auditLog } from '@/lib/api';
import { recordSchema } from '@/lib/schemas';
import { recordToApi } from '@/lib/serialize';
import { sanitizeHtml } from '@/lib/sanitize';

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/records/:id */
export const GET = handleApi(async (_req: NextRequest, { params }: Ctx) => {
  await requireAuth();
  const { id } = await params;
  const row = await prisma.familyRecord.findUnique({ where: { id } });
  if (!row) throw new ApiError(404, 'Không tìm thấy tài liệu');
  return NextResponse.json(recordToApi(row));
});

/** PUT /api/records/:id */
export const PUT = handleApi(async (req: NextRequest, { params }: Ctx) => {
  const user = await requireAuth('editor');
  const { id } = await params;
  const body = recordSchema.partial().parse(await req.json());

  const existed = await prisma.familyRecord.findUnique({ where: { id } });
  if (!existed) throw new ApiError(404, 'Không tìm thấy tài liệu');

  const row = await prisma.familyRecord.update({
    where: { id },
    data: {
      recordType: body.record_type ?? existed.recordType,
      title: body.title ?? existed.title,
      content: body.content !== undefined ? sanitizeHtml(body.content) : existed.content,
      attachments: body.attachments ?? (existed.attachments as object[]),
      updatedBy: user.id,
    },
  });
  await auditLog(user.id, 'update', 'family_records', id, { title: body.title });
  return NextResponse.json(recordToApi(row));
});

/** DELETE /api/records/:id - chỉ admin */
export const DELETE = handleApi(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireAuth('admin');
  const { id } = await params;

  const existed = await prisma.familyRecord.findUnique({
    where: { id }, select: { id: true, title: true },
  });
  if (!existed) throw new ApiError(404, 'Không tìm thấy tài liệu');

  await prisma.familyRecord.delete({ where: { id } });
  await auditLog(user.id, 'delete', 'family_records', id, existed);
  return NextResponse.json({ message: 'Đã xóa tài liệu' });
});
