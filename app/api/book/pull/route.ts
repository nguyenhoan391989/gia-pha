import { NextResponse } from 'next/server';
import { pullBook } from '@/lib/sync/book';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/book/pull — Tải sổ gia phả từ máy chủ về máy này. */
export async function POST(req: Request) {
  try {
    const { token } = await req.json().catch(() => ({}));
    const r = await pullBook(String(token || ''));
    if (!r.ok) {
      return NextResponse.json({ ok: false, error: 'Phiên đã hết hạn. Hãy đăng nhập lại.' }, { status: 401 });
    }
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
