import { NextResponse } from 'next/server';
import { handleApi, requireAuth } from '@/lib/api';
import { fetchAllForExport } from '@/lib/exportData';

/** GET /api/export/json - sao lưu đầy đủ */
export const GET = handleApi(async () => {
  await requireAuth();
  const { members, rels } = await fetchAllForExport();
  return NextResponse.json(
    { exported_at: new Date().toISOString(), members, relationships: rels },
    { headers: { 'Content-Disposition': 'attachment; filename="giapha.json"' } }
  );
});
