import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth } from '@/lib/api';
import { nextDeathAnniversary } from '@/lib/lunar';

/** GET /api/members/anniversaries?days=60 - danh sách ngày giỗ sắp tới */
export const GET = handleApi(async (req: NextRequest) => {
  const user = await requireAuth();
  const days = Math.min(parseInt(req.nextUrl.searchParams.get('days') || '60', 10) || 60, 366);

  const rows = await prisma.member.findMany({
    where: {
      deathDateLunar: { not: null },
      isAlive: false,
      ...(user.role === 'viewer' ? { isPrivate: false } : {}),
    },
    select: { id: true, fullName: true, deathDateLunar: true, avatarUrl: true },
  });

  const today = new Date();
  const horizon = new Date(today.getTime() + days * 86400000);
  const items = (rows as { id: string; fullName: string; deathDateLunar: string | null; avatarUrl: string | null }[])
    .map((r) => {
      const next = nextDeathAnniversary(r.deathDateLunar!, today);
      if (!next) return null;
      const [dd, mm, yy] = next.solar;
      const d = new Date(yy, mm - 1, dd);
      if (d > horizon) return null;
      return {
        member_id: r.id,
        full_name: r.fullName,
        avatar_url: r.avatarUrl,
        lunar_date: r.deathDateLunar,
        solar_date: `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`,
        days_left: Math.round((d.getTime() - today.getTime()) / 86400000),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.days_left - b.days_left);

  return NextResponse.json({ items });
});
