import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, ApiError, auditLog } from '@/lib/api';
import { activateTrial } from '@/lib/subscription/service';

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/projects/:id/trial — kích hoạt dùng thử 30 ngày (CHỈ 1 lần/gia phả) */
export const POST = handleApi(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireAuth();
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new ApiError(404, 'Không tìm thấy gia phả');
  if (project.ownerId !== user.id) throw new ApiError(403, 'Không có quyền');

  try {
    const sub = await activateTrial(id);
    await auditLog(user.id, 'update', 'subscriptions', sub.id, { action: 'activate_trial' });
    return NextResponse.json({ ok: true, subscription: sub });
  } catch (e) {
    throw new ApiError(409, (e as Error).message);
  }
});
