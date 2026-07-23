/**
 * Can Chi, tiết khí, hoàng đạo/hắc đạo, giờ tốt, ngày lễ, chấm điểm ngày.
 * Port 1:1 từ engine đã kiểm chứng của gia-pha-app.html (unit test kèm theo).
 * Module thuần túy — không phụ thuộc DB/DOM.
 */
import { jdFromDate, solarToLunar, lunarToSolar, type LunarDate } from './lunar';

export const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'] as const;
export const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as const;

export const NAP_AM = [
  'Hải Trung Kim', 'Lư Trung Hỏa', 'Đại Lâm Mộc', 'Lộ Bàng Thổ', 'Kiếm Phong Kim',
  'Sơn Đầu Hỏa', 'Giản Hạ Thủy', 'Thành Đầu Thổ', 'Bạch Lạp Kim', 'Dương Liễu Mộc',
  'Tuyền Trung Thủy', 'Ốc Thượng Thổ', 'Tích Lịch Hỏa', 'Tùng Bách Mộc', 'Trường Lưu Thủy',
  'Sa Trung Kim', 'Sơn Hạ Hỏa', 'Bình Địa Mộc', 'Bích Thượng Thổ', 'Kim Bạch Kim',
  'Phú Đăng Hỏa', 'Thiên Hà Thủy', 'Đại Trạch Thổ', 'Thoa Xuyến Kim', 'Tang Đố Mộc',
  'Đại Khê Thủy', 'Sa Trung Thổ', 'Thiên Thượng Hỏa', 'Thạch Lựu Mộc', 'Đại Hải Thủy',
] as const;

export interface CanChi { can: string; chi: string; canIdx: number; chiIdx: number }

/** Can Chi + mệnh nạp âm của NĂM (âm lịch) */
export function canChiYear(year: number): CanChi & { menh: string; hanh: string } {
  const canIdx = (year + 6) % 10;
  const chiIdx = (year + 8) % 12;
  const menh = NAP_AM[Math.floor((((year - 4) % 60) + 60) % 60 / 2)];
  return { can: CAN[canIdx], chi: CHI[chiIdx], canIdx, chiIdx, menh, hanh: menh.split(' ').pop()! };
}

/** Can Chi của NGÀY theo JDN (kiểm chứng: 1/1/2000 = Mậu Ngọ) */
export function canChiDay(jdn: number): CanChi {
  const i = (jdn + 49) % 60;
  return { can: CAN[i % 10], chi: CHI[i % 12], canIdx: i % 10, chiIdx: i % 12 };
}

/** Can Chi của THÁNG âm lịch (Giáp/Kỷ → Bính Dần...) */
export function canChiMonth(lunarYear: number, lunarMonth: number): CanChi {
  const canIdx = (lunarYear * 12 + lunarMonth + 3) % 10;
  const chiIdx = (lunarMonth + 1) % 12;
  return { can: CAN[canIdx], chi: CHI[chiIdx], canIdx, chiIdx };
}

/** Can Chi của GIỜ (canh giờ 0-11 = Tý..Hợi) theo can ngày */
export function canChiHour(dayCanIdx: number, hourChiIdx: number): CanChi {
  const canIdx = ((dayCanIdx % 5) * 2 + hourChiIdx) % 10;
  return { can: CAN[canIdx], chi: CHI[hourChiIdx], canIdx, chiIdx: hourChiIdx };
}

/* ---------------- Tiết khí ---------------- */
export const TIET_KHI = [
  'Xuân phân', 'Thanh minh', 'Cốc vũ', 'Lập hạ', 'Tiểu mãn', 'Mang chủng',
  'Hạ chí', 'Tiểu thử', 'Đại thử', 'Lập thu', 'Xử thử', 'Bạch lộ',
  'Thu phân', 'Hàn lộ', 'Sương giáng', 'Lập đông', 'Tiểu tuyết', 'Đại tuyết',
  'Đông chí', 'Tiểu hàn', 'Đại hàn', 'Lập xuân', 'Vũ thủy', 'Kinh trập',
] as const;

function sunLongitude(jdn: number): number {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  return L - Math.PI * 2 * Math.floor(L / (Math.PI * 2));
}

/** Tên tiết khí của ngày (múi giờ +7) */
export function tietKhi(dd: number, mm: number, yy: number, tz = 7): string {
  const jdn = jdFromDate(dd, mm, yy);
  return TIET_KHI[Math.floor((sunLongitude(jdn + 1 - 0.5 - tz / 24) / Math.PI) * 12) % 24];
}

/* ---------------- Hoàng đạo / Hắc đạo ---------------- */
export const STAR_12 = [
  'Thanh Long', 'Minh Đường', 'Thiên Hình', 'Chu Tước', 'Kim Quỹ', 'Bảo Quang',
  'Bạch Hổ', 'Ngọc Đường', 'Thiên Lao', 'Huyền Vũ', 'Tư Mệnh', 'Câu Trận',
] as const;
const HOANG_DAO_POS = new Set([0, 1, 4, 5, 7, 10]);

/** Sao ngày theo tháng âm (Thanh Long khởi): tháng 1&7 tại Tý, 2&8 tại Dần... */
export function dayStar(lunarMonth: number, dayChiIdx: number): { name: string; hoangDao: boolean } {
  const start = ((lunarMonth - 1) % 6) * 2;
  const pos = (dayChiIdx - start + 12) % 12;
  return { name: STAR_12[pos], hoangDao: HOANG_DAO_POS.has(pos) };
}

