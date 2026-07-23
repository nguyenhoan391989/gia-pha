import { NextRequest, NextResponse } from 'next/server';
import type { Relationship as PRel } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, ApiError, auditLog } from '@/lib/api';
import { memberSchema, memberPayloadToPrisma } from '@/lib/schemas';
import { memberToApi, relationshipToApi } from '@/lib/serialize';

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/members/:id - chi tiết + các quan hệ (2 chiều) */
export const GET = handleApi(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireAuth();
  const { id } = await params;

  const member = await prisma.member.findFirst({
    where: { id, ...(user.role === 'viewer' ? { isPrivate: false } : {}) },
  });
  if (!member) throw new ApiError(404, 'Không tìm thấy thành viên');

  const rels = await prisma.relationship.findMany({
    where: { OR: [{ memberId: id }, { relatedMemberId: id }] },
    include: {
      member: { select: { fullName: true, avatarUrl: true } },
      relatedMember: { select: { fullName: true, avatarUrl: true } },
    },
  });

  return NextResponse.json({
    member: memberToApi(member),
    relationships: (rels as (PRel & {
      member: { fullName: string; avatarUrl: string | null };
      relatedMember: { fullName: string; avatarUrl: string | null };
    })[]).map((r) => ({
      ...relationshipToApi(r),
      related_name: r.memberId === id ? r.relatedMember.fullName : r.member.fullName,
      related_avatar: r.memberId === id ? r.relatedMember.avatarUrl : r.member.avatarUrl,
    })),
  });
});

/** PUT /api/members/:id - cập nhật (editor trở lên) */
export const PUT = handleApi(async (req: NextRequest, { params }: Ctx) => {
  const user = await requireAuth('editor');
  const { id } = await params;
  const body = memberSchema.partial().parse(await req.json());

  const existed = await prisma.member.findUnique({ where: { id }, select: { id: true } });
  if (!existed) throw new ApiError(404, 'Không tìm thấy thành viên');

  const data = memberPayloadToPrisma(body, user.id);
  if (Object.keys(data).length <= 1) throw new ApiError(400, 'Không có dữ liệu để cập nhật');

  const member = await prisma.member.update({ where: { id }, data });
  await auditLog(user.id, 'update', 'members', id, body);
  return NextResponse.json(memberToApi(member));
});

/** DELETE /api/members/:id - chỉ admin */
export const DELETE = handleApi(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireAuth('admin');
  const { id } = await params;

  const existed = await prisma.member.findUnique({
    where: { id }, select: { id: true, fullName: true },
  });
  if (!existed) throw new ApiError(404, 'Không tìm thấy thành viên');

  await prisma.member.delete({ where: { id } });
  await auditLog(user.id, 'delete', 'members', id, existed);
  return NextResponse.json({ message: 'Đã xóa thành viên' });
});
