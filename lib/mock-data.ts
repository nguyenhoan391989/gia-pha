/**
 * MOCK DATA cho Phase 1 - chỉ giao diện, không backend.
 * Số liệu khớp storyboard: 256 thành viên, 68 gia đình, 12 đời, 24 sự kiện.
 */

export interface Member {
  id: number;
  name: string;
  birthYear: number;
  deathYear?: number;
  gender: 'Nam' | 'Nữ';
  family: string;
  generation: number;
  role?: string;
  occupation?: string;
  birthPlace?: string;
  note?: string;
}

export const CURRENT_USER = { name: 'Nguyễn Văn A', role: 'Quản trị viên', initials: 'NA' };

export const STATS = [
  { label: 'Thành viên', value: 256, icon: 'users' },
  { label: 'Gia đình', value: 68, icon: 'home' },
  { label: 'Đời', value: 12, icon: 'layers' },
  { label: 'Sự kiện', value: 24, icon: 'calendar' },
] as const;

/** Cây gia phả 4 đời - tên khớp storyboard màn 03 */
export interface TreeNode {
  id: number;
  name: string;
  years: string;
  gender: 'Nam' | 'Nữ';
  spouse?: { name: string; years: string };
  children?: TreeNode[];
}

export const FAMILY_TREE: TreeNode = {
  id: 100, name: 'Nguyễn Văn Tổ', years: '1920-1990', gender: 'Nam',
  spouse: { name: 'Trần Thị Tổ', years: '1925-1995' },
  children: [
    {
      id: 1, name: 'Nguyễn Văn A', years: '1950', gender: 'Nam',
      spouse: { name: 'Lê Thị B', years: '1952' },
      children: [
        {
          id: 4, name: 'Nguyễn Văn D', years: '1975', gender: 'Nam',
          spouse: { name: 'Phạm Thị E', years: '1978' },
          children: [
            { id: 8, name: 'Nguyễn Văn H', years: '2005', gender: 'Nam' },
            { id: 9, name: 'Nguyễn Thị K', years: '2008', gender: 'Nữ' },
          ],
        },
        {
          id: 6, name: 'Nguyễn Văn F', years: '1980', gender: 'Nam',
          spouse: { name: 'Trần Thị G', years: '1983' },
          children: [{ id: 10, name: 'Nguyễn Văn L', years: '2010', gender: 'Nam' }],
        },
      ],
    },
    { id: 3, name: 'Nguyễn Văn C', years: '1955', gender: 'Nam', children: [] },
  ],
};

/** 256 thành viên sinh tự động, 6 dòng đầu khớp storyboard màn 04 */
const HO = ['Nguyễn Văn', 'Nguyễn Thị', 'Trần Văn', 'Trần Thị', 'Lê Văn', 'Lê Thị', 'Phạm Văn', 'Phạm Thị'];
const TEN = ['An', 'Bình', 'Cường', 'Dung', 'Em', 'Phúc', 'Giang', 'Hòa', 'Khang', 'Lan', 'Minh', 'Ngọc', 'Oanh', 'Phong', 'Quân', 'Sơn', 'Thảo', 'Uyên', 'Vinh', 'Xuân'];

