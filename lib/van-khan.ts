/**
 * Thư viện Văn khấn & Nghi lễ Gia tộc — 46 lễ / 5 nhóm + generator văn khấn.
 * Port từ gia-pha-app.html. Thuần túy — nhận tham số, không đọc DB.
 */
import { canChiYear, solarToLunar } from './can-chi';

export const RL_CATS = [
  ['nam', '🏮 Lễ tiết thường niên'], ['ho', '🏛 Lễ dòng họ'], ['nhatho', '🏠 Nhà thờ họ'],
  ['mo', '⚱️ Mộ phần'], ['giadinh', '👨‍👩‍👧 Gia đình'],
] as const;

export type RitualCat = 'nam' | 'ho' | 'nhatho' | 'mo' | 'giadinh';
export interface Ritual { id: string; cat: RitualCat; name: string; lunarDate: string; summary: string }

const L = (id: string, cat: RitualCat, name: string, lunarDate: string, summary: string): Ritual => ({ id, cat, name, lunarDate, summary });

export const RITUALS: Ritual[] = [
  L('ongtao', 'nam', 'Ông Công Ông Táo', '23/12', 'Tiễn Táo quân chầu trời, tổng kết năm của gia đình'),
  L('tatnien', 'nam', 'Lễ Tất Niên', '30/12', 'Tạ ơn tổ tiên, thần linh sau một năm'),
  L('giaothua', 'nam', 'Lễ Giao Thừa', 'Đêm 30/12', 'Trừ tịch — tiễn năm cũ đón năm mới'),
  L('hoavang', 'nam', 'Lễ Hóa Vàng', '3/1', 'Tạ và tiễn gia tiên sau Tết'),
  L('khaiha', 'nam', 'Lễ Khai Hạ', '7/1', 'Hạ cây nêu, khai xuân mở đầu năm làm việc'),
  L('ranggieng', 'nam', 'Rằm Tháng Giêng', '15/1', 'Tết Nguyên tiêu — "Lễ cả năm không bằng Rằm tháng Giêng"'),
  L('hanthuc', 'nam', 'Tết Hàn Thực', '3/3', 'Dâng bánh trôi bánh chay tưởng nhớ tổ tiên'),
  L('giotohv', 'nam', 'Giỗ Tổ Hùng Vương', '10/3', 'Tưởng nhớ các Vua Hùng dựng nước'),
  L('thanhminh', 'nam', 'Tết Thanh Minh', 'Tháng 3', 'Tảo mộ, chăm sóc phần mộ tổ tiên'),
  L('doanngo', 'nam', 'Tết Đoan Ngọ', '5/5', 'Giết sâu bọ, cầu sức khỏe mùa hè'),
  L('vulan', 'nam', 'Lễ Vu Lan', '15/7', 'Báo hiếu cha mẹ, tổ tiên'),
  L('ram7', 'nam', 'Rằm Tháng Bảy', '15/7', 'Xá tội vong nhân, cúng chúng sinh'),
  L('trungthu', 'nam', 'Tết Trung Thu', '15/8', 'Tết đoàn viên, trông trăng'),
  L('dongchi', 'nam', 'Tiết Đông Chí', 'Tiết Đông chí', 'Lễ tiết giữa đông, dâng lễ tổ tiên'),
  L('ramchap', 'nam', 'Rằm Tháng Chạp', '15/12', 'Lễ tất niên sớm, chuẩn bị đón Tết'),
  L('giothuyto', 'ho', 'Giỗ Thủy Tổ', 'Theo dòng họ', 'Ngày giỗ vị khai sáng dòng họ'),
  L('giotoho', 'ho', 'Giỗ Tổ Họ', 'Theo dòng họ', 'Đại lễ tưởng nhớ tổ tiên toàn họ'),
  L('gionganh', 'ho', 'Giỗ Tổ Ngành', 'Theo ngành', 'Giỗ vị tổ khai sáng ngành'),
  L('giotochi', 'ho', 'Giỗ Tổ Chi', 'Theo chi', 'Giỗ vị tổ khai sáng chi'),
  L('giothuong', 'ho', 'Giỗ Thường Niên', 'Theo từng vị', 'Giỗ hằng năm các vị tiên tổ'),
  L('hopho', 'ho', 'Họp Họ', 'Đầu xuân/dịp giỗ tổ', 'Con cháu tề tựu, bàn việc họ'),
  L('tuongniem', 'ho', 'Lễ Tưởng Niệm', 'Tùy dịp', 'Tưởng niệm người có công với họ, với nước'),
  L('tienhien', 'ho', 'Lễ Tôn Vinh Tiền Hiền', 'Tùy dịp', 'Tôn vinh bậc tiền hiền khai khẩn, khai cơ'),
  L('dongtho', 'nhatho', 'Lễ Động Thổ', 'Ngày lành', 'Xin phép Thổ thần khởi tạo đất xây nhà thờ'),
  L('khoicong', 'nhatho', 'Lễ Khởi Công', 'Ngày lành', 'Bắt đầu xây dựng nhà thờ họ'),
  L('thuongluong', 'nhatho', 'Lễ Thượng Lương', 'Ngày lành', 'Cất nóc — đặt đòn dông nhà thờ'),
  L('khanhthanh', 'nhatho', 'Lễ Khánh Thành', 'Ngày lành', 'Hoàn thành nhà thờ, cáo yết tổ tiên'),
  L('anvibantho', 'nhatho', 'Lễ An Vị Bàn Thờ', 'Ngày lành', 'Rước và an vị bàn thờ mới'),
  L('anvibathuong', 'nhatho', 'Lễ An Vị Bát Hương', 'Ngày lành', 'Bốc và an vị bát hương'),
  L('mocua', 'nhatho', 'Lễ Mở Cửa Nhà Thờ', 'Đầu năm', 'Khai môn đầu năm, dâng hương tổ tiên'),
  L('dongcua', 'nhatho', 'Lễ Đóng Cửa Cuối Năm', 'Cuối tháng Chạp', 'Tạ lễ, phong ấn nhà thờ cuối năm'),
  L('tomo', 'mo', 'Thanh Minh Tảo Mộ', 'Tháng 3', 'Dọn cỏ, đắp mộ, dâng lễ tại phần mộ'),
  L('tamo', 'mo', 'Lễ Tạ Mộ', 'Cuối tháng Chạp', 'Tạ ơn Thổ thần, mời gia tiên về ăn Tết'),
  L('sangcat', 'mo', 'Lễ Sang Cát', 'Ngày lành (sau 3+ năm)', 'Cải cát, chuyển hài cốt sang tiểu quách'),
  L('caitang', 'mo', 'Lễ Cải Táng', 'Ngày lành', 'Di chuyển, an táng lại phần mộ'),
  L('xaymo', 'mo', 'Lễ Xây Mộ', 'Ngày lành', 'Khởi công xây, tôn tạo phần mộ'),
  L('didoimo', 'mo', 'Lễ Di Dời Mộ', 'Ngày lành', 'Xin phép di dời phần mộ đến nơi mới'),
  L('daythang', 'giadinh', 'Lễ Đầy Tháng', 'Bé tròn 1 tháng', 'Tạ Mụ bà, trình gia tiên thành viên mới'),
  L('thoinoi', 'giadinh', 'Lễ Thôi Nôi', 'Bé tròn 1 năm', 'Mừng bé tròn tuổi, chọn nghề đoán duyên'),
  L('thanhdinh', 'giadinh', 'Lễ Thành Đinh', 'Theo lệ họ', 'Ghi tên con trai vào sổ họ (xuất đinh)'),
  L('mungtho', 'giadinh', 'Lễ Mừng Thọ', 'Đầu xuân', 'Mừng thọ ông bà 70-80-90-100 tuổi'),
  L('cuoihoi', 'giadinh', 'Lễ Cưới Hỏi (Gia tiên)', 'Ngày cưới', 'Trình gia tiên đôi tân hôn'),
  L('nhaptrach', 'giadinh', 'Lễ Nhập Trạch', 'Ngày lành', 'Về nhà mới, an vị bàn thờ'),
  L('tangle', 'giadinh', 'Tang Lễ (Cúng cơm)', 'Trong tang', 'Cúng cơm, tế lễ người mới mất'),
  L('tieutuong', 'giadinh', 'Lễ Tiểu Tường', 'Giáp 1 năm mất', 'Giỗ đầu người quá cố'),
  L('daituong', 'giadinh', 'Lễ Đại Tường', 'Giáp 2 năm mất', 'Giỗ hết — mãn tang'),
];

