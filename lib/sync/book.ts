/**
 * Đồng bộ SỔ GIA PHẢ nhiều máy — lớp lõi (chỉ chạy phía server).
 *
 * Nguyên tắc bảo mật:
 *  - Trình duyệt KHÔNG bao giờ giữ khoá Supabase. Mọi thao tác đi qua API của app.
 *  - Mật khẩu được BĂM bằng bcrypt trong Postgres (crypt/gen_salt), không lưu thô.
 *  - Sau khi đăng nhập, server phát một "vé" (token) có CHỮ KÝ HMAC, hết hạn 30 ngày.
 *    Vé ghi rõ quyền (admin/member) nên client không thể tự nâng quyền.
 *
 * Nghiệp vụ gói (FREE/TRIAL/…): đọc từ lib/subscription/plans.ts — KHÔNG hardcode.
 */
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { PLAN_LIMITS, PERPETUAL_PLANS, isValidPlan, type Plan } from '@/lib/subscription/plans';

export type BookRole = 'admin' | 'member';

/**
 * Chuẩn hoá Project URL: chỉ giữ phần gốc `https://xxxx.supabase.co`.
 * Người dùng hay dán thừa dấu "/" cuối hoặc thừa đuôi "/rest/v1" → Supabase báo
 * "Invalid path specified in request URL". Hàm này cắt sạch phần thừa đó.
 */
