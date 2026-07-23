import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth } from '@/lib/api';

/** GET /api/meta/generations */
export const GET = handleApi(async () => {
  await requireAuth();
  const rows = await prisma.generation.findMany({ orderBy: { number: 'asc' } });
  return NextResponse.json({ items: rows });
});
