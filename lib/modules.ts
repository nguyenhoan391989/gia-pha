/**
 * Tầng dữ liệu cho các module: Nhà thờ họ, Mộ phần, Tu bổ, Thông báo (server-only).
 * - Nhà thờ họ đọc bảng `family_records` (đã có) khi có DB; fallback mock.
 * - Thông báo: đếm thêm đề xuất chờ duyệt từ `edit_suggestions` nếu có DB.
 * - Mộ phần / Tu bổ: hiện dùng mock (bảng DB sẽ thêm qua migration an toàn ở bước sau).
 */
import type { FamilyRecord as PRecord } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const hasDb = (): boolean => !!process.env.DATABASE_URL;

/* =============================== Nhà thờ họ ============================= */
export interface HeritageDoc { type: string; title: string; excerpt: string }
export interface Heritage {
  info: { name: string; address: string; built: string; restored: string; area: string };
  intro: string;
  docs: HeritageDoc[];       // lịch sử, gia huấn, sắc phong, thủy tổ...
  source: 'db' | 'mock';
}

const RECORD_LABEL: Record<string, string> = {
  pha_ky: 'Phả ký · Lịch sử', ngoai_pha: 'Ngoại phả', gia_huan: 'Gia huấn · Gia quy', van_te: 'Văn tế',
};

const MOCK_HERITAGE: Heritage = {
  info: {
    name: 'Nhà thờ Họ Nguyễn', address: 'Thôn Đông, Xã An Hòa, Huyện An Dương, Hải Phòng',
    built: '1802', restored: '2018', area: '1200 m²',
  },
  intro:
    'Nhà thờ Họ Nguyễn là nơi thờ tự tổ tiên, gìn giữ gia phả, sắc phong và các giá trị truyền thống của dòng họ. ' +
    'Công trình được khởi dựng năm 1802, trùng tu gần nhất năm 2018, là điểm tựa tinh thần kết nối con cháu muôn phương.',
  docs: [
    { type: 'pha_ky', title: 'Lịch sử dòng họ', excerpt: 'Dòng họ Nguyễn khởi nguồn từ vị Thủy tổ Nguyễn Hữu Công, trải 12 đời gây dựng và phát triển.' },
    { type: 'van_te', title: 'Câu chuyện Thủy tổ', excerpt: 'Thủy tổ Nguyễn Hữu Công khai cơ lập ấp, đặt nền móng đạo lý hiếu nghĩa cho con cháu đời sau.' },
    { type: 'gia_huan', title: 'Gia huấn – Gia quy', excerpt: 'Kính tổ tiên, hiếu cha mẹ, thuận anh em, chăm học hành, giữ nếp nhà, sống nhân nghĩa.' },
    { type: 'ngoai_pha', title: 'Sắc phong triều Nguyễn', excerpt: 'Dòng họ còn lưu giữ nhiều sắc phong quý được ban dưới triều Nguyễn.' },
  ],
  source: 'mock',
};

export async function getHeritage(): Promise<Heritage> {
  if (hasDb()) {
    try {
      const rows = (await prisma.familyRecord.findMany({
        orderBy: { updatedAt: 'desc' }, take: 30,
      })) as PRecord[];
      if (rows.length) {
        const strip = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return {
          ...MOCK_HERITAGE,
          docs: rows.map((r) => ({
            type: r.recordType,
            title: r.title || RECORD_LABEL[r.recordType] || 'Tài liệu',
            excerpt: strip(r.content).slice(0, 160) || RECORD_LABEL[r.recordType] || '',
          })),
          source: 'db',
        };
      }
    } catch (err) {
      console.error('[modules:getHeritage] fallback mock:', err);
    }
  }
  return MOCK_HERITAGE;
}

