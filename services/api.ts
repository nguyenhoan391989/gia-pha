/**
 * API client phía trình duyệt.
 * Khác bản cũ: KHÔNG tự quản lý JWT/refresh token nữa -
 * phiên Supabase nằm trong cookie, middleware tự refresh.
 */

export interface Member {
  id: string;
  full_name: string;
  common_name?: string | null;
  gender: 'male' | 'female' | 'other';
  birth_date?: string | null;
  birth_date_lunar?: string | null;
  death_date?: string | null;
  death_date_lunar?: string | null;
  is_alive: boolean;
  birth_place?: string | null;
  death_place?: string | null;
  burial_place?: string | null;
  education?: string | null;
  occupation?: string | null;
  title?: string | null;
  biography?: string | null;
  avatar_url?: string | null;
  generation?: number | null;
  branch_id?: string | null;
  is_private?: boolean;
}

export interface TreeNode {
  member: Member;
  spouses: Member[];
  children: TreeNode[];
}

export class ApiRequestError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Gọi API nội bộ - cookie phiên được gửi kèm tự động (same-origin) */
export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...((options.headers as Record<string, string>) || {}),
  };
  const res = await fetch(path, { ...options, headers });

  if (!res.ok) {
    let msg = `Lỗi ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      msg = body.error || msg;
    } catch { /* giữ msg mặc định */ }
    throw new ApiRequestError(res.status, msg);
  }
  return res.json() as Promise<T>;
}
