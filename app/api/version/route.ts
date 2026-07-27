import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // luôn tính lại, không cache

/**
 * GET /api/version — Cho biết bản đang chạy trên máy chủ.
 * Vercel tự đặt các biến này mỗi lần deploy, nên KHÔNG phải sửa tay số phiên bản.
 * App gọi định kỳ; thấy khác bản đang mở → tự nạp lại để người dùng luôn ở bản mới nhất.
 */
export async function GET() {
  const v =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.VERCEL_URL ||
    'dev';

  return NextResponse.json(
    {
      v,
      short: String(v).slice(0, 7),
      deployedAt: process.env.VERCEL_GIT_COMMIT_MESSAGE ? undefined : undefined,
      time: Date.now(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    }
  );
}
