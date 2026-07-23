/**
 * Bộ chuyển đổi giữa hợp đồng API (snake_case, giống bản backend) và
 * shape mà giao diện storyboard đang dùng. Nhờ tầng này, UI Phase 1 giữ
 * nguyên cách hiển thị trong khi dữ liệu đến từ Prisma/Supabase (Phase 2).
 *
 * Quy ước nghiệp vụ đã thống nhất: "Gia đình" trên UI ↔ "Chi/nhánh" (branches)
 * ở backend. Tên gia đình = tên branch; thành viên chưa gán branch hiển thị "—".
 */

import type { Member as ApiMember } from '@/services/api';

/** Shape thành viên mà giao diện dùng (id là chuỗi để tương thích UUID lẫn mock) */
export interface UiMember {
  id: string;
  name: string;
  birthYear: number | null;
  deathYear: number | null;
  gender: 'Nam' | 'Nữ';
  family: string;
  generation: number;
  role?: string;
  occupation?: string;
  birthPlace?: string;
  note?: string;
  avatarUrl?: string | null;
  isAlive?: boolean;
}

/** Lấy năm từ chuỗi ngày YYYY-MM-DD */
export function yearOf(date?: string | null): number | null {
  if (!date) return null;
  const y = parseInt(date.slice(0, 4), 10);
  return Number.isFinite(y) ? y : null;
}

/** male|female|other -> Nam|Nữ (mặc định Nam để bảng luôn có giá trị) */
export function genderToUi(g?: string | null): 'Nam' | 'Nữ' {
  return g === 'female' ? 'Nữ' : 'Nam';
}

/** Nam|Nữ -> male|female (gửi lên API) */
export function genderToApi(g: 'Nam' | 'Nữ'): 'male' | 'female' {
  return g === 'Nữ' ? 'female' : 'male';
}

/** ApiMember (snake_case) -> UiMember. branchName: map branch_id -> tên gia đình */
export function apiMemberToUi(m: ApiMember, branchName?: string): UiMember {
  return {
    id: m.id,
    name: m.full_name,
    birthYear: yearOf(m.birth_date),
    deathYear: yearOf(m.death_date),
    gender: genderToUi(m.gender),
    family: branchName ?? '—',
    generation: m.generation ?? 0,
    role: m.title ?? undefined,
    occupation: m.occupation ?? undefined,
    birthPlace: m.birth_place ?? undefined,
    note: m.biography ?? undefined,
    avatarUrl: m.avatar_url ?? null,
    isAlive: m.is_alive,
  };
}

/** Dữ liệu form thêm/sửa thành viên trên UI */
export interface UiMemberForm {
  full_name: string;
  gender: 'Nam' | 'Nữ';
  birthYear?: string | number | null;
  generation?: string | number | null;
  branch_id?: string | null;
  occupation?: string | null;
  birth_place?: string | null;
}

/** UiMemberForm -> payload API (khớp memberSchema của backend) */
export function uiFormToApi(form: UiMemberForm): Record<string, unknown> {
  const birthYear =
    form.birthYear === '' || form.birthYear == null ? null : Number(form.birthYear);
  const generation =
    form.generation === '' || form.generation == null ? null : Number(form.generation);
  return {
    full_name: form.full_name.trim(),
    gender: genderToApi(form.gender),
    birth_date: birthYear ? `${birthYear}-01-01` : null,
    generation: generation && generation > 0 ? generation : null,
    branch_id: form.branch_id || null,
    occupation: form.occupation || null,
    birth_place: form.birth_place || null,
  };
}
