import { NextRequest } from 'next/server';
import { handleApi, requireAuth } from '@/lib/api';
import { toPrintableHtml } from '@/lib/export';
import { fetchAllForExport } from '@/lib/exportData';

/** GET /api/export/print - trang HTML in ấn (In -> Lưu thành PDF, font tiếng Việt chuẩn) */
export const GET = handleApi(async (req: NextRequest) => {
  await requireAuth();
  const { members } = await fetchAllForExport();
  const familyName = req.nextUrl.searchParams.get('name') || 'Dòng họ';
  return new Response(toPrintableHtml(members, familyName), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
});
