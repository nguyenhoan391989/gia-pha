/**
 * Thông tin người dùng hiện tại (server-side).
 * Có phiên Supabase + hồ sơ -> dùng dữ liệu thật; nếu chưa cấu hình -> mock.
 */
import { getAuthUser } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { CURRENT_USER } from '@/lib/mock-data';

export interface CurrentUser {
  name: string;
  role: string;
  initials: string;
  authenticated: boolean;
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Quản trị viên',
  editor: 'Biên tập viên',
  viewer: 'Thành viên',
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export async function getCurrentUser(): Promise<CurrentUser> {
  if (process.env.DATABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const auth = await getAuthUser();
      if (auth) {
        const profile = await prisma.profile.findUnique({ where: { id: auth.id } });
        const name = profile?.fullName || auth.email.split('@')[0];
        return {
          name,
          role: ROLE_LABEL[auth.role] ?? 'Thành viên',
          initials: initialsOf(name),
          authenticated: true,
        };
      }
    } catch (err) {
      console.error('[session:getCurrentUser] fallback mock:', err);
    }
  }
  return {
    name: CURRENT_USER.name,
    role: CURRENT_USER.role,
    initials: CURRENT_USER.initials,
    authenticated: false,
  };
}
