import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, ApiError, auditLog } from '@/lib/api';
import { relationshipSchema } from '@/lib/schemas';
import { relationshipToApi } from '@/lib/serialize';

/** POST /api/relationships - thêm quan hệ (editor trở lên) */
export const POST = handleApi(async (req: NextRequest) => {
  const user = await requireAuth('editor');
  const body = relationshipSchema.parse(await req.json());

  // Một người chỉ có 1 cha, 1 mẹ
  if (body.relationship_type === 'father' || body.relationship_type === 'mother') {
    const existed = await prisma.relationship.findFirst({
      where: { memberId: body.member_id, relationshipType: body.relationship_type },
    });
    if (existed) {
      throw new ApiError(409, `Thành viên đã có ${body.relationship_type === 'father' ? 'cha' : 'mẹ'} trong gia phả`);
    }

    // Chống vòng lặp: tổ tiên không thể là hậu duệ (recursive CTE như bản cũ)
    const cycle = await prisma.$queryRaw<{ found: number }[]>(Prisma.sql`
      WITH RECURSIVE ancestors AS (
        SELECT related_member_id AS aid FROM relationships
        WHERE member_id = ${body.related_member_id}::uuid
          AND relationship_type IN ('father','mother')
        UNION
        SELECT r.related_member_id FROM relationships r
        JOIN ancestors a ON r.member_id = a.aid
        WHERE r.relationship_type IN ('father','mother')
      )
      SELECT 1 AS found FROM ancestors WHERE aid = ${body.member_id}::uuid LIMIT 1
    `);
    if (cycle.length > 0) throw new ApiError(400, 'Quan hệ tạo thành vòng lặp trong cây phả hệ');
  }

  const row = await prisma.relationship.upsert({
    where: {
      memberId_relatedMemberId_relationshipType: {
        memberId: body.member_id,
        relatedMemberId: body.related_member_id,
        relationshipType: body.relationship_type,
      },
    },
    create: {
      memberId: body.member_id,
      relatedMemberId: body.related_member_id,
      relationshipType: body.relationship_type,
      note: body.note ?? null,
    },
    update: { note: body.note ?? null },
  });
  await auditLog(user.id, 'create', 'relationships', row.id, body);
  return NextResponse.json(relationshipToApi(row), { status: 201 });
});
