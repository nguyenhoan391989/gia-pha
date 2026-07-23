import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth } from '@/lib/api';
import { profileToApi } from '@/lib/serialize';

/** GET /api/users - danh sách người dùng (admin) */
export const GET = handleApi(async () => {
  await requireAuth('admin');
  const rows = await prisma.profile.findMany({ orderBy: { createdAt: 'asc' } });
  return NextResponse.json({ items: rows.map(profileToApi) });
});
