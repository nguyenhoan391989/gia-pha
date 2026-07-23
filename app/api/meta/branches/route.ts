import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, auditLog } from '@/lib/api';

/** GET /api/meta/branches - danh sách chi/nhánh */
export const GET = handleApi(async () => {
  await requireAuth();
  const rows = await prisma.branch.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ items: rows });
});

/** POST /api/meta/branches (editor trở lên) */
export const POST = handleApi(async (req: NextRequest) => {
  const user = await requireAuth('editor');
  const body = z.object({
    name: z.string().min(1).max(255),
    description: z.string().nullish(),
  }).parse(await req.json());

  const row = await prisma.branch.create({
    data: { name: body.name, description: body.description ?? null },
  });
  await auditLog(user.id, 'create', 'branches', row.id, body);
  return NextResponse.json(row, { status: 201 });
});
