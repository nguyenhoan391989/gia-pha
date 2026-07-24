import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, auditLog } from '@/lib/api';
import { validateBackup, planImport, summarize } from '@/lib/import-backup';

export const maxDuration = 60;

/**
 * POST /api/import — nhập file Sao lưu JSON từ bản HTML (admin).
 * Body: nội dung file backup. Query ?mode=replace để xóa dữ liệu cũ trước khi nhập.
 */
export const POST = handleApi(async (req: NextRequest) => {
  const user = await requireAuth('admin');
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Chưa cấu hình DATABASE_URL — đang chạy chế độ dữ liệu mẫu' }, { status: 400 });
  }

  const parsed = validateBackup(await req.json());
  if (!parsed.ok || !parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const plan = planImport(parsed.data);
  const replace = req.nextUrl.searchParams.get('mode') === 'replace';

  const result = await prisma.$transaction(async (tx) => {
    if (replace) {
      await tx.relationship.deleteMany({});
      await tx.contribution.deleteMany({});
      await tx.member.deleteMany({});
      await tx.familyRecord.deleteMany({});
    }

    // 1) Chi / nhánh
    const branchIds = new Map<string, string>();
    for (const name of plan.branches) {
      const existed = await tx.branch.findFirst({ where: { name } });
      const row = existed ?? (await tx.branch.create({ data: { name } }));
      branchIds.set(name, row.id);
    }

    // 2) Thành viên (map id cũ -> uuid mới)
    const idMap = new Map<number, string>();
    for (const m of plan.members) {
      const row = await tx.member.create({
        data: {
          fullName: m.fullName,
          gender: m.gender,
          birthDate: m.birthDate ? new Date(m.birthDate) : null,
          deathDate: m.deathDate ? new Date(m.deathDate) : null,
          isAlive: m.isAlive,
          birthPlace: m.birthPlace,
          occupation: m.occupation,
          biography: m.biography,
          generation: m.generation,
          branchId: m.branchName ? branchIds.get(m.branchName) ?? null : null,
          createdBy: user.id,
        },
      });
      idMap.set(m.oldId, row.id);
    }

    // 3) Quan hệ cha / vợ chồng
    let rels = 0;
    for (const r of plan.relationships) {
      const a = idMap.get(r.fromOldId), b = idMap.get(r.toOldId);
      if (!a || !b) continue;
      await tx.relationship.create({ data: { memberId: a, relatedMemberId: b, relationshipType: r.type } });
      rels++;
    }

    // 4) Quỹ công đức
    for (const c of plan.contributions) {
      await tx.contribution.create({
        data: {
          contributorName: c.contributorName, purpose: c.purpose, amount: c.amount, note: c.note,
          contributedAt: c.contributedAt ? new Date(c.contributedAt) : new Date(), createdBy: user.id,
        },
      });
    }

    // 5) Tư liệu nhà thờ họ
    for (const rec of plan.familyRecords) {
      await tx.familyRecord.create({ data: { recordType: rec.recordType, title: rec.title, content: rec.content, createdBy: user.id } });
    }

    // 6) Cấu hình & module chưa có bảng riêng -> app_state
    for (const s of plan.appState) {
      await tx.appState.upsert({ where: { key: s.key }, update: { value: s.value as object }, create: { key: s.key, value: s.value as object } });
    }

    return { members: idMap.size, relationships: rels, contributions: plan.contributions.length, records: plan.familyRecords.length, state: plan.appState.length };
  }, { timeout: 55000 });

  await auditLog(user.id, 'import', 'backup', null, result);
  return NextResponse.json({ ok: true, summary: summarize(plan), result, warnings: plan.warnings });
});
