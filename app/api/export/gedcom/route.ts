import { handleApi, requireAuth } from '@/lib/api';
import { toGedcom } from '@/lib/export';
import { fetchAllForExport } from '@/lib/exportData';

/** GET /api/export/gedcom - chuẩn GEDCOM 5.5.1 */
export const GET = handleApi(async () => {
  await requireAuth();
  const { members, rels } = await fetchAllForExport();
  return new Response(toGedcom(members, rels), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="giapha.ged"',
    },
  });
});
