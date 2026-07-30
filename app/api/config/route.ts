import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PLAN_LIMITS, PLANS } from '@/lib/subscription/plans';
import { normalizeSupabaseUrl } from '@/lib/sync/book';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/config — CẤU HÌNH TỪ XA.
 *
 * Mục đích: đổi bảng giá, giới hạn, thông báo, bật/tắt tính năng… ngay trên máy chủ
 * mà KHÔNG phải phát hành bản cập nhật mới lên CH Play.
 * App gọi lúc mở và mỗi giờ; nếu không gọi được thì dùng giá trị mặc định trong app.
 */

/** Giá trị mặc định — dùng khi chưa cấu hình gì trong DB */
const DEFAULTS = {
  /** Bật/tắt tính năng từ xa */
  features: {
    sync: true,          // đồng bộ nhiều máy
    payment: false,      // hiện bảng giá & nút nâng gói
    ai: true,            // trợ lý AI (vẫn cần người dùng tự nhập khoá)
    photoStudio: true,   // studio phục chế ảnh
    fortune: true,       // huyền học, tướng số
  },
  /** Bảng giá — sửa ở đây là app đổi ngay, không cần cập nhật */
  pricing: [
    { plan: 'TRIAL',    name: 'Dùng thử',   price: 0,       unit: '30 ngày', note: 'Đầy đủ tính năng' },
    { plan: 'YEARLY',   name: 'Gói năm',    price: 299000,  unit: 'năm',     note: 'Tiết kiệm nhất' },
    { plan: 'LIFETIME', name: 'Trọn đời',   price: 1990000, unit: 'một lần', note: 'Dùng mãi mãi' },
  ],
  /** Thông báo hiện trong app (để trống = không hiện) */
  notice: { text: '', level: 'info' as 'info' | 'warn' | 'error', until: '' },
  /** Ngưỡng cảnh báo quá tải */
  capacity: { maxBooks: 5000, warnAt: 0.85 },
  /** Bản tối thiểu — nếu app cũ hơn thì nhắc cập nhật (không ép) */
  minAppVersion: 0,
};

function admin() {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET() {
  let cfg: Record<string, unknown> = { ...DEFAULTS };
  let load = { books: 0, pct: 0, over: false };

  const sb = admin();
  if (sb) {
    // 1) Cấu hình do chủ hệ thống đặt trong bảng app_config (nếu có)
    try {
      const { data } = await sb.from('app_config').select('value').eq('key', 'global').maybeSingle();
      if (data?.value && typeof data.value === 'object') cfg = { ...cfg, ...(data.value as object) };
    } catch { /* chưa tạo bảng → dùng mặc định */ }

    // 2) Đo mức tải hiện tại để cảnh báo sớm
    try {
      const { count } = await sb.from('family_books').select('id', { count: 'exact', head: true });
      const cap = (cfg.capacity as typeof DEFAULTS.capacity) || DEFAULTS.capacity;
      const books = count || 0;
      const pct = cap.maxBooks ? books / cap.maxBooks : 0;
      load = { books, pct: Math.round(pct * 100), over: pct >= 1 };
      if (pct >= cap.warnAt && !(cfg.notice as typeof DEFAULTS.notice)?.text) {
        cfg.notice = {
          text: load.over
            ? 'Hệ thống đang quá tải, tạm thời chưa nhận thêm sổ mới. Vui lòng thử lại sau.'
            : 'Hệ thống đang có nhiều người dùng. Thao tác có thể chậm hơn bình thường.',
          level: load.over ? 'error' : 'warn',
          until: '',
        };
      }
    } catch { /* bỏ qua */ }
  }

  return NextResponse.json(
    { ...cfg, limits: PLAN_LIMITS, plans: PLANS, load, serverTime: Date.now() },
    { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=600' } }
  );
}
