'use client';

import { forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

/**
 * Nút đăng xuất: gọi Supabase signOut nếu đã cấu hình, sau đó về /login.
 * Dùng forwardRef để đặt trong DropdownMenuItem asChild.
 */
export const LogoutButton = forwardRef<HTMLButtonElement>(function LogoutButton(props, ref) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        await createSupabaseBrowser().auth.signOut();
      }
    } catch {
      /* bỏ qua - vẫn điều hướng về trang đăng nhập */
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <button
      ref={ref}
      {...props}
      onClick={handleLogout}
      className="flex w-full items-center gap-2 text-destructive"
    >
      <LogOut /> Đăng xuất
    </button>
  );
});