/** Giờ hoàng đạo theo chi NGÀY (6 nhóm) — trả về mảng chỉ số chi giờ */
const GIO_HD: Record<number, number[]> = {
  0: [0, 1, 3, 6, 8, 9], 1: [2, 3, 5, 8, 10, 11], 2: [0, 1, 4, 5, 7, 10],
  3: [0, 2, 3, 6, 7, 9], 4: [2, 4, 5, 8, 9, 11], 5: [1, 4, 6, 7, 10, 11],
};
export const GIO_RANGE = ['23–01', '01–03', '03–05', '05–07', '07–09', '09–11', '11–13', '13–15', '15–17', '17–19', '19–21', '21–23'] as const;
export function gioHoangDao(dayChiIdx: number): number[] { return GIO_HD[dayChiIdx % 6]; }

/* ---------------- Lễ ---------------- */
export const LE_AM: ReadonlyArray<readonly [number, number, string]> = [
  [1, 1, 'Tết Nguyên Đán'], [15, 1, 'Rằm tháng Giêng'], [3, 3, 'Tết Hàn thực'],
  [10, 3, 'Giỗ Tổ Hùng Vương'], [15, 4, 'Lễ Phật Đản'], [5, 5, 'Tết Đoan Ngọ'],
  [15, 7, 'Lễ Vu Lan'], [15, 8, 'Tết Trung Thu'], [9, 9, 'Tết Trùng Cửu'], [23, 12, 'Ông Công Ông Táo'],
];
export const LE_DUONG: ReadonlyArray<readonly [number, number, string]> = [
  [1, 1, 'Tết Dương lịch'], [30, 4, 'Giải phóng miền Nam'], [1, 5, 'Quốc tế Lao động'],
  [2, 9, 'Quốc khánh'], [8, 3, 'Quốc tế Phụ nữ'], [20, 10, 'Phụ nữ Việt Nam'], [20, 11, 'Nhà giáo Việt Nam'],
];

/* ---------------- Thông tin ngày tổng hợp ---------------- */
export interface DayInfo {
  solar: { d: number; m: number; y: number; weekday: number };
  lunar: LunarDate;
  namCC: ReturnType<typeof canChiYear>;
  thangCC: CanChi;
  ngayCC: CanChi;
  star: { name: string; hoangDao: boolean };
  gioTot: number[];
  gioXau: number[];
  tietKhi: string;
  leAm?: string;
  leDuong?: string;
  tamNuong: boolean;
  nguyetKy: boolean;
}

export function dayInfo(date: Date): DayInfo {
  const d = date.getDate(), m = date.getMonth() + 1, y = date.getFullYear();
  const lunar = solarToLunar(d, m, y);
  const jdn = jdFromDate(d, m, y);
  const ngayCC = canChiDay(jdn);
  const gioTot = gioHoangDao(ngayCC.chiIdx);
  return {
    solar: { d, m, y, weekday: date.getDay() },
    lunar,
    namCC: canChiYear(lunar.year),
    thangCC: canChiMonth(lunar.year, lunar.month),
    ngayCC,
    star: dayStar(lunar.month, ngayCC.chiIdx),
    gioTot,
    gioXau: Array.from({ length: 12 }, (_, i) => i).filter((i) => !gioTot.includes(i)),
    tietKhi: tietKhi(d, m, y),
    leAm: LE_AM.find((x) => x[0] === lunar.day && x[1] === lunar.month && !lunar.isLeapMonth)?.[2],
    leDuong: LE_DUONG.find((x) => x[0] === d && x[1] === m)?.[2],
    tamNuong: [3, 7, 13, 18, 22, 27].includes(lunar.day),
    nguyetKy: [5, 14, 23].includes(lunar.day),
  };
}

/* ---------------- Chấm điểm ngày theo mục đích (lệ dân gian phổ thông) ---------------- */
export type Purpose = 'cuoi' | 'dongtho' | 'nhaptrach' | 'khaitruong' | 'kyket' | 'xuathanh' | 'muaxe' | 'muanha' | 'tele' | 'antang';
export const PURPOSES: ReadonlyArray<readonly [Purpose, string]> = [
  ['cuoi', '💍 Cưới hỏi'], ['dongtho', '🏗 Động thổ'], ['nhaptrach', '🏠 Về nhà mới'],
  ['khaitruong', '🎉 Khai trương'], ['kyket', '🤝 Ký kết hợp đồng'], ['xuathanh', '✈️ Xuất hành'],
  ['muaxe', '🚗 Mua xe'], ['muanha', '🏡 Mua nhà'], ['tele', '🙏 Tế lễ tổ tiên'], ['antang', '⚰️ An táng'],
];

export interface DayRating { score: number; label: string; reasons: string[] }

export function rateDay(date: Date, purpose: Purpose): DayRating {
  const i = dayInfo(date);
  let score = 5;
  const reasons: string[] = [];
  if (i.star.hoangDao) { score += 3; reasons.push(`Ngày hoàng đạo (${i.star.name}) — thuận cho việc lành`); }
  else { score -= 2; reasons.push(`Ngày hắc đạo (${i.star.name}) — dân gian thường tránh việc lớn`); }
  if (i.tamNuong) { score -= 2; reasons.push(`Ngày Tam nương (âm ${i.lunar.day}) — kiêng khởi sự`); }
  if (i.nguyetKy) { score -= 2; reasons.push(`Ngày Nguyệt kỵ (âm ${i.lunar.day}) — "mùng năm, mười bốn, hăm ba"`); }
  if (purpose === 'cuoi' && i.lunar.month === 7) { score -= 1; reasons.push('Tháng 7 âm — dân gian ít cưới hỏi'); }
  score = Math.max(0, Math.min(10, score));
  const label = score >= 8 ? 'Rất tốt' : score >= 6 ? 'Tốt' : score >= 4 ? 'Bình thường' : 'Nên tránh';
  return { score, label, reasons };
}

export { lunarToSolar, solarToLunar };
