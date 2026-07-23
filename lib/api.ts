import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { prisma } from './prisma';
import { createSupabaseServer } from './supabase/server';

export type Role = 'admin' | 'editor' | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

/** Lỗi API có mã HTTP rõ ràng - tương đương ApiError của bản Express */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Lấy người dùng hiện tại từ phiên Supabase Auth.
 * Tự tạo hồ sơ (profile) lần đầu; email trùng ADMIN_EMAIL nhận quyền admin
 * (thay cho cơ chế bootstrap admin của bản Express).
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  let profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile) {
    const isAdmin =
      !!process.env.ADMIN_EMAIL &&
      user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
    profile = await prisma.profile.create({
      data: {
        id: user.id,
        email: user.email.toLowerCase(),
        fullName: (user.user_metadata?.full_name as string) || user.email.split('@')[0],
        role: isAdmin ? 'admin' : 'viewer',
      },
    });
  }
  if (!profile.isActive) return null;
  return { id: profile.id, email: profile.email, role: profile.role as Role };
}

const roleRank: Record<Role, number> = { viewer: 0, editor: 1, admin: 2 };

/** Yêu cầu đăng nhập + vai trò tối thiểu; ném ApiError nếu không đạt */
export async function requireAuth(minRole: Role = 'viewer'): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) throw new ApiError(401, 'Chưa đăng nhập');
  if (roleRank[user.role] < roleRank[minRole]) {
    throw new ApiError(403, 'Bạn không có quyền thực hiện thao tác này');
  }
  return user;
}

/** Bọc Route Handler: xử lý lỗi tập trung, không lộ chi tiết nội bộ */
export function handleApi<T extends unknown[]>(
  fn: (...args: T) => Promise<Response>
): (...args: T) => Promise<Response> {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          {
            error: 'Dữ liệu không hợp lệ',
            details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
          },
          { status: 400 }
        );
      }
      console.error('[api:error]', err);
      return NextResponse.json({ error: 'Lỗi hệ thống, vui lòng thử lại sau' }, { status: 500 });
    }
  };
}

/** Ghi nhật ký chỉnh sửa (audit log) - không được làm hỏng request chính */
export async function auditLog(
  userId: string | null,
  action: string,
  entity: string,
  entityId: string | null,
  changes: unknown = null
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        changes: changes ? JSON.parse(JSON.stringify(changes)) : undefined,
      },
    });
  } catch (err) {
    console.error('[audit] failed:', err);
  }
}
