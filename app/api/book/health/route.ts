import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from '@/lib/sync/book';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/book/health — Tự kiểm tra cấu hình đồng bộ.
 * KHÔNG trả về chìa khoá, chỉ cho biết đã cấu hình đúng chưa và sai ở đâu.
 */
export async function GET() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const url = normalizeSupabaseUrl(rawUrl);
  const svc = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const anon = String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  const checks: { ten: string; ok: boolean; ghiChu: string }[] = [];
  const urlOk = /^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i.test(url);

  checks.push({
    ten: 'NEXT_PUBLIC_SUPABASE_URL', ok: urlOk,
    ghiChu: !rawUrl ? 'CHƯA có biến này trên Vercel'
      : urlOk ? (rawUrl.trim() !== url ? `OK (đã tự cắt phần thừa: "${rawUrl.trim()}" → "${url}")` : 'OK')
      : `Sai dạng: "${rawUrl.trim()}". Phải là https://xxxxx.supabase.co`,
  });
  checks.push({
    ten: 'SUPABASE_SERVICE_ROLE_KEY', ok: svc.length > 40,
    ghiChu: !svc ? 'CHƯA có biến này trên Vercel' : svc.length > 40 ? `OK (dài ${svc.length} ký tự)` : 'Có vẻ bị cắt ngắn — dán lại cho đủ',
  });
  checks.push({
    ten: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', ok: anon.length > 40,
    ghiChu: !anon ? 'CHƯA có (không bắt buộc cho đồng bộ)' : 'OK',
  });

  let table = { ok: false, ghiChu: 'Chưa kiểm tra được (thiếu URL hoặc khoá)' };
  if (urlOk && svc.length > 40) {
    try {
      const sb = createClient(url, svc, { auth: { persistSession: false, autoRefreshToken: false } });
      const { error } = await sb.from('family_books').select('id').limit(1);
      if (!error) table = { ok: true, ghiChu: 'OK — bảng family_books đã sẵn sàng' };
      else if (/does not exist|schema cache/i.test(error.message)) {
        table = { ok: false, ghiChu: 'CHƯA tạo bảng. Hãy chạy supabase/SQL-DONG-BO.sql ở SQL Editor (Bước 2).' };
      } else if (/Invalid API key|JWT/i.test(error.message)) {
        table = { ok: false, ghiChu: 'Khoá service_role không đúng. Lấy lại ở Project Settings → API keys → service_role.' };
      } else table = { ok: false, ghiChu: error.message };
    } catch (e) {
      table = { ok: false, ghiChu: (e as Error).message };
    }
  }
  checks.push({ ten: 'Bảng family_books', ...table });

  const allOk = checks.every((c) => c.ok || c.ten.includes('ANON'));
  return NextResponse.json({
    sanSang: allOk,
    ketLuan: allOk ? '✅ Cấu hình đồng bộ ĐÃ ĐÚNG — có thể tạo sổ.' : '❌ Còn thiếu/sai, xem danh sách bên dưới.',
    kiemTra: checks,
    nhac: 'Sau khi sửa biến môi trường trên Vercel, phải bấm Redeploy thì mới có tác dụng.',
  });
}
