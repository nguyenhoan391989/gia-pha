import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth } from '@/lib/api';
import { mediaToApi } from '@/lib/serialize';

/** GET /api/media - danh sách theo album/thành viên/loại */
export const GET = handleApi(async (req: NextRequest) => {
  await requireAuth();
  const sp = req.nextUrl.searchParams;

  const rows = await prisma.media.findMany({
    where: {
      ...(sp.get('member_id') ? { memberId: sp.get('member_id')! } : {}),
      ...(sp.get('album') ? { album: sp.get('album')! } : {}),
      ...(sp.get('type') ? { mediaType: sp.get('type')! } : {}),
    },
    include: { member: { select: { fullName: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ items: rows.map(mediaToApi) });
});
