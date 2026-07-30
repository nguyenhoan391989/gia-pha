import { NextResponse } from 'next/server';
import { createBook } from '@/lib/sync/book';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/book/create — Tạo sổ gia phả mới (mã dòng họ + mật khẩu trưởng tộc). */
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}));
    const r = await createBook({
      code: b.code, name: b.name, adminPass: b.adminPass,
      memberPass: b.memberPass, data: b.data,
    });
    if (!r.ok) {
      const msg: Record<string, string> = {
        BAD_CODE: 'Mã dòng họ chỉ gồm chữ không dấu, số và dấu gạch ngang (3–32 ký tự). Ví dụ: NGUYEN-AN-HOA',
        WEAK_PASSWORD: 'Mật khẩu quản trị cần từ 6 ký tự trở lên.',
        CODE_TAKEN: 'Mã dòng họ này đã có người dùng. Hãy chọn mã khác.',
        CAPACITY_FULL: 'Hệ thống đang quá tải, tạm thời chưa nhận thêm sổ mới. Vui lòng thử lại sau ít giờ.',
        RATE_LIMIT: 'Có quá nhiều sổ được tạo trong thời gian ngắn. Vui lòng thử lại sau ít phút.',
      };
      const code = r.reason === 'CAPACITY_FULL' ? 503 : r.reason === 'RATE_LIMIT' ? 429 : 400;
      return NextResponse.json({ ok: false, error: msg[r.reason] || r.reason, reason: r.reason }, { status: code });
    }
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