/* ================================ Mộ phần ============================== */
export interface Grave {
  id: string; name: string; area: string; year: string; status: 'Tốt' | 'Cần tu sửa';
}
export function getGraves(): Grave[] {
  return [
    { id: 'g1', name: 'Nguyễn Văn An', area: 'Khu 1', year: '1990', status: 'Tốt' },
    { id: 'g2', name: 'Nguyễn Văn Bình', area: 'Khu 1', year: '1985', status: 'Tốt' },
    { id: 'g3', name: 'Nguyễn Văn Cường', area: 'Khu 2', year: '2001', status: 'Cần tu sửa' },
    { id: 'g4', name: 'Nguyễn Văn Dũng', area: 'Khu 2', year: '1975', status: 'Tốt' },
    { id: 'g5', name: 'Nguyễn Thị Em', area: 'Khu 3', year: '2010', status: 'Tốt' },
    { id: 'g6', name: 'Nguyễn Văn Phúc', area: 'Khu 3', year: '1998', status: 'Cần tu sửa' },
  ];
}

/* ============================== Tu bổ ================================== */
export interface RestorationItem {
  id: string; name: string; budget: number; spent: number; progress: number; status: string;
}
export interface Restoration {
  totalItems: number; inProgress: number; done: number; totalBudget: number; totalSpent: number;
  items: RestorationItem[];
}
export function getRestoration(): Restoration {
  const items: RestorationItem[] = [
    { id: 'r1', name: 'Tu bổ mái nhà thờ chính', budget: 300_000_000, spent: 200_000_000, progress: 70, status: 'Đang thực hiện' },
    { id: 'r2', name: 'Sơn mới nhà thờ', budget: 150_000_000, spent: 80_000_000, progress: 50, status: 'Đang thực hiện' },
    { id: 'r3', name: 'Lát sân', budget: 200_000_000, spent: 120_000_000, progress: 60, status: 'Đang thực hiện' },
    { id: 'r4', name: 'Xây tường bao', budget: 150_000_000, spent: 0, progress: 0, status: 'Chưa thực hiện' },
    { id: 'r5', name: 'Hệ thống điện, chiếu sáng', budget: 100_000_000, spent: 50_000_000, progress: 40, status: 'Đang thực hiện' },
    { id: 'r6', name: 'Sơn hoành phi câu đối', budget: 250_000_000, spent: 200_000_000, progress: 80, status: 'Đang thực hiện' },
  ];
  return {
    totalItems: items.length,
    inProgress: items.filter((i) => i.status === 'Đang thực hiện').length,
    done: items.filter((i) => i.progress >= 100).length,
    totalBudget: items.reduce((s, i) => s + i.budget, 0),
    totalSpent: items.reduce((s, i) => s + i.spent, 0),
    items,
  };
}

/* ============================== Thông báo ============================== */
export interface Notice { date: string; title: string; tag: string }
export interface Notifications { notices: Notice[]; pending: number; source: 'db' | 'mock' }

const MOCK_NOTICES: Notice[] = [
  { date: '02/07/2025', title: 'Thông báo họp họ định kỳ tháng 6 âm lịch', tag: 'Thông báo' },
  { date: '28/06/2025', title: 'Giới thiệu xuất đinh mới: Nguyễn Minh Đức', tag: 'Xuất đinh' },
  { date: '20/06/2025', title: 'Đề xuất sửa thông tin: Nguyễn Văn An', tag: 'Đề xuất' },
  { date: '15/06/2025', title: 'Thông báo trùng tu nhà thờ họ', tag: 'Thông báo' },
];

export async function getNotifications(): Promise<Notifications> {
  if (hasDb()) {
    try {
      const pending = await prisma.editSuggestion.count({ where: { status: 'pending' } });
      return { notices: MOCK_NOTICES, pending, source: 'db' };
    } catch (err) {
      console.error('[modules:getNotifications] fallback mock:', err);
    }
  }
  return { notices: MOCK_NOTICES, pending: 2, source: 'mock' };
}

/** Định dạng tiền VND */
export const vnd = (n: number): string => n.toLocaleString('vi-VN') + ' đ';
