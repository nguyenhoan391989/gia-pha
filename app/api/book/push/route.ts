import { NextResponse } from 'next/server';
import { pushBook } from '@/lib/sync/book';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/book/push — Đưa sổ gia phả trên máy này lên máy chủ (chỉ trưởng tộc/quản trị). */
export async function POST(req: Request) {
  try {
    const { token, data, baseVersion, by } = await req.json().catch(() => ({}));
    const r = await pushBook(String(token || ''), { data, baseVersion, by });
    if (!r.ok) {
      const map: Record<string, { m: string; s: number }> = {
        BAD_TICKET: { m: 'Phiên đã hết hạn. Hãy đăng nhập lại.', s: 401 },
        FORBIDDEN: { m: 'Tài khoản này chỉ được xem, không được sửa dữ liệu chung.', s: 403 },
        CONFLICT: { m: 'Có thay đổi từ máy khác. Hãy bấm "Tải về" trước.', s: 409 },
        LIMIT_MEMBERS: {
          m: `Gói ${'plan' in r ? r.plan : ''} chỉ cho phép ${'limit' in r ? r.limit : ''} thành viên (sổ đang có ${'count' in r ? r.count : ''}). Hãy nâng gói để lưu lên máy chủ.`,
          s: 402,
        },
      };
      const x = map[r.reason] || { m: r.reason, s: 400 };
      return NextResponse.json({ ok: false, error: x.m, reason: r.reason }, { status: x.s });
    }
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