/** Nội dung chuyên sâu riêng cho các lễ tiêu biểu */
export const RITUAL_SPEC: Record<string, { time: string; extra: string }> = {
  ongtao: { time: 'Cúng trước 12h trưa ngày 23 tháng Chạp', extra: 'Lễ có cá chép sống (phóng sinh) hoặc cá chép giấy để Táo quân cưỡi về trời. Miền Trung cúng ngựa giấy, miền Nam thêm áo mũ giấy.' },
  giaothua: { time: 'Giờ Tý (23h–1h) đêm 30 Tết — cúng ngoài trời trước, trong nhà sau', extra: 'Lễ ngoài trời kính quan Hành khiển bàn giao năm; lễ trong nhà kính gia tiên.' },
  ranggieng: { time: 'Ngày 14 hoặc chính Rằm tháng Giêng, ban ngày', extra: 'Nhiều nhà cúng chay, đi lễ chùa cầu an cả năm.' },
  thanhminh: { time: 'Trong tiết Thanh minh (đầu tháng 3 âm)', extra: 'Kết hợp tảo mộ: dọn cỏ, đắp mộ trước rồi mới bày lễ khấn tại mộ.' },
  giotoho: { time: 'Ngày giỗ Tổ theo gia phả từng họ', extra: 'Trưởng họ chủ lễ tại nhà thờ họ; các chi mang lễ về hợp tế; đọc chúc văn ghi công đức Tổ.' },
  anvibathuong: { time: 'Ngày lành tháng tốt, thường buổi sáng', extra: 'Bát hương bốc bằng tro nếp/tro trấu sạch, cốt thất bảo; người bốc phải tắm gội sạch sẽ, thành tâm.' },
  nhaptrach: { time: 'Ngày lành, gia chủ tự tay mang bát hương/bếp lửa vào trước', extra: 'Mang theo bếp lửa, gạo muối nước — tượng trưng no ấm; ngủ lại nhà mới đêm đầu.' },
  mungtho: { time: 'Đầu xuân hoặc đúng ngày sinh nhật tròn thọ', extra: 'Con cháu dâng rượu thọ, áo thọ đỏ; chúc thọ theo thứ bậc từ trưởng đến ấu.' },
  tangle: { time: 'Cúng cơm ngày 2 bữa trong 49/100 ngày đầu', extra: 'Tang lễ theo thọ mai gia lễ; lạy người quá cố 4 lạy.' },
};

