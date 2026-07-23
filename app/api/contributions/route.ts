import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, auditLog } from '@/lib/api';
import { contributionSchema } from '@/lib/schemas';
import { contributionToApi } from '@/lib/serialize';

/** GET /api/contributions - danh sách công đức */
export const GET = handleApi(async (req: NextRequest) => {
  await requireAuth();
  const purpose = req.nextUrl.searchParams.get('purpose');

  const rows = await prisma.contribution.findMany({
    where: purpose ? { purpose: { contains: purpose, mode: 'insensitive' } } : {},
    include: { member: { select: { fullName: true } } },
    orderBy: { contributedAt: 'desc' },
  });
  return NextResponse.json({ items: rows.map(contributionToApi) });
});

/** POST /api/contributions (editor trở lên) */
export const POST = handleApi(async (req: NextRequest) => {
  const user = await requireAuth('editor');
  const body = contributionSchema.parse(await req.json());

  const row = await prisma.contribution.create({
    data: {
      memberId: body.member_id ?? null,
      contributorName: body.contributor_name,
      amount: body.amount,
      currency: body.currency,
      purpose: body.purpose,
      note: body.note ?? null,
      contributedAt: body.contributed_at ? new Date(body.contributed_at) : new Date(),
      createdBy: user.id,
    },
  });
  await auditLog(user.id, 'create', 'contributions', row.id, body);
  return NextResponse.json(contributionToApi(row), { status: 201 });
});
