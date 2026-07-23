import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth } from '@/lib/api';

/** GET /api/contributions/stats - thống kê theo mục đích và theo năm */
export const GET = handleApi(async () => {
  await requireAuth();

  const byPurpose = await prisma.$queryRaw<{ purpose: string; total: bigint; count: number }[]>`
    SELECT purpose, SUM(amount)::bigint AS total, COUNT(*)::int AS count
    FROM contributions GROUP BY purpose ORDER BY total DESC
  `;
  const byYear = await prisma.$queryRaw<{ year: number; total: bigint }[]>`
    SELECT EXTRACT(YEAR FROM contributed_at)::int AS year, SUM(amount)::bigint AS total
    FROM contributions GROUP BY year ORDER BY year DESC
  `;

  // bigint -> string để JSON.stringify không lỗi
  return NextResponse.json({
    byPurpose: (byPurpose as { purpose: string; total: bigint; count: number }[]).map((r) => ({ ...r, total: r.total.toString() })),
    byYear: (byYear as { year: number; total: bigint }[]).map((r) => ({ ...r, total: r.total.toString() })),
  });
});
