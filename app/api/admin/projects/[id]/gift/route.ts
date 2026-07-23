import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, ApiError, auditLog } from '@/lib/api';
import { giftLifetime } from '@/lib/subscription/service';

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/admin/projects/:id/gift — Admin tặng GIFT_LIFETIME (không thanh toán) */
export const POST = handleApi(async (req: NextRequest, { params }: Ctx) => {
  const admin = await requireAuth('admin');
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new ApiError(404, 'Không tìm thấy gia phả');

  const body = await req.json().catch(() => ({}));
  const sub = await giftLifetime(id, body?.note || `Admin ${admin.id} cấp trọn đời`);
  await auditLog(admin.id, 'update', 'subscriptions', sub.id, { action: 'gift_lifetime', projectId: id });
  return NextResponse.json({ ok: true, subscription: sub });
});
