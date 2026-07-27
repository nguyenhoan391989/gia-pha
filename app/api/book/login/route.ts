import { NextResponse } from 'next/server';
import { loginBook } from '@/lib/sync/book';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/book/login — Vào sổ bằng MÃ DÒNG HỌ + MẬT KHẨU. */
export async function POST(req: Request) {
  try {
    const { code, pass } = await req.json().catch(() => ({}));
    if (!code || !pass) {
      return NextResponse.json({ ok: false, error: 'Cần nhập mã dòng họ và mật khẩu.' }, { status: 400 });
    }
    const r = await loginBook(String(code), String(pass));
    if (!r.ok) {
      const msg = r.reason === 'NOT_FOUND'
        ? 'Không tìm thấy mã dòng họ này.'
        : 'Mật khẩu không đúng.';
      return NextResponse.json({ ok: false, error: msg }, { status: 401 });
    }
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
