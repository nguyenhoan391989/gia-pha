import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth } from '@/lib/api';

/** GET /api/media/albums - danh sách album kèm số lượng */
export const GET = handleApi(async () => {
  await requireAuth();
  const rows = await prisma.media.groupBy({
    by: ['album'],
    where: { album: { not: null } },
    _count: { _all: true },
    orderBy: { album: 'asc' },
  });
  return NextResponse.json({
    items: (rows as { album: string | null; _count: { _all: number } }[]).map((r) => ({ album: r.album, count: r._count._all })),
  });
});
