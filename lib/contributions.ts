/**
 * Tầng dữ liệu Module 6 — Quỹ công đức (server-only).
 * Đọc bảng `contributions` (Prisma) khi có DATABASE_URL; nếu chưa cấu hình
 * hoặc lỗi kết nối thì fallback dữ liệu mẫu để giao diện luôn hiển thị.
 *
 * Ghi chú nghiệp vụ: bảng contributions là khoản THU (công đức). Khoản CHI
 * (tu bổ, lễ tế) sẽ nối từ Module 5 (Tu bổ) ở bước sau — hiện dùng số tạm tính.
 */
import type { Contribution as PContribution } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface ContributionRow {
  id: string;
  date: string;          // dd/mm/yyyy
  name: string;          // người đóng góp
  purpose: string;
  amount: number;        // VND
  method: string;        // Tiền mặt | Chuyển khoản | —
}

export interface FundSummary {
  totalIn: number;
  totalOut: number;      // tạm tính từ Module Tu bổ
  balance: number;
  byPurpose: { purpose: string; total: number }[];
  source: 'db' | 'mock';
}

const hasDb = (): boolean => !!process.env.DATABASE_URL;

/* ------------------------------- Mock ---------------------------------- */
const MOCK_ROWS: ContributionRow[] = [
  { id: 'm1', date: '10/03/2025', name: 'Nguyễn Văn An', purpose: 'Ủng hộ tu bổ nhà thờ', amount: 10_000_000, method: 'Tiền mặt' },
  { id: 'm2', date: '10/03/2025', name: 'Nguyễn Thị Bình', purpose: 'Công đức mộ phần', amount: 5_000_000, method: 'Chuyển khoản' },
  { id: 'm3', date: '09/03/2025', name: 'Nguyễn Văn Cường', purpose: 'Ủng hộ quỹ khuyến học', amount: 20_000_000, method: 'Chuyển khoản' },
  { id: 'm4', date: '08/03/2025', name: 'Nguyễn Văn Dũng', purpose: 'Ủng hộ lễ giỗ tổ', amount: 2_000_000, method: 'Tiền mặt' },
  { id: 'm5', date: '02/03/2025', name: 'Trần Thị Em', purpose: 'Ủng hộ tu bổ nhà thờ', amount: 15_000_000, method: 'Chuyển khoản' },
  { id: 'm6', date: '18/02/2025', name: 'Lê Văn Phúc', purpose: 'Ủng hộ quỹ khuyến học', amount: 8_000_000, method: 'Tiền mặt' },
  { id: 'm7', date: '05/02/2025', name: 'Phạm Thị Giang', purpose: 'Công đức mộ phần', amount: 12_000_000, method: 'Chuyển khoản' },
  { id: 'm8', date: '20/01/2025', name: 'Nguyễn Văn Hòa', purpose: 'Ủng hộ lễ giỗ tổ', amount: 6_000_000, method: 'Tiền mặt' },
];
const MOCK_TOTAL_OUT = 28_000_000; // tạm tính (chi tu bổ + lễ tế)

const fmtDate = (d: Date): string => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
};

function aggregate(rows: ContributionRow[]): { purpose: string; total: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.purpose, (map.get(r.purpose) ?? 0) + r.amount);
  return [...map.entries()]
    .map(([purpose, total]) => ({ purpose, total }))
    .sort((a, b) => b.total - a.total);
}

/* --------------------------- Truy vấn chính ---------------------------- */
export async function getFund(): Promise<{ rows: ContributionRow[]; summary: FundSummary }> {
  if (hasDb()) {
    try {
      const list = (await prisma.contribution.findMany({
        orderBy: { contributedAt: 'desc' },
        include: { member: { select: { fullName: true } } },
        take: 200,
      })) as (PContribution & { member: { fullName: string } | null })[];

      const rows: ContributionRow[] = list.map((c) => ({
        id: c.id,
        date: fmtDate(c.contributedAt),
        name: c.contributorName || c.member?.fullName || 'Ẩn danh',
        purpose: c.purpose,
        amount: Number(c.amount),
        method: c.note?.trim() || '—',
      }));
      const totalIn = rows.reduce((s, r) => s + r.amount, 0);
      return {
        rows,
        summary: {
          totalIn,
          totalOut: MOCK_TOTAL_OUT,
          balance: totalIn - MOCK_TOTAL_OUT,
          byPurpose: aggregate(rows),
          source: 'db',
        },
      };
    } catch (err) {
      console.error('[contributions:getFund] fallback mock:', err);
    }
  }
  const totalIn = MOCK_ROWS.reduce((s, r) => s + r.amount, 0);
  return {
    rows: MOCK_ROWS,
    summary: {
      totalIn,
      totalOut: MOCK_TOTAL_OUT,
      balance: totalIn - MOCK_TOTAL_OUT,
      byPurpose: aggregate(MOCK_ROWS),
      source: 'mock',
    },
  };
}

/** Định dạng tiền VND rút gọn cho hiển thị */
export function formatVnd(n: number): string {
  return n.toLocaleString('vi-VN') + ' đ';
}