const FIXED: Member[] = [
  { id: 1, name: 'Nguyễn Văn A', birthYear: 1950, gender: 'Nam', family: 'Gia đình 1', generation: 2, role: 'Trưởng dòng', occupation: 'Giáo viên', birthPlace: 'Hà Nội', note: 'Trưởng dòng đời thứ 2' },
  { id: 2, name: 'Lê Thị B', birthYear: 1952, gender: 'Nữ', family: 'Gia đình 1', generation: 2, occupation: 'Nội trợ', birthPlace: 'Hà Nội' },
  { id: 3, name: 'Nguyễn Văn C', birthYear: 1955, gender: 'Nam', family: 'Gia đình 2', generation: 2, occupation: 'Kỹ sư', birthPlace: 'Hà Nam' },
  { id: 4, name: 'Nguyễn Văn D', birthYear: 1975, gender: 'Nam', family: 'Gia đình 1-1', generation: 3, occupation: 'Bác sĩ', birthPlace: 'Hà Nội' },
  { id: 5, name: 'Phạm Thị E', birthYear: 1978, gender: 'Nữ', family: 'Gia đình 1-1', generation: 3, occupation: 'Kế toán', birthPlace: 'Nam Định' },
  { id: 6, name: 'Nguyễn Văn F', birthYear: 1980, gender: 'Nam', family: 'Gia đình 1-2', generation: 3, occupation: 'Doanh nhân', birthPlace: 'Hà Nội' },
  { id: 7, name: 'Trần Thị G', birthYear: 1983, gender: 'Nữ', family: 'Gia đình 1-2', generation: 3, occupation: 'Dược sĩ', birthPlace: 'Hải Phòng' },
  { id: 8, name: 'Nguyễn Văn H', birthYear: 2005, gender: 'Nam', family: 'Gia đình 1-1-1', generation: 4, occupation: 'Học sinh', birthPlace: 'Hà Nội' },
  { id: 9, name: 'Nguyễn Thị K', birthYear: 2008, gender: 'Nữ', family: 'Gia đình 1-1-1', generation: 4, occupation: 'Học sinh', birthPlace: 'Hà Nội' },
  { id: 10, name: 'Nguyễn Văn L', birthYear: 2010, gender: 'Nam', family: 'Gia đình 1-2-1', generation: 4, occupation: 'Học sinh', birthPlace: 'Hà Nội' },
];

function generated(): Member[] {
  const out: Member[] = [];
  for (let i = 11; i <= 256; i++) {
    const gen = 2 + (i % 10 === 0 ? 4 : i % 4); // đời 2-6 phân bố đều
    out.push({
      id: i,
      name: `${HO[i % HO.length]} ${TEN[(i * 7) % TEN.length]}`,
      birthYear: 1930 + ((i * 13) % 85),
      gender: i % 8 < 4 ? 'Nam' : 'Nữ',
      family: `Gia đình ${1 + (i % 12)}`,
      generation: gen,
      occupation: ['Nông dân', 'Giáo viên', 'Kỹ sư', 'Bác sĩ', 'Kinh doanh', 'Công nhân'][i % 6],
      birthPlace: ['Hà Nội', 'Hà Nam', 'Nam Định', 'Hải Phòng', 'TP.HCM'][i % 5],
    });
  }
  return out;
}

export const MEMBERS: Member[] = [...FIXED, ...generated()];

export const NEW_MEMBERS = [
  { name: 'Nguyễn Văn Nam', year: 1990 },
  { name: 'Trần Thị Hoa', year: 1992 },
  { name: 'Lê Văn Minh', year: 2010 },
  { name: 'Phạm Thị Lan', year: 2015 },
];

export interface EventItem {
  id: number;
  title: string;
  date: string;
  type: 'Giỗ' | 'Họp mặt' | 'Kỷ niệm' | 'Sinh nhật';
  location?: string;
  description?: string;
}

export const EVENTS: EventItem[] = [
  { id: 1, title: 'Giỗ Tổ Hùng Vương', date: '10/03/2024', type: 'Giỗ', location: 'Nhà thờ họ', description: 'Lễ giỗ tổ thường niên, con cháu tề tựu dâng hương.' },
  { id: 2, title: 'Họp mặt dòng tộc', date: '20/04/2024', type: 'Họp mặt', location: 'Nhà văn hóa thôn', description: 'Họp mặt đầu xuân toàn dòng tộc.' },
  { id: 3, title: 'Kỷ niệm 100 năm', date: '30/08/2024', type: 'Kỷ niệm', location: 'Nhà thờ họ', description: 'Kỷ niệm 100 năm thành lập dòng tộc.' },
  { id: 4, title: 'Giỗ cụ Nguyễn Văn Tổ', date: '15/09/2024', type: 'Giỗ', location: 'Nhà thờ họ' },
  { id: 5, title: 'Mừng thọ cụ bà 90 tuổi', date: '02/10/2024', type: 'Sinh nhật', location: 'Tư gia' },
  { id: 6, title: 'Trao học bổng khuyến học', date: '05/11/2024', type: 'Họp mặt', location: 'Nhà văn hóa thôn' },
];