export interface Offering { icon: string; name: string; required: boolean; purpose: string }
export const OFFERINGS: Offering[] = [
  { icon: '🕯', name: 'Hương (nhang)', required: true, purpose: 'Kết nối âm dương, mời tổ tiên chứng giám' },
  { icon: '💐', name: 'Hoa tươi', required: true, purpose: 'Dâng sắc hương thanh khiết (cúc, huệ, lay ơn)' },
  { icon: '🍎', name: 'Mâm ngũ quả', required: true, purpose: 'Ngũ hành đủ đầy, cầu sung túc' },
  { icon: '🍃', name: 'Trầu cau', required: true, purpose: 'Miếng trầu là đầu câu chuyện — lễ nghĩa truyền thống' },
  { icon: '💧', name: 'Nước sạch', required: true, purpose: 'Tấm lòng trong sạch, thanh tịnh' },
  { icon: '🕯', name: 'Đèn / nến (đôi)', required: true, purpose: 'Soi đường — tượng nhật nguyệt' },
  { icon: '🍵', name: 'Trà', required: false, purpose: 'Kính mời tổ tiên thưởng trà' },
  { icon: '🍶', name: 'Rượu trắng', required: false, purpose: 'Lễ mặn truyền thống — "vô tửu bất thành lễ"' },
  { icon: '🍚', name: 'Gạo & muối', required: false, purpose: 'No đủ, mặn mà tình nghĩa' },
  { icon: '🍙', name: 'Xôi (gấc/đỗ)', required: false, purpose: 'Thành quả lúa gạo dâng tổ tiên' },
  { icon: '🐔', name: 'Gà trống luộc', required: false, purpose: 'Lễ mặn — gà trống ngậm hoa hồng' },
  { icon: '🍬', name: 'Bánh kẹo', required: false, purpose: 'Lộc ngọt cho con cháu' },
  { icon: '🔥', name: 'Vàng mã', required: false, purpose: 'Tùy chọn theo tục từng nhà — đốt có chừng mực' },
];

