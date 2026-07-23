/**
 * Domain: Subscription — DỊCH VỤ NGHIỆP VỤ (dùng Prisma).
 * Điều phối vòng đời gói: tạo Project → tự tạo FREE, kích hoạt Trial (1 lần),
 * Admin tặng GIFT_LIFETIME, đổi gói sau thanh toán, hết hạn Trial → FREE.
 * Toàn bộ suy ra giới hạn từ PLAN_LIMITS, không hardcode điều kiện.
 */
import { prisma } from '@/lib/prisma';
import { PLAN_LIMITS, PERPETUAL_PLANS, type Plan } from './plans';
import { permissionsFor, type SubscriptionCtx } from './permissions';
import type { PaymentProviderId, PaymentSource } from './payments';

/** Ngày hết hạn theo gói tính từ mốc kích hoạt (null = vô hạn) */
export function computeExpireDate(plan: Plan, from: Date = new Date()): Date | null {
  const days = PLAN_LIMITS[plan].durationDays;
  if (days === null) return null;
  return new Date(from.getTime() + days * 86400000);
}

/** Đọc gói đang hiệu lực của 1 project (kèm PermissionService sẵn dùng) */
export async function loadPermissions(projectId: string, now: Date = new Date()) {
  const sub = await prisma.subscription.findFirst({
    where: { projectId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });
  const ctx: SubscriptionCtx = sub
    ? { plan: sub.plan as Plan, status: sub.status as SubscriptionCtx['status'], expireDate: sub.expireDate }
    : { plan: 'FREE', status: 'ACTIVE', expireDate: null };
  return permissionsFor(ctx, now);
}

/**
 * Tạo Project mới. Subscription FREE do TRIGGER DB tự tạo (xem migration:
 * trg_project_free_subscription) — đảm bảo cả khi insert trực tiếp cũng có gói FREE.
 * Ở đây chỉ tạo project rồi đọc lại gói FREE mà trigger vừa gắn.
 */
export async function createProjectWithFreeSubscription(input: { ownerId: string; name: string }) {
  return prisma.$transaction(async (tx: typeof prisma) => {
    const created = await tx.project.create({ data: { ownerId: input.ownerId, name: input.name } });
    const subscription = await tx.subscription.findFirst({ where: { projectId: created.id }, orderBy: { createdAt: 'desc' } });
    const project = await tx.project.findUnique({ where: { id: created.id } });
    return { project, subscription };
  });
}

/** Kích hoạt Trial — CHỈ 1 LẦN cho mỗi project. Trả về lỗi nếu đã từng dùng Trial. */
export async function activateTrial(projectId: string) {
  const used = await prisma.subscription.findFirst({ where: { projectId, plan: 'TRIAL' } });
  if (used) throw new Error('Project này đã dùng bản dùng thử (Trial) rồi.');
  return switchPlan({ projectId, plan: 'TRIAL', source: 'trial' });
}

/** Admin tặng trọn đời — không cần thanh toán. Quyền giống LIFETIME. */
export async function giftLifetime(projectId: string, note = 'Admin cấp trọn đời') {
  return switchPlan({ projectId, plan: 'GIFT_LIFETIME', source: 'admin_gift', notes: note });
}

/** Đổi gói (dùng sau khi thanh toán thành công, hoặc trial/gift). Ghi lịch sử + cập nhật con trỏ. */
export async function switchPlan(input: {
  projectId: string; plan: Plan; source: PaymentSource;
  provider?: PaymentProviderId; transactionId?: string; notes?: string; from?: Date;
}) {
  const from = input.from ?? new Date();
  const expire = computeExpireDate(input.plan, from);
  return prisma.$transaction(async (tx: typeof prisma) => {
    // đóng gói cũ đang active
    await tx.subscription.updateMany({ where: { projectId: input.projectId, status: 'ACTIVE' }, data: { status: 'CANCELLED', updatedAt: new Date() } });
    const sub = await tx.subscription.create({
      data: {
        projectId: input.projectId, plan: input.plan, status: 'ACTIVE',
        startDate: from, expireDate: expire, activatedAt: from,
        paymentSource: input.source, paymentProvider: input.provider ?? null,
        transactionId: input.transactionId ?? null, notes: input.notes ?? null,
      },
    });
    const storage = PLAN_LIMITS[input.plan].storageLimitBytes;
    await tx.project.update({ where: { id: input.projectId }, data: { subscriptionId: sub.id, storageLimit: BigInt(storage) } });
    return sub;
  });
}

/** Cron/định kỳ: Trial/Monthly/Yearly hết hạn → EXPIRED (đọc-thời-điểm đã tụt FREE sẵn). */
export async function expireOverdueSubscriptions(now: Date = new Date()) {
  const perpetual = PERPETUAL_PLANS;
  const res = await prisma.subscription.updateMany({
    where: { status: 'ACTIVE', plan: { notIn: perpetual }, expireDate: { lt: now } },
    data: { status: 'EXPIRED', updatedAt: now },
  });
  return res.count;
}
