import { NextRequest, NextResponse } from 'next/server';
import type { Member as PMember, Relationship as PRel } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth } from '@/lib/api';
import { buildTree, MemberLite, RelationshipLite } from '@/lib/tree';
import { memberToApi } from '@/lib/serialize';

/**
 * GET /api/members/tree - cây phả hệ.
 * (Redis cache của bản cũ được bỏ vì môi trường serverless không có Redis;
 * truy vấn 2 bảng + dựng cây in-memory đủ nhanh với vài nghìn thành viên.)
 */
export const GET = handleApi(async (req: NextRequest) => {
  const user = await requireAuth();
  const rootId = req.nextUrl.searchParams.get('rootId') || undefined;

  const members = await prisma.member.findMany({
    where: user.role === 'viewer' ? { isPrivate: false } : {},
  });
  const rels = await prisma.relationship.findMany();

  const memberLites: MemberLite[] = (members as PMember[]).map((m) => memberToApi(m) as unknown as MemberLite);
  const relLites: RelationshipLite[] = (rels as PRel[]).map((r) => ({
    member_id: r.memberId,
    related_member_id: r.relatedMemberId,
    relationship_type: r.relationshipType as RelationshipLite['relationship_type'],
  }));

  const roots = buildTree(memberLites, relLites, rootId);
  return NextResponse.json({ roots, totalMembers: members.length });
});
