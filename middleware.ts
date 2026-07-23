import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Middleware refresh phiên Supabase Auth (chuẩn @supabase/ssr):
 * giữ cookie phiên luôn hợp lệ cho Server Components và Route Handlers.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Chưa cấu hình Supabase (chạy local/xem thử) -> bỏ qua refresh phiên,
  // để toàn bộ trang vẫn chạy được với dữ liệu mẫu.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: CookieToSet[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Bắt buộc gọi getUser() để token được refresh khi cần
  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Bỏ qua static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|pwa-.*\\.png).*)'],
};
