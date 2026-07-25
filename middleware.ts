import { NextResponse, type NextRequest } from 'next/server';

/**
 * MỘT GIAO DIỆN DUY NHẤT cho mọi phiên bản: bản HTML 15 module (public/app.html).
 * Middleware tối giản — chỉ chuyển hướng URL trang về /app.html.
 * Không import ngoài next/server, không async, không đụng env → không thể lỗi 500.
 * (Refresh phiên Supabase Auth để sau, xử lý ở tầng API — không cần middleware.)
 */
export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL('/app.html', request.url));
}

export const config = {
  // Chỉ chạy cho URL trang: bỏ /api, /_next, và mọi file có đuôi (.html .js .png .jpg ...)
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
