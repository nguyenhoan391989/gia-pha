import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, ApiError, auditLog } from '@/lib/api';

/** POST /api/import/gedcom - nhập file GEDCOM cơ bản (INDI + FAM) - giữ nguyên parser bản cũ */
export const POST = handleApi(async (req: NextRequest) => {
  const user = await requireAuth('editor');
  const { content } = z.object({ content: z.string().min(10) }).parse(await req.json());
  const lines = content.split(/\r?\n/);

  interface GIndi { name?: string; sex?: string }
  const indis = new Map<string, GIndi>();
  const fams = new Map<string, { husb?: string; wife?: string; children: string[] }>();
  let current: { type: 'INDI' | 'FAM'; id: string } | null = null;

  for (const line of lines) {
    const m = line.trim().match(/^(\d+)\s+(@[^@]+@\s+)?(\w+)(\s+(.*))?$/);
    if (!m) continue;
    const level = parseInt(m[1], 10);
    const xref = m[2]?.trim().replace(/@/g, '');
    const tag = m[3];
    const value = m[5]?.trim();

    if (level === 0 && tag === 'INDI' && xref) { current = { type: 'INDI', id: xref }; indis.set(xref, {}); continue; }
    if (level === 0 && tag === 'FAM' && xref) { current = { type: 'FAM', id: xref }; fams.set(xref, { children: [] }); continue; }
    if (level === 0) { current = null; continue; }
    if (!current) continue;

    if (current.type === 'INDI') {
      const indi = indis.get(current.id)!;
      if (tag === 'NAME' && value) indi.name = value.replace(/\//g, '').trim();
      if (tag === 'SEX' && value) indi.sex = value;
    } else {
      const fam = fams.get(current.id)!;
      const ref = value?.replace(/@/g, '');
      if (tag === 'HUSB' && ref) fam.husb = ref;
      if (tag === 'WIFE' && ref) fam.wife = ref;
      if (tag === 'CHIL' && ref) fam.children.push(ref);
    }
  }

  // Tạo members rồi tạo quan hệ
  const idMap = new Map<string, string>();
  for (const [xref, indi] of indis) {
    if (!indi.name) continue;
    const row = await prisma.member.create({
      data: {
        fullName: indi.name,
        gender: indi.sex === 'M' ? 'male' : indi.sex === 'F' ? 'female' : 'other',
        createdBy: user.id,
        updatedBy: user.id,
      },
      select: { id: true },
    });
    idMap.set(xref, row.id);
  }
  if (!idMap.size) throw new ApiError(400, 'Không tìm thấy cá nhân nào trong file GEDCOM');

  let relCount = 0;
  const addRel = async (memberId: string, relatedId: string, type: string) => {
    await prisma.relationship.upsert({
      where: {
        memberId_relatedMemberId_relationshipType: {
          memberId, relatedMemberId: relatedId, relationshipType: type,
        },
      },
      create: { memberId, relatedMemberId: relatedId, relationshipType: type },
      update: {},
    });
    relCount++;
  };

  for (const fam of fams.values()) {
    const husb = fam.husb ? idMap.get(fam.husb) : undefined;
    const wife = fam.wife ? idMap.get(fam.wife) : undefined;
    if (husb && wife) await addRel(husb, wife, 'spouse');
    for (const c of fam.children) {
      const child = idMap.get(c);
      if (!child) continue;
      if (husb) await addRel(child, husb, 'father');
      if (wife) await addRel(child, wife, 'mother');
    }
  }

  await auditLog(user.id, 'import', 'gedcom', null, { members: idMap.size, relationships: relCount });
  return NextResponse.json({ members: idMap.size, relationships: relCount });
});
