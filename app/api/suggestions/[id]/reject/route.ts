import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, ApiError, auditLog } from '@/lib/api';

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/suggestions/:id/reject - từ chối đề xuất (admin) */
export const POST = handleApi(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireAuth('admin');
  const { id } = await params;

  const result = await prisma.editSuggestion.updateMany({
    where: { id, status: 'pending' },
    data: { status: 'rejected', reviewedBy: user.id, reviewedAt: new Date() },
  });
  if (result.count === 0) throw new ApiError(404, 'Không tìm thấy đề xuất đang chờ');

  await auditLog(user.id, 'reject', 'edit_suggestions', id);
  return NextResponse.json({ id, status: 'rejected' });
});
