import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, auditLog } from '@/lib/api';
import { importRowSchema } from '@/lib/schemas';

/**
 * POST /api/import/members - nhập hàng loạt từ JSON
 * (frontend đọc file Excel/CSV theo template rồi gửi mảng JSON lên)
 */
export const POST = handleApi(async (req: NextRequest) => {
  const user = await requireAuth('editor');
  const { rows } = z.object({ rows: z.array(importRowSchema).min(1).max(2000) })
    .parse(await req.json());

  let inserted = 0;
  const errors: { row: number; error: string }[] = [];
  for (let i = 0; i < rows.length; i++) {
    try {
      const r = rows[i];
      await prisma.member.create({
        data: {
          fullName: r.full_name,
          gender: r.gender,
          birthDate: r.birth_date ? new Date(r.birth_date) : null,
          birthDateLunar: r.birth_date_lunar ?? null,
          deathDate: r.death_date ? new Date(r.death_date) : null,
          deathDateLunar: r.death_date_lunar ?? null,
          isAlive: !r.death_date && !r.death_date_lunar,
          birthPlace: r.birth_place ?? null,
          occupation: r.occupation ?? null,
          generation: r.generation ?? null,
          biography: r.biography ?? null,
          createdBy: user.id,
          updatedBy: user.id,
        },
      });
      inserted++;
    } catch (e) {
      errors.push({ row: i + 1, error: e instanceof Error ? e.message : 'Lỗi không xác định' });
    }
  }
  await auditLog(user.id, 'import', 'members', null, { inserted, failed: errors.length });
  return NextResponse.json({ inserted, errors });
});
