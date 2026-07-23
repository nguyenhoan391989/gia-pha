/**
 * Domain: Subscription — CẤU HÌNH GÓI (nguồn chân lý, data-driven).
 * KHÔNG hardcode điều kiện theo gói ở component/API. Mọi giới hạn & tính năng
 * đọc từ bảng này (và bảng plan_limits trong DB được seed từ đây).
 *
 * Thêm/sửa gói = sửa dữ liệu ở đây + seed lại DB, KHÔNG sửa logic nghiệp vụ.
 */

export const PLANS = ['FREE', 'TRIAL', 'MONTHLY', 'YEARLY', 'LIFETIME', 'GIFT_LIFETIME'] as const;
export type Plan = (typeof PLANS)[number];

export const SUB_STATUSES = ['ACTIVE', 'EXPIRED', 'CANCELLED'] as const;
export type SubStatus = (typeof SUB_STATUSES)[number];

/** Khả năng (feature) — dùng key thay vì if(plan==='...') */
export const FEATURES = [
  'ai',          // trợ lý AI, tổng luận, phục chế AI
  'ocr',         // nhận dạng chữ / Hán-Nôm
  'export_pdf',  // xuất PDF / bản in chất lượng cao
  'export_data', // xuất Excel/GEDCOM/JSON
  'manage_fund', // quỹ công đức
  'media_upload',// tải ảnh/video/tài liệu
  'multi_editor',// nhiều người cùng biên tập
  'ritual_custom',// tùy biến văn khấn theo dòng họ
  'restore_photo',// studio phục chế ảnh
] as const;
export type Feature = (typeof FEATURES)[number];

export interface PlanLimit {
  /** null = không giới hạn */
  maxProjects: number | null;
  maxMembers: number | null;
  storageLimitBytes: number;
  /** số ngày hiệu lực khi kích hoạt (null = vô hạn: LIFETIME/GIFT/FREE) */
  durationDays: number | null;
  features: Feature[];
}

const MB = 1024 * 1024;
const GB = 1024 * MB;
const ALL: Feature[] = [...FEATURES];
const BASIC: Feature[] = ['media_upload', 'export_pdf']; // FREE mở tính năng cơ bản

/** Bảng giới hạn theo gói — mirror của bảng plan_limits (DB). */
export const PLAN_LIMITS: Record<Plan, PlanLimit> = {
  FREE:          { maxProjects: 1,    maxMembers: 5,    storageLimitBytes: 20 * MB, durationDays: null, features: BASIC },
  TRIAL:         { maxProjects: null, maxMembers: null, storageLimitBytes: 2 * GB,  durationDays: 30,   features: ALL },
  MONTHLY:       { maxProjects: null, maxMembers: null, storageLimitBytes: 2 * GB,  durationDays: 30,   features: ALL },
  YEARLY:        { maxProjects: null, maxMembers: null, storageLimitBytes: 5 * GB,  durationDays: 365,  features: ALL },
  LIFETIME:      { maxProjects: null, maxMembers: null, storageLimitBytes: 2 * GB,  durationDays: null, features: ALL },
  GIFT_LIFETIME: { maxProjects: null, maxMembers: null, storageLimitBytes: 2 * GB,  durationDays: null, features: ALL },
};

/** Gói không bao giờ hết hạn */
export const PERPETUAL_PLANS: Plan[] = ['FREE', 'LIFETIME', 'GIFT_LIFETIME'];

export const isValidPlan = (p: string): p is Plan => (PLANS as readonly string[]).includes(p);
