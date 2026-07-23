import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth } from '@/lib/api';

/** GET /api/meta/stats - báo cáo thống kê dòng họ */
export const GET = handleApi(async () => {
  await requireAuth();

  const byGeneration = await prisma.$queryRaw<{ generation: number; count: number }[]>`
    SELECT generation, COUNT(*)::int AS count FROM members
    WHERE generation IS NOT NULL GROUP BY generation ORDER BY generation
  `;
  const byGender = await prisma.$queryRaw<{ gender: string; count: number }[]>`
    SELECT gender, COUNT(*)::int AS count FROM members GROUP BY gender
  `;
  const byPlace = await prisma.$queryRaw<{ place: string; count: number }[]>`
    SELECT birth_place AS place, COUNT(*)::int AS count FROM members
    WHERE birth_place IS NOT NULL GROUP BY birth_place ORDER BY count DESC LIMIT 20
  `;
  const [totals] = await prisma.$queryRaw<{ total: number; alive: number; deceased: number }[]>`
    SELECT COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE is_alive)::int AS alive,
           COUNT(*) FILTER (WHERE NOT is_alive)::int AS deceased
    FROM members
  `;

  return NextResponse.json({ totals, byGeneration, byGender, byPlace });
});
