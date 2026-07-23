/**
 * Huyền học & văn hóa: thần số học, cung phi bát trạch, sao chiếu mệnh, nét con giáp.
 * Port từ engine đã kiểm chứng của gia-pha-app.html. Thuần túy, có unit test.
 * Mọi kết quả mang tính THAM KHẢO VĂN HÓA — luôn hiển thị kèm HV_DISCLAIMER.
 */
import { CHI, canChiYear } from './can-chi';

export const HV_DISCLAIMER =
  'Thông tin chỉ mang tính tham khảo, phục vụ nghiên cứu văn hóa và phát triển bản thân, không phải kết luận khoa học hay dự đoán chắc chắn.';

/* ---------------- Thần số học (Pythagorean) ---------------- */
export function stripVN(s: string): string {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

export function numRed(n: number): number {
  while (n > 9 && n !== 11 && n !== 22) n = String(n).split('').reduce((a, c) => a + +c, 0);
  return n;
}

export const NUM_MEANING: Record<number, string> = {
  1: 'độc lập, tiên phong, có tố chất thủ lĩnh', 2: 'hòa nhã, giỏi kết nối, trọng tình cảm',
  3: 'sáng tạo, giao tiếp tốt, lạc quan', 4: 'thực tế, kỷ luật, nền tảng vững',
  5: 'ưa tự do, thích thay đổi, thích nghi nhanh', 6: 'trách nhiệm, yêu gia đình, hay che chở',
  7: 'sâu sắc, ham học hỏi, thiên về nghiên cứu', 8: 'tham vọng, giỏi quản trị, mạnh về vật chất',
  9: 'nhân ái, bao dung, sống vì cộng đồng', 11: 'trực giác mạnh, truyền cảm hứng',
  22: 'kiến tạo lớn, biến ý tưởng thành hiện thực',
};

const LETTER_MAP: Record<string, number> = {
  a: 1, j: 1, s: 1, b: 2, k: 2, t: 2, c: 3, l: 3, u: 3, d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5, f: 6, o: 6, x: 6, g: 7, p: 7, y: 7, h: 8, q: 8, z: 8, i: 9, r: 9,
};

export interface Numerology { lifePath: number | null; soul: number | null; expression: number | null; personalYear: number | null }

const digitSum = (s: string) => s.split('').reduce((a, c) => a + (+c || 0), 0);

/** birth dạng {d,m,y} — thiếu thì các chỉ số phụ thuộc ngày trả null */
export function numerology(fullName: string, birth?: { d: number; m: number; y: number }, currentYear?: number): Numerology {
  const name = stripVN(fullName).toLowerCase().replace(/[^a-z]/g, '');
  let all = 0, soul = 0;
  for (const c of name) { const v = LETTER_MAP[c] || 0; all += v; if ('aeiou'.includes(c)) soul += v; }
  const lifePath = birth ? numRed(digitSum('' + birth.d) + digitSum('' + birth.m) + digitSum('' + birth.y)) : null;
  const personalYear = birth && currentYear ? numRed(digitSum('' + birth.d) + digitSum('' + birth.m) + digitSum('' + currentYear)) : null;
  return { lifePath, soul: soul ? numRed(soul) : null, expression: all ? numRed(all) : null, personalYear };
}

/* ---------------- Cung phi bát trạch ---------------- */
export const QUAI: Record<number, readonly [string, string, string]> = {
  1: ['Khảm', 'Thủy', 'Đông tứ mệnh'], 2: ['Khôn', 'Thổ', 'Tây tứ mệnh'], 3: ['Chấn', 'Mộc', 'Đông tứ mệnh'],
  4: ['Tốn', 'Mộc', 'Đông tứ mệnh'], 6: ['Càn', 'Kim', 'Tây tứ mệnh'], 7: ['Đoài', 'Kim', 'Tây tứ mệnh'],
  8: ['Cấn', 'Thổ', 'Tây tứ mệnh'], 9: ['Ly', 'Hỏa', 'Đông tứ mệnh'],
};
/** 4 hướng tốt [Sinh khí, Thiên y, Diên niên, Phục vị] theo quái */
export const HUONG_TOT: Record<string, readonly string[]> = {
  'Khảm': ['Đông Nam', 'Đông', 'Nam', 'Bắc'], 'Ly': ['Đông', 'Đông Nam', 'Bắc', 'Nam'],
  'Chấn': ['Nam', 'Bắc', 'Đông Nam', 'Đông'], 'Tốn': ['Bắc', 'Nam', 'Đông', 'Đông Nam'],
  'Càn': ['Tây', 'Đông Bắc', 'Tây Nam', 'Tây Bắc'], 'Khôn': ['Đông Bắc', 'Tây', 'Tây Bắc', 'Tây Nam'],
  'Cấn': ['Tây Nam', 'Tây Bắc', 'Tây', 'Đông Bắc'], 'Đoài': ['Tây Bắc', 'Tây Nam', 'Đông Bắc', 'Tây'],
};
export const MAU_HANH: Record<string, readonly [string, string]> = {
  'Kim': ['trắng, xám, ánh kim', 'vàng, nâu đất (Thổ sinh Kim)'],
  'Mộc': ['xanh lá', 'đen, xanh dương (Thủy sinh Mộc)'],
  'Thủy': ['đen, xanh dương', 'trắng, xám (Kim sinh Thủy)'],
  'Hỏa': ['đỏ, cam, tím', 'xanh lá (Mộc sinh Hỏa)'],
  'Thổ': ['vàng, nâu', 'đỏ, hồng (Hỏa sinh Thổ)'],
};
export const HANH_GOI_Y: Record<string, string> = {
  'Kim': 'tư duy mạch lạc, hợp các việc cần kỷ luật, chuẩn xác (kỹ thuật, tài chính, quản lý)',
  'Mộc': 'sáng tạo, phát triển, hợp giáo dục, thiết kế, nông – lâm, khởi sự',
  'Thủy': 'linh hoạt, giao tiếp, hợp truyền thông, thương mại, ngoại giao, nghiên cứu',
  'Hỏa': 'nhiệt huyết, truyền cảm hứng, hợp nghệ thuật, diễn thuyết, công nghệ năng lượng',
  'Thổ': 'vững vàng, đáng tin, hợp xây dựng, bất động sản, hậu cần, chăm sóc cộng đồng',
};

export function cungPhi(year: number, gender: 'Nam' | 'Nữ'): readonly [string, string, string] {
  let r = numRed(String(year).split('').reduce((a, c) => a + +c, 0));
  while (r > 9) r = numRed(r);
  let c = gender === 'Nữ' ? (4 + r) % 9 : (11 - r) % 9;
  if (c === 0) c = 9;
  if (c === 5) c = gender === 'Nữ' ? 8 : 2;
  return QUAI[c];
}

/* ---------------- Sao chiếu mệnh (cửu diệu) ---------------- */
const SAO_NAM = ['La Hầu', 'Thổ Tú', 'Thủy Diệu', 'Thái Bạch', 'Thái Dương', 'Vân Hớn', 'Kế Đô', 'Thái Âm', 'Mộc Đức'];
const SAO_NU = ['Kế Đô', 'Vân Hớn', 'Mộc Đức', 'Thái Âm', 'Thổ Tú', 'La Hầu', 'Thái Dương', 'Thái Bạch', 'Thủy Diệu'];
export const SAO_Y: Record<string, string> = {
  'La Hầu': 'văn hóa gắn với lời nói, giấy tờ — nên cẩn trọng phát ngôn, giữ hồ sơ ngăn nắp',
  'Thổ Tú': 'gắn với đi lại, nhà đất — nên sắp xếp việc di chuyển chu đáo, kiểm tra nhà cửa',
  'Thủy Diệu': 'gắn với cảm xúc, sông nước — nên giữ tinh thần thư thái, chú ý an toàn khi bơi lội',
  'Thái Bạch': 'gắn với chi tiêu — nên quản lý tài chính chặt chẽ, tránh quyết định vội',
  'Thái Dương': 'gắn với quý nhân, công việc — thuận cho giao tiếp, mở rộng quan hệ',
  'Vân Hớn': 'gắn với nóng nảy — nên rèn bình tĩnh, chú ý an toàn điện, lửa',
  'Kế Đô': 'gắn với muộn phiền — nên chăm sóc sức khỏe tinh thần, chia sẻ cùng người thân',
  'Thái Âm': 'gắn với tin vui, tích lũy — thuận cho việc gia đình, để dành',
  'Mộc Đức': 'gắn với hanh thông — thuận cho học tập, phát triển bản thân',
};

/** Sao theo tuổi mụ (>=10) và giới tính; dưới 10 tuổi trả null */
export function saoChieuMenh(tuoiMu: number, gender: 'Nam' | 'Nữ'): string | null {
  if (tuoiMu < 10) return null;
  return (gender === 'Nữ' ? SAO_NU : SAO_NAM)[(tuoiMu - 10) % 9];
}

/* ---------------- Nét con giáp ---------------- */
export const CHI_TRAIT: Record<string, string> = {
  'Tý': 'nhanh nhẹn, tháo vát, giỏi xoay xở', 'Sửu': 'bền bỉ, chăm chỉ, đáng tin cậy',
  'Dần': 'quả cảm, quyết đoán, có uy', 'Mão': 'ôn hòa, khéo léo, tinh tế',
  'Thìn': 'khí phách, nhiều hoài bão', 'Tỵ': 'thâm trầm, mưu lược, sâu sắc',
  'Ngọ': 'hoạt bát, phóng khoáng, nhiệt thành', 'Mùi': 'hiền hậu, nghệ sĩ tính, giàu lòng nhân',
  'Thân': 'thông minh, linh hoạt, hài hước', 'Dậu': 'cẩn trọng, chu toàn, thẳng thắn',
  'Tuất': 'trung thành, nghĩa khí, tận tâm', 'Hợi': 'chân thành, rộng lượng, phúc hậu',
};

/** Tổng hợp bản mệnh một người từ năm sinh + giới tính (+ tên nếu có) */
export function banMenh(year: number, gender: 'Nam' | 'Nữ', fullName?: string, currentYear = new Date().getFullYear()) {
  const cc = canChiYear(year);
  const tuoiMu = currentYear - year + 1;
  return {
    canChi: `${cc.can} ${cc.chi}`,
    menh: cc.menh,
    hanh: cc.hanh,
    conGiap: cc.chi,
    trait: CHI_TRAIT[cc.chi],
    cungPhi: cungPhi(year, gender),
    huongTot: HUONG_TOT[cungPhi(year, gender)[0]],
    mauHop: MAU_HANH[cc.hanh],
    goiY: HANH_GOI_Y[cc.hanh],
    sao: saoChieuMenh(tuoiMu, gender),
    tuoiMu,
    numerology: fullName ? numerology(fullName, undefined) : null,
    disclaimer: HV_DISCLAIMER,
  };
}

export { CHI };
