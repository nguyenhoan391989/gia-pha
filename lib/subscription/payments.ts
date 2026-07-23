/**
 * Domain: Subscription — PAYMENT INTERFACE (chuẩn bị cho tương lai).
 * Hiện CHƯA tích hợp cổng nào. Chỉ định nghĩa interface + registry để sau này
 * cắm Google Play Billing / Apple IAP / Stripe / VNPay / MoMo / ZaloPay
 * mà KHÔNG sửa nghiệp vụ. Nghiệp vụ chỉ gọi PaymentProvider, không biết cổng cụ thể.
 */
import type { Plan } from './plans';

export const PAYMENT_PROVIDERS = ['google_play', 'apple_iap', 'stripe', 'vnpay', 'momo', 'zalopay', 'manual'] as const;
export type PaymentProviderId = (typeof PAYMENT_PROVIDERS)[number];

export const PAYMENT_SOURCES = ['store', 'web', 'admin_gift', 'trial'] as const;
export type PaymentSource = (typeof PAYMENT_SOURCES)[number];

/** Yêu cầu khởi tạo một giao dịch mua gói cho 1 Project */
export interface CheckoutRequest {
  projectId: string;
  plan: Plan;
  provider: PaymentProviderId;
  /** id sản phẩm phía cổng (SKU Google/Apple, mã gói VNPay…) */
  productId?: string;
  returnUrl?: string;
}

/** Kết quả khởi tạo — tùy cổng: redirect URL, token client, hoặc chờ webhook */
export interface CheckoutResult {
  provider: PaymentProviderId;
  redirectUrl?: string;
  clientToken?: string;
  pendingTransactionId?: string;
}

/** Sự kiện xác nhận thanh toán (webhook cổng gọi về, đã chuẩn hóa) */
export interface PaymentEvent {
  provider: PaymentProviderId;
  transactionId: string;
  projectId: string;
  plan: Plan;
  paidAt: Date;
  /** dữ liệu thô để đối soát/thống kê */
  raw?: unknown;
}

/** Hợp đồng mọi cổng thanh toán phải tuân theo */
export interface PaymentProvider {
  readonly id: PaymentProviderId;
  /** khởi tạo giao dịch (redirect / token) */
  createCheckout(req: CheckoutRequest): Promise<CheckoutResult>;
  /** xác minh webhook/biên nhận → PaymentEvent chuẩn hóa (idempotent theo transactionId) */
  verify(payload: unknown, headers?: Record<string, string>): Promise<PaymentEvent>;
}

/** Registry — cổng tự đăng ký, nghiệp vụ lấy qua getProvider(). */
const registry = new Map<PaymentProviderId, PaymentProvider>();
export function registerProvider(p: PaymentProvider): void { registry.set(p.id, p); }
export function getProvider(id: PaymentProviderId): PaymentProvider {
  const p = registry.get(id);
  if (!p) throw new Error(`Chưa cấu hình cổng thanh toán: ${id}`);
  return p;
}
export function hasProvider(id: PaymentProviderId): boolean { return registry.has(id); }
export function listProviders(): PaymentProviderId[] { return [...registry.keys()]; }

// Chưa cổng nào được đăng ký. Khi tích hợp, tạo file provider riêng
// (vd payments/providers/stripe.ts) và gọi registerProvider(...) lúc khởi động server.
