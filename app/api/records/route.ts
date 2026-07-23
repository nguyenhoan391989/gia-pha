import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, auditLog } from '@/lib/api';
import { recordSchema } from '@/lib/schemas';
import { recordToApi } from '@/lib/serialize';
import { sanitizeHtml } from '@/lib/sanitize';

/** GET /api/records - danh sách + tìm kiếm toàn văn (tsvector) */
export const GET = handleApi(async (req: NextRequest) => {
  await requireAuth();
  const sp = req.nextUrl.searchParams;
  const type = sp.get('type');
  const q = (sp.get('q') || '').trim();

  const conds: Prisma.Sql[] = [Prisma.sql`TRUE`];
  if (type) conds.push(Prisma.sql`record_type = ${type}`);
  if (q) {
    conds.push(Prisma.sql`to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(content,''))
      @@ plainto_tsquery('simple', ${q})`);
  }

  const rows = await prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
    SELECT id, record_type, title, content, attachments, created_at, updated_at
    FROM family_records
    WHERE ${Prisma.join(conds, ' AND ')}
    ORDER BY updated_at DESC
  `);
  return NextResponse.json({ items: rows });
});

/** POST /api/records - tạo tài liệu (editor trở lên) */
export const POST = handleApi(async (req: NextRequest) => {
  const user = await requireAuth('editor');
  const body = recordSchema.parse(await req.json());

  const row = await prisma.familyRecord.create({
    data: {
      recordType: body.record_type,
      title: body.title,
      content: sanitizeHtml(body.content),
      attachments: body.attachments,
      createdBy: user.id,
      updatedBy: user.id,
    },
  });
  await auditLog(user.id, 'create', 'family_records', row.id, { title: body.title });
  return NextResponse.json(recordToApi(row), { status: 201 });
});
