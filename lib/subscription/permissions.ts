/**
 * Domain: Subscription — PERMISSION SERVICE.
 * Mọi UI & API gọi qua service này. KHÔNG viết if(plan==='LIFETIME') ở nơi khác.
 * Thuần túy: nhận ngữ cảnh (gói + trạng thái + hạn + số liệu dùng), trả quyền/giới hạn.
 */
import { PLAN_LIMITS, PERPETUAL_PLANS, type Plan, type Feature, type SubStatus, type PlanLimit } from './plans';

export interface SubscriptionCtx {
  plan: Plan;
  status: SubStatus;
  expireDate: Date | null;
}

/** Số liệu sử dụng hiện tại của một Project (để so với giới hạn) */
export interface Usage {
  members: number;
  projects: number;
  storageUsedBytes: number;
}

/**
 * Gói HIỆU LỰC tại thời điểm `now`. Hết hạn / bị hủy → tụt về FREE.
 * (Đây là lớp phòng thủ đọc-thời-điểm; cron cũng sẽ đổi status → EXPIRED.)
 */
export function effectivePlan(ctx: SubscriptionCtx, now: Date = new Date()): Plan {
  if (ctx.status === 'CANCELLED') return 'FREE';
  if (PERPETUAL_PLANS.includes(ctx.plan)) return ctx.plan;
  if (ctx.status === 'EXPIRED') return 'FREE';
  if (ctx.expireDate && ctx.expireDate.getTime() <= now.getTime()) return 'FREE';
  return ctx.plan;
}

function limitsOf(ctx: SubscriptionCtx, now?: Date): PlanLimit {
  return PLAN_LIMITS[effectivePlan(ctx, now)];
}

/** Cổng quyền — tạo từ một SubscriptionCtx; toàn app dùng object này. */
export class PermissionService {
  constructor(private ctx: SubscriptionCtx, private now: Date = new Date()) {}

  get plan(): Plan { return effectivePlan(this.ctx, this.now); }
  private lim(): PlanLimit { return limitsOf(this.ctx, this.now); }

  /* ---- tính năng ---- */
  has(feature: Feature): boolean { return this.lim().features.includes(feature); }
  canUseAI(): boolean { return this.has('ai'); }
  canUseOCR(): boolean { return this.has('ocr'); }
  canExportPDF(): boolean { return this.has('export_pdf'); }
  canExportData(): boolean { return this.has('export_data'); }
  canManageFund(): boolean { return this.has('manage_fund'); }
  canUploadMedia(): boolean { return this.has('media_upload'); }
  canRestorePhoto(): boolean { return this.has('restore_photo'); }
  canCustomizeRitual(): boolean { return this.has('ritual_custom'); }
  canMultiEdit(): boolean { return this.has('multi_editor'); }

  /* ---- giới hạn số lượng ---- */
  getMaxMembers(): number | null { return this.lim().maxMembers; }
  getMaxProjects(): number | null { return this.lim().maxProjects; }
  getStorageLimit(): number { return this.lim().storageLimitBytes; }

  /* ---- kiểm tra theo mức dùng hiện tại ---- */
  canCreateMember(usage: Pick<Usage, 'members'>): boolean {
    const max = this.getMaxMembers();
    return max === null || usage.members < max;
  }
  canCreateProject(usage: Pick<Usage, 'projects'>): boolean {
    const max = this.getMaxProjects();
    return max === null || usage.projects < max;
  }
  canUploadBytes(usage: Pick<Usage, 'storageUsedBytes'>, addBytes: number): boolean {
    return usage.storageUsedBytes + addBytes <= this.getStorageLimit();
  }
  remainingStorage(usage: Pick<Usage, 'storageUsedBytes'>): number {
    return Math.max(0, this.getStorageLimit() - usage.storageUsedBytes);
  }

  /** Snapshot để trả cho client hiển thị (UI cũng chỉ đọc từ đây) */
  snapshot() {
    const l = this.lim();
    return {
      plan: this.plan,
      features: l.features,
      maxMembers: l.maxMembers,
      maxProjects: l.maxProjects,
      storageLimit: l.storageLimitBytes,
    };
  }
}

export function permissionsFor(ctx: SubscriptionCtx, now?: Date): PermissionService {
  return new PermissionService(ctx, now);
}