export const RITUAL_STEPS: ReadonlyArray<readonly [string, string]> = [
  ['Dọn dẹp, bao sái bàn thờ', 'Lau bằng nước sạch/rượu gừng, khăn riêng; không xê dịch bát hương.'],
  ['Bày biện lễ vật', 'Theo sơ đồ "đông bình tây quả"; đồ mặn đặt mâm riêng phía trước.'],
  ['Thắp đèn/nến', 'Thắp đôi đèn hai bên trước khi thắp hương.'],
  ['Thắp hương', 'Số lẻ 1-3-5 nén; châm bằng lửa đèn, không thổi tắt bằng miệng.'],
  ['Vái và khấn xin phép', 'Chủ lễ chắp tay vái 3 vái, xin phép được hành lễ.'],
  ['Đọc văn khấn', 'Đọc rõ ràng, thành kính; con cháu đứng sau chắp tay.'],
  ['Dâng trà – rượu', 'Rót 3 lần, mỗi lần một phần ba chén.'],
  ['Chờ hương tàn (2/3 nén)', 'Thời gian tổ tiên "thụ hưởng"; giữ không gian trang nghiêm.'],
  ['Hóa vàng (nếu có)', 'Hóa ở nơi sạch, thứ tự thần trước – gia tiên sau; vẩy rượu vào tro.'],
  ['Lễ tạ', 'Vái tạ 3 vái (2 lạy với gia tiên); hạ lễ, chia lộc cho con cháu.'],
];

export const MIEN_NOTE =
  'Miền Bắc: trọng nghi thức cổ, mâm cỗ đủ bát đĩa, văn khấn theo lối cổ. ' +
  'Miền Trung: lễ nghi cung đình Huế ảnh hưởng đậm, cỗ cầu kỳ, trọng chúc văn. ' +
  'Miền Nam: giản dị, thực tâm, mâm quả phương Nam (mãng cầu, dừa, đu đủ, xoài), không câu nệ hình thức.';

/* ---------------- Generator văn khấn ---------------- */
export interface PrayerInput {
  ritualName: string;
  clanName: string;
  host?: string;
  address?: string;
  wish?: string;
  /** Ngày dương làm lễ (mặc định: hôm nay) — tự đổi ra âm lịch + can chi */
  date?: Date;
}

export function lunarDateString(date = new Date()): string {
  const lu = solarToLunar(date.getDate(), date.getMonth() + 1, date.getFullYear());
  const cc = canChiYear(lu.year);
  return `ngày ${lu.day} tháng ${lu.month}${lu.isLeapMonth ? ' nhuận' : ''} năm ${cc.can} ${cc.chi}`;
}

export function prayerTraditional(inp: PrayerInput): string {
  const ho = inp.clanName || '……';
  return `Nam mô A Di Đà Phật! (3 lần)

Con kính lạy chín phương Trời, mười phương Chư Phật, Chư Phật mười phương.
Con kính lạy Hoàng thiên Hậu thổ, chư vị Tôn thần.
Con kính lạy ngài Bản cảnh Thành hoàng, ngài Bản xứ Thổ địa, ngài Bản gia Táo quân cùng chư vị Tôn thần.
Con kính lạy Cao tằng Tổ khảo, Cao tằng Tổ tỷ, liệt vị hương linh gia tiên nội ngoại ${ho}.

Hôm nay là ${lunarDateString(inp.date)} (âm lịch).
Tín chủ con là ${inp.host || '……'}, đại diện con cháu ${ho}, ngụ tại ${inp.address || '……'}.

Nhân ${inp.ritualName}, tín chủ con cùng toàn thể con cháu thành tâm sắm sửa hương hoa lễ vật, trà quả kim ngân, thắp nén tâm hương dâng lên trước án.

Cúi xin chư vị Tôn thần, liệt vị Tổ tiên thương xót con cháu, giáng lâm trước án, chứng giám lòng thành, thụ hưởng lễ vật.
Phù hộ độ trì cho toàn gia chúng con ${inp.wish || 'thân cung khang thái, gia đạo hưng long, con cháu hiếu thuận, học hành tấn tới, công việc hanh thông'}.

Chúng con lễ bạc tâm thành, trước án kính lễ, cúi xin được phù hộ độ trì.

Nam mô A Di Đà Phật! (3 lần, 3 lạy)`;
}

export function prayerModern(inp: PrayerInput): string {
  const ho = inp.clanName || 'dòng họ';
  return `Kính thưa tổ tiên nội ngoại ${ho},

Hôm nay, nhân ${inp.ritualName}, con cháu chúng con tề tựu trước bàn thờ, thành kính dâng hương hoa lễ vật.

Chúng con xin tưởng nhớ công ơn sinh thành dưỡng dục của tổ tiên, ông bà, cha mẹ — những người đã dày công vun đắp cho ${ho} được như hôm nay.

Nguyện xin tổ tiên chứng giám lòng thành, phù hộ cho toàn thể con cháu mạnh khỏe, hòa thuận, chăm chỉ học hành làm việc, giữ gìn nền nếp gia phong.

Con cháu ${ho} thành tâm kính lễ.`;
}
