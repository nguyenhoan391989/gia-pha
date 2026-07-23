import { z } from 'zod';

/** Zod schemas dùng chung cho Route Handlers - giữ nguyên validation của bản Express */

export const memberSchema = z.object({
  full_name: z.string().min(1, 'Họ tên là bắt buộc').max(255),
  common_name: z.string().max(255).nullish(),
  gender: z.enum(['male', 'female', 'other']).default('other'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng YYYY-MM-DD').nullish(),
  birth_date_lunar: z.string().max(50).nullish(),
  death_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
  death_date_lunar: z.string().max(50).nullish(),
  is_alive: z.boolean().default(true),
  birth_place: z.string().max(255).nullish(),
  death_place: z.string().max(255).nullish(),
  burial_place: z.string().max(255).nullish(),
  education: z.string().max(255).nullish(),
  occupation: z.string().max(255).nullish(),
  title: z.string().max(255).nullish(),
  biography: z.string().nullish(),
  avatar_url: z.string().max(500).nullish(),
  generation: z.number().int().min(1).max(100).nullish(),
  branch_id: z.string().uuid().nullish(),
  is_private: z.boolean().default(false),
});

export const relationshipSchema = z.object({
  member_id: z.string().uuid(),
  related_member_id: z.string().uuid(),
  relationship_type: z.enum(['father', 'mother', 'spouse', 'child', 'sibling']),
  note: z.string().max(255).nullish(),
}).refine((d) => d.member_id !== d.related_member_id, {
  message: 'Không thể tạo quan hệ với chính mình',
});

export const recordSchema = z.object({
  record_type: z.enum(['pha_ky', 'ngoai_pha', 'gia_huan', 'van_te']),
  title: z.string().min(1, 'Tiêu đề là bắt buộc').max(255),
  content: z.string().default(''),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    mime: z.string().optional(),
  })).default([]),
});

export const contributionSchema = z.object({
  member_id: z.string().uuid().nullish(),
  contributor_name: z.string().min(1).max(255),
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default('VND'),
  purpose: z.string().min(1).max(255),
  note: z.string().nullish(),
  contributed_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const importRowSchema = z.object({
  full_name: z.string().min(1),
  gender: z.enum(['male', 'female', 'other']).default('other'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
  birth_date_lunar: z.string().nullish(),
  death_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
  death_date_lunar: z.string().nullish(),
  birth_place: z.string().nullish(),
  occupation: z.string().nullish(),
  generation: z.number().int().nullish(),
  biography: z.string().nullish(),
});

/** Chuyển payload snake_case của member -> data Prisma camelCase */
export function memberPayloadToPrisma(p: Partial<z.infer<typeof memberSchema>>, userId: string) {
  const d = (s: string | null | undefined) => (s ? new Date(s) : s === null ? null : undefined);
  return {
    ...(p.full_name !== undefined && { fullName: p.full_name }),
    ...(p.common_name !== undefined && { commonName: p.common_name }),
    ...(p.gender !== undefined && { gender: p.gender }),
    ...(p.birth_date !== undefined && { birthDate: d(p.birth_date) }),
    ...(p.birth_date_lunar !== undefined && { birthDateLunar: p.birth_date_lunar }),
    ...(p.death_date !== undefined && { deathDate: d(p.death_date) }),
    ...(p.death_date_lunar !== undefined && { deathDateLunar: p.death_date_lunar }),
    ...(p.is_alive !== undefined && { isAlive: p.is_alive }),
    ...(p.birth_place !== undefined && { birthPlace: p.birth_place }),
    ...(p.death_place !== undefined && { deathPlace: p.death_place }),
    ...(p.burial_place !== undefined && { burialPlace: p.burial_place }),
    ...(p.education !== undefined && { education: p.education }),
    ...(p.occupation !== undefined && { occupation: p.occupation }),
    ...(p.title !== undefined && { title: p.title }),
    ...(p.biography !== undefined && { biography: p.biography }),
    ...(p.avatar_url !== undefined && { avatarUrl: p.avatar_url }),
    ...(p.generation !== undefined && { generation: p.generation }),
    ...(p.branch_id !== undefined && { branchId: p.branch_id }),
    ...(p.is_private !== undefined && { isPrivate: p.is_private }),
    updatedBy: userId,
  };
}
