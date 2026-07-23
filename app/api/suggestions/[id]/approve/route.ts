import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, ApiError, auditLog } from '@/lib/api';
import { memberSchema, memberPayloadToPrisma } from '@/lib/schemas';

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/suggestions/:id/approve - duyệt và áp dụng đề xuất (member) */
export const POST = handleApi(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireAuth('admin');
  const { id } = await params;

  const sug = await prisma.editSuggestion.findUnique({ where: { id } });
  if (!sug) throw new ApiError(404, 'Không tìm thấy đề xuất');
  if (sug.status !== 'pending') throw new ApiError(400, 'Đề xuất đã được xử lý');

  // Áp dụng đề xuất cập nhật thành viên (chỉ các trường được phép)
  if (sug.entity === 'member' && sug.entityId) {
    const payload = memberSchema.partial().parse(sug.payload ?? {});
    const data = memberPayloadToPrisma(payload, user.id);
    if (Object.keys(data).length > 1) {
      await prisma.member.update({ where: { id: sug.entityId }, data });
    }
  }

  const row = await prisma.editSuggestion.update({
    where: { id },
    data: { status: 'approved', reviewedBy: user.id, reviewedAt: new Date() },
  });
  await auditLog(user.id, 'approve', 'edit_suggestions', id);
  return NextResponse.json({ id: row.id, status: row.status });
});
