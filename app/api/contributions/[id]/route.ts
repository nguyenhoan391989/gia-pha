import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, ApiError, auditLog } from '@/lib/api';
import { contributionSchema } from '@/lib/schemas';
import { contributionToApi } from '@/lib/serialize';

type Ctx = { params: Promise<{ id: string }> };

/** PUT /api/contributions/:id */
export const PUT = handleApi(async (req: NextRequest, { params }: Ctx) => {
  const user = await requireAuth('editor');
  const { id } = await params;
  const body = contributionSchema.partial().parse(await req.json());

  const existed = await prisma.contribution.findUnique({ where: { id } });
  if (!existed) throw new ApiError(404, 'Không tìm thấy khoản công đức');

  const row = await prisma.contribution.update({
    where: { id },
    data: {
      memberId: body.member_id !== undefined ? body.member_id : existed.memberId,
      contributorName: body.contributor_name ?? existed.contributorName,
      amount: body.amount ?? existed.amount,
      purpose: body.purpose ?? existed.purpose,
      note: body.note !== undefined ? body.note : existed.note,
      contributedAt: body.contributed_at ? new Date(body.contributed_at) : existed.contributedAt,
    },
  });
  await auditLog(user.id, 'update', 'contributions', id, body);
  return NextResponse.json(contributionToApi(row));
});

/** DELETE /api/contributions/:id - chỉ admin */
export const DELETE = handleApi(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireAuth('admin');
  const { id } = await params;

  const existed = await prisma.contribution.findUnique({ where: { id } });
  if (!existed) throw new ApiError(404, 'Không tìm thấy khoản công đức');

  await prisma.contribution.delete({ where: { id } });
  await auditLog(user.id, 'delete', 'contributions', id, contributionToApi(existed));
  return NextResponse.json({ message: 'Đã xóa' });
});
