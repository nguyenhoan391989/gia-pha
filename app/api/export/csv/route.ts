import { handleApi, requireAuth } from '@/lib/api';
import { toCsv } from '@/lib/export';
import { fetchAllForExport } from '@/lib/exportData';

/** GET /api/export/csv - mở đúng tiếng Việt bằng Excel (BOM UTF-8) */
export const GET = handleApi(async () => {
  await requireAuth();
  const { members } = await fetchAllForExport();
  return new Response(toCsv(members), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="giapha.csv"',
    },
  });
});