export function normalizeSupabaseUrl(raw: string) {
  const s = String(raw || '').trim().replace(/^["']|["']$/g, '');
  try { return new URL(s).origin; } catch { return s.replace(/\/+$/, ''); }
}

/** Client Supabase quyền service role — TUYỆT ĐỐI không dùng ở phía client. */
function admin() {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) throw new Error('Chưa cấu hình Supabase trên Vercel (thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY). Vào Vercel → Settings → Environment Variables, thêm biến rồi Redeploy.');
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i.test(url)) {
    throw new Error(`Project URL không đúng dạng: "${url}". Phải là https://xxxxx.supabase.co (không kèm /rest/v1, không dấu / ở cuối).`);
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Khoá ký vé: lấy từ SYNC_SECRET, nếu chưa có thì dẫn xuất từ service key. */
function signKey() {
  const s = process.env.SYNC_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!s) throw new Error('Thiếu SYNC_SECRET/SUPABASE_SERVICE_ROLE_KEY để ký vé đăng nhập.');
  return crypto.createHash('sha256').update('giapha-sync:' + s).digest();
}

const b64u = (b: Buffer) => b.toString('base64url');

export interface Ticket { id: string; code: string; role: BookRole; exp: number }

export function signTicket(t: Ticket): string {
  const body = b64u(Buffer.from(JSON.stringify(t)));
  const sig = b64u(crypto.createHmac('sha256', signKey()).update(body).digest());
  return `${body}.${sig}`;
}

export function verifyTicket(token: string | null | undefined): Ticket | null {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expect = b64u(crypto.createHmac('sha256', signKey()).update(body).digest());
  // so sánh chống timing attack
  if (sig.length !== expect.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  try {
    const t = JSON.parse(Buffer.from(body, 'base64url').toString()) as Ticket;
    if (!t?.id || !t?.role || typeof t.exp !== 'number') return null;
    if (Date.now() > t.exp) return null;
    return t;
  } catch {
    return null;
  }
}

/** Gói còn hiệu lực? Hết hạn thì coi như FREE (giống service.ts). */
export function effectivePlan(plan: string, expires: string | null): Plan {
  const p: Plan = isValidPlan(plan) ? plan : 'FREE';
  if (PERPETUAL_PLANS.includes(p)) return p;
  if (!expires) return p;
  return new Date(expires).getTime() > Date.now() ? p : 'FREE';
}

export const normCode = (c: string) => String(c || '').trim().toUpperCase();

/** Kiểm tra mã + mật khẩu → vé đăng nhập. */
export async function loginBook(code: string, pass: string) {
  const sb = admin();
  const { data, error } = await sb.rpc('fn_check_book_password', { p_code: normCode(code), p_pass: pass });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { ok: false as const, reason: 'NOT_FOUND' as const };
  if (!row.role) return { ok: false as const, reason: 'BAD_PASSWORD' as const };
  const plan = effectivePlan(row.plan, row.plan_expires);
  const ticket: Ticket = {
    id: row.id, code: normCode(code), role: row.role as BookRole,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
  return {
    ok: true as const,
    token: signTicket(ticket),
    role: ticket.role,
    name: row.name as string,
    plan,
    planExpires: row.plan_expires as string | null,
    version: Number(row.version || 1),
    limits: PLAN_LIMITS[plan],
  };
}

/** Tạo sổ mới. */
export async function createBook(args: {
  code: string; name: string; adminPass: string; memberPass?: string; data?: unknown;
}) {
  const sb = admin();
  const code = normCode(args.code);
  if (!/^[A-Z0-9][A-Z0-9-]{2,31}$/.test(code)) {
    return { ok: false as const, reason: 'BAD_CODE' as const };
  }
  if (!args.adminPass || args.adminPass.length < 6) {
    return { ok: false as const, reason: 'WEAK_PASSWORD' as const };
  }
  /* Chống quá tải: hệ thống đầy thì tạm ngừng nhận sổ mới; và chặn tạo hàng loạt.
     Nếu chưa chạy SQL cấu hình thì bỏ qua, không chặn người dùng. */
  try {
    const { data: capOk } = await sb.rpc('fn_capacity_ok');
    if (capOk === false) return { ok: false as const, reason: 'CAPACITY_FULL' as const };
    const { data: rateOk } = await sb.rpc('fn_rate_ok', { p_bucket: 'create', p_limit: 30, p_minutes: 60 });
    if (rateOk === false) return { ok: false as const, reason: 'RATE_LIMIT' as const };
  } catch { /* chưa cài phần chống quá tải → bỏ qua */ }

  const { data: exists, error: eEx } = await sb.from('family_books').select('id').eq('code', code).maybeSingle();
  if (eEx) {
    if (/relation .*family_books.* does not exist|schema cache/i.test(eEx.message)) {
      throw new Error('Chưa tạo bảng trong Supabase. Hãy chạy file supabase/SQL-DONG-BO.sql ở SQL Editor (Bước 2).');
    }
    throw new Error(eEx.message);
  }
  if (exists) return { ok: false as const, reason: 'CODE_TAKEN' as const };

  const { data, error } = await sb.rpc('fn_create_book', {
    p_code: code, p_name: args.name || 'Sổ gia phả',
    p_admin_pass: args.adminPass,
    p_member_pass: args.memberPass || null,
    p_data: (args.data as object) ?? {},
  });
  if (error) throw new Error(error.message);
  const id = String(data);

  // Gói khởi tạo:
  //  - Sổ của CHỦ HỆ THỐNG (mã nằm trong OWNER_BOOK_CODES) → LIFETIME, không hết hạn.
  //  - Sổ của người dùng khác → TRIAL theo số ngày cấu hình trong plans.ts.
  const owners = String(process.env.OWNER_BOOK_CODES || '')
    .split(',').map((s) => normCode(s)).filter(Boolean);
  const isOwner = owners.includes(code);

  let plan: Plan = isOwner ? 'LIFETIME' : 'TRIAL';
  const days = PLAN_LIMITS.TRIAL.durationDays ?? 30;
  const expires = isOwner ? null : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const { error: eUp } = await sb.from('family_books')
    .update({ plan, plan_expires: expires }).eq('id', id);
  if (eUp) plan = 'FREE'; // không nâng được thì vẫn dùng FREE, không chặn việc tạo sổ

  const ticket: Ticket = { id, code, role: 'admin', exp: Date.now() + 30 * 24 * 60 * 60 * 1000 };
  return { ok: true as const, id, token: signTicket(ticket), role: 'admin' as BookRole, plan, planExpires: expires };
}

/** Tải sổ về (ai có vé hợp lệ đều tải được — kể cả chỉ xem). */
export async function pullBook(token: string) {
  const t = verifyTicket(token);
  if (!t) return { ok: false as const, reason: 'BAD_TICKET' as const };
  const sb = admin();
  const { data, error } = await sb
    .from('family_books')
    .select('name, data, plan, plan_expires, version, updated_at, updated_by, member_count')
    .eq('id', t.id).single();
  if (error) throw new Error(error.message);
  const plan = effectivePlan(data.plan, data.plan_expires);
  return {
    ok: true as const, role: t.role, name: data.name, data: data.data,
    plan, planExpires: data.plan_expires, limits: PLAN_LIMITS[plan],
    version: Number(data.version), updatedAt: data.updated_at, updatedBy: data.updated_by,
  };
}

/**
 * Lưu sổ lên (CHỈ vai trò admin).
 * - Kiểm tra giới hạn số thành viên theo gói (data-driven, không hardcode).
 * - Chống ghi đè: nếu client gửi baseVersion cũ hơn bản trên server → báo xung đột.
 */
export async function pushBook(token: string, body: { data: unknown; baseVersion?: number; by?: string }) {
  const t = verifyTicket(token);
  if (!t) return { ok: false as const, reason: 'BAD_TICKET' as const };
  if (t.role !== 'admin') return { ok: false as const, reason: 'FORBIDDEN' as const };

  const sb = admin();
  const { data: cur, error: e1 } = await sb
    .from('family_books').select('plan, plan_expires, version').eq('id', t.id).single();
  if (e1) throw new Error(e1.message);

  if (body.baseVersion != null && Number(body.baseVersion) < Number(cur.version)) {
    return { ok: false as const, reason: 'CONFLICT' as const, serverVersion: Number(cur.version) };
  }

  const plan = effectivePlan(cur.plan, cur.plan_expires);
  const limit = PLAN_LIMITS[plan].maxMembers;
  const members = (body.data as { members?: unknown[] } | null)?.members;
  const count = Array.isArray(members) ? members.length : 0;
  if (limit != null && count > limit) {
    return { ok: false as const, reason: 'LIMIT_MEMBERS' as const, plan, limit, count };
  }

  const { data, error } = await sb.from('family_books')
    .update({ data: body.data as object, member_count: count, updated_by: body.by || null })
    .eq('id', t.id).select('version, updated_at').single();
  if (error) throw new Error(error.message);
  return { ok: true as const, version: Number(data.version), updatedAt: data.updated_at, plan, count };
}