export const UPCOMING_EVENTS = EVENTS.slice(0, 3);

export interface FamilyProfile {
  id: number;
  name: string;
  head: string;
  members: number;
  generation: number;
}

export const FAMILIES: FamilyProfile[] = [
  { id: 1, name: 'Gia đình 1', head: 'Nguyễn Văn A', members: 8, generation: 2 },
  { id: 2, name: 'Gia đình 2', head: 'Nguyễn Văn C', members: 5, generation: 2 },
  { id: 3, name: 'Gia đình 1-1', head: 'Nguyễn Văn D', members: 4, generation: 3 },
  { id: 4, name: 'Gia đình 1-2', head: 'Nguyễn Văn F', members: 3, generation: 3 },
  { id: 5, name: 'Gia đình 1-1-1', head: 'Nguyễn Văn H', members: 2, generation: 4 },
  { id: 6, name: 'Gia đình 1-2-1', head: 'Nguyễn Văn L', members: 1, generation: 4 },
];

/** Quan hệ gia đình của Nguyễn Văn A - khớp storyboard màn 06 */
export const RELATIONS = {
  member: 'Nguyễn Văn A (1950)',
  parents: [
    { name: 'Nguyễn Văn Tổ', years: '1920-1990' },
    { name: 'Trần Thị Tổ', years: '1925-1995' },
  ],
  spouse: [{ name: 'Lê Thị B', years: '1952' }],
  children: [
    { name: 'Nguyễn Văn D', years: '1975' },
    { name: 'Nguyễn Văn F', years: '1980' },
    { name: 'Trần Văn G', years: '1983' },
  ],
  siblings: [{ name: 'Nguyễn Văn C', years: '1955' }],
};

export interface Photo {
  id: number;
  title: string;
  album: string;
  gradient: string;
  year: number;
}

const GRADIENTS = [
  'from-red-900 to-amber-700', 'from-amber-800 to-yellow-600', 'from-stone-700 to-amber-800',
  'from-red-800 to-rose-600', 'from-yellow-700 to-amber-500', 'from-orange-900 to-red-700',
];

export const PHOTOS: Photo[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: ['Lễ giỗ tổ', 'Họp mặt đầu xuân', 'Nhà thờ họ', 'Trao học bổng', 'Mừng thọ', 'Ảnh gia đình'][i % 6] + ` ${2019 + (i % 6)}`,
  album: ['Lễ giỗ', 'Họp mặt', 'Nhà thờ họ', 'Khuyến học'][i % 4],
  gradient: GRADIENTS[i % GRADIENTS.length],
  year: 2019 + (i % 6),
}));

export const DOCUMENTS = [
  { id: 1, name: 'Gia phả gốc bản scan.pdf', size: '12.4 MB', date: '12/01/2024' },
  { id: 2, name: 'Sổ họ 1965.pdf', size: '8.1 MB', date: '03/02/2024' },
  { id: 3, name: 'Văn tế tổ tiên.docx', size: '215 KB', date: '10/03/2024' },
  { id: 4, name: 'Quy ước dòng họ.docx', size: '180 KB', date: '20/04/2024' },
];

export const REPORT_BY_GENERATION = [
  { gen: 'Đời 1', count: 2 }, { gen: 'Đời 2', count: 8 }, { gen: 'Đời 3', count: 24 },
  { gen: 'Đời 4', count: 46 }, { gen: 'Đời 5', count: 78 }, { gen: 'Đời 6', count: 98 },
];

export const REPORT_GENDER = [
  { label: 'Nam', value: 138, color: 'bg-primary' },
  { label: 'Nữ', value: 118, color: 'bg-gold' },
];

export const REPORT_BY_FAMILY = [
  { name: 'Gia đình 1', count: 62 }, { name: 'Gia đình 2', count: 48 },
  { name: 'Gia đình 3', count: 41 }, { name: 'Gia đình 4', count: 36 },
  { name: 'Gia đình 5', count: 34 }, { name: 'Khác', count: 35 },
];
