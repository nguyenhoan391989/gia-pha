import { NextResponse, type NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

/**
 * Middleware:
 *  1) MỘT GIAO DIỆN DUY NHẤT — mọi URL trang (không phải /api, /_next, file tĩnh)
 *     đều chuyển về bản HTML 15 module (public/app.html).
 *  2) Refresh phiên Supabase Auth — CHỈ khi đã cấu hình env (nạp động @supabase/ssr,
 *     bọc try/catch) để app vẫn chạy khi CHƯA kết nối Supabase (không còn 500).
 */
export async function middleware(request: NextRequest) {
  const p = request.nextUrl.pathname;
  const isStaticFile = /\.[a-z0-9]+$/i.test(p); // .html .js .png .jpg .webmanifest ...
  if (!p.startsWith('/api') && !p.startsWith('/_next') && !isStaticFile) {
    return NextResponse.redirect(new URL('/app.html', request.url));
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.next({ request });

  try {
    const { createServerClient } = await import('@supabase/ssr');
    let response = NextResponse.next({ request });
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: CookieToSet[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as never)
          );
        },
      },
    });
    await supabase.auth.getUser();
    return response;
  } catch {
    // Nếu Supabase lỗi vì bất kỳ lý do gì, vẫn cho request đi tiếp (không chặn app).
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|pwa-.*\\.png).*)'],
};
