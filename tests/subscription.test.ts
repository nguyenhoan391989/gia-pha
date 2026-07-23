import { PLAN_LIMITS } from '../lib/subscription/plans';
import { permissionsFor, effectivePlan, type SubscriptionCtx } from '../lib/subscription/permissions';

const now = new Date('2026-07-20T00:00:00Z');
const inDays = (d: number) => new Date(now.getTime() + d * 86400000);

describe('effectivePlan (đọc-thời-điểm)', () => {
  test('LIFETIME/GIFT không bao giờ hết hạn', () => {
    expect(effectivePlan({ plan: 'LIFETIME', status: 'ACTIVE', expireDate: null }, now)).toBe('LIFETIME');
    expect(effectivePlan({ plan: 'GIFT_LIFETIME', status: 'ACTIVE', expireDate: null }, now)).toBe('GIFT_LIFETIME');
  });
  test('TRIAL còn hạn → TRIAL; quá hạn → FREE', () => {
    expect(effectivePlan({ plan: 'TRIAL', status: 'ACTIVE', expireDate: inDays(5) }, now)).toBe('TRIAL');
    expect(effectivePlan({ plan: 'TRIAL', status: 'ACTIVE', expireDate: inDays(-1) }, now)).toBe('FREE');
  });
  test('status EXPIRED/CANCELLED → FREE', () => {
    expect(effectivePlan({ plan: 'YEARLY', status: 'EXPIRED', expireDate: inDays(-1) }, now)).toBe('FREE');
    expect(effectivePlan({ plan: 'MONTHLY', status: 'CANCELLED', expireDate: inDays(9) }, now)).toBe('FREE');
  });
});

describe('PermissionService — không hardcode gói', () => {
  const free: SubscriptionCtx = { plan: 'FREE', status: 'ACTIVE', expireDate: null };
  const trial: SubscriptionCtx = { plan: 'TRIAL', status: 'ACTIVE', expireDate: inDays(10) };

  test('FREE: mở tính năng cơ bản, khóa AI/OCR/quỹ', () => {
    const p = permissionsFor(free, now);
    expect(p.canUploadMedia()).toBe(true);
    expect(p.canExportPDF()).toBe(true);
    expect(p.canUseAI()).toBe(false);
    expect(p.canUseOCR()).toBe(false);
    expect(p.canManageFund()).toBe(false);
  });
  test('TRIAL: full tính năng', () => {
    const p = permissionsFor(trial, now);
    expect(p.canUseAI()).toBe(true);
    expect(p.canUseOCR()).toBe(true);
    expect(p.canManageFund()).toBe(true);
    expect(p.canRestorePhoto()).toBe(true);
  });

  test('giới hạn FREE: 5 thành viên, 20MB, 1 project', () => {
    const p = permissionsFor(free, now);
    expect(p.getMaxMembers()).toBe(5);
    expect(p.getStorageLimit()).toBe(20 * 1024 * 1024);
    expect(p.canCreateMember({ members: 4 })).toBe(true);
    expect(p.canCreateMember({ members: 5 })).toBe(false);
    expect(p.canCreateProject({ projects: 1 })).toBe(false);
  });
  test('TRIAL: không giới hạn thành viên (null = vô hạn)', () => {
    const p = permissionsFor(trial, now);
    expect(p.getMaxMembers()).toBeNull();
    expect(p.canCreateMember({ members: 999 })).toBe(true);
  });

  test('gói hết hạn tự áp giới hạn FREE (đọc-thời-điểm)', () => {
    const expired: SubscriptionCtx = { plan: 'YEARLY', status: 'ACTIVE', expireDate: inDays(-1) };
    const p = permissionsFor(expired, now);
    expect(p.plan).toBe('FREE');
    expect(p.canUseAI()).toBe(false);
    expect(p.getMaxMembers()).toBe(5);
  });

  test('storage: chặn upload khi vượt hạn mức', () => {
    const p = permissionsFor(free, now);
    const usage = { storageUsedBytes: 19 * 1024 * 1024 };
    expect(p.canUploadBytes(usage, 1 * 1024 * 1024)).toBe(true);
    expect(p.canUploadBytes(usage, 5 * 1024 * 1024)).toBe(false);
  });

  test('LIFETIME và GIFT_LIFETIME có quyền/giới hạn giống nhau', () => {
    expect(PLAN_LIMITS.LIFETIME).toEqual(PLAN_LIMITS.GIFT_LIFETIME);
  });
});
