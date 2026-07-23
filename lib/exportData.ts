/** Truy vấn dữ liệu đầy đủ cho export - dùng chung cho gedcom/csv/json/print */
import type { Member as PMember, Relationship as PRel } from '@prisma/client';
import { prisma } from './prisma';
import { memberToApi, relationshipToApi } from './serialize';
import type { FullMember } from './export';
import type { RelationshipLite } from './tree';

export async function fetchAllForExport(): Promise<{
  members: FullMember[];
  rels: RelationshipLite[];
}> {
  const members = await prisma.member.findMany({
    orderBy: [{ generation: 'asc' }, { birthDate: 'asc' }],
  });
  const rels = await prisma.relationship.findMany();
  return {
    members: (members as PMember[]).map((m) => memberToApi(m) as unknown as FullMember),
    rels: (rels as PRel[]).map((r) => relationshipToApi(r) as RelationshipLite),
  };
}
