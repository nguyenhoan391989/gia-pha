import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, ApiError, auditLog } from '@/lib/api';
import { memberSchema, memberPayloadToPrisma } from '@/lib/schemas';
import { memberToApi } from '@/lib/serialize';

/** GET /api/members - danh sách + tìm kiếm thông minh (ILIKE + pg_trgm fuzzy) */
export const GET = handleApi(async (req: NextRequest) => {
  const user = await requireAuth();
  const sp = req.nextUrl.searchParams;
  const q = (sp.get('q') || '').trim();
  const generation = sp.get('generation') ? parseInt(sp.get('generation')!, 10) : null;
  const branchId = sp.get('branch_id');
  const limit = Math.min(parseInt(sp.get('limit') || '50', 10) || 50, 200);
  const offset = parseInt(sp.get('offset') || '0', 10) || 0;

  const conds: Prisma.Sql[] = [Prisma.sql`TRUE`];
  if (q) {
    const like = `%${q}%`;
    conds.push(Prisma.sql`(
      full_name ILIKE ${like} OR common_name ILIKE ${like} OR occupation ILIKE ${like}
      OR title ILIKE ${like} OR education ILIKE ${like}
      OR similarity(full_name, ${q}) > 0.25
    )`);
  }
  if (generation) conds.push(Prisma.sql`generation = ${generation}`);
  if (branchId) conds.push(Prisma.sql`branch_id = ${branchId}::uuid`);
  if (user.role === 'viewer') conds.push(Prisma.sql`is_private = FALSE`);

  // $queryRaw trả về đúng tên cột snake_case -> giữ nguyên hợp đồng API cũ
  const rows = await prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
    SELECT id, full_name, common_name, gender,
           to_char(birth_date, 'YYYY-MM-DD') AS birth_date, birth_date_lunar,
           to_char(death_date, 'YYYY-MM-DD') AS death_date, death_date_lunar,
           is_alive, birth_place, death_place, burial_place, education, occupation,
           title, biography, avatar_url, generation, branch_id, is_private,
           created_at, updated_at
    FROM members
    WHERE ${Prisma.join(conds, ' AND ')}
    ORDER BY generation NULLS LAST, birth_date NULLS LAST, full_name
    LIMIT ${limit} OFFSET ${offset}
  `);
  return NextResponse.json({ items: rows });
});

/** POST /api/members - tạo mới (editor trở lên) */
export const POST = handleApi(async (req: NextRequest) => {
  const user = await requireAuth('editor');
  const body = memberSchema.parse(await req.json());
  if (!body.full_name) throw new ApiError(400, 'Họ tên là bắt buộc');

  const member = await prisma.member.create({
    data: {
      fullName: body.full_name,
      ...memberPayloadToPrisma(body, user.id),
      createdBy: user.id,
    },
  });
  await auditLog(user.id, 'create', 'members', member.id, body);
  return NextResponse.json(memberToApi(member), { status: 201 });
});
