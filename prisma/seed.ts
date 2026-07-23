/**
 * Seed dữ liệu mẫu: dòng họ Nguyễn Phúc (giả định) - 4 thế hệ, 15 thành viên.
 * Giữ nguyên dữ liệu và UUID của bản Express cũ để không mất tương thích.
 * Chạy: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ID = (n: number) => `a0000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const BRANCH = (n: number) => `b0000000-0000-0000-0000-${String(n).padStart(12, '0')}`;

async function main() {
  const existing = await prisma.member.count();
  if (existing > 0) {
    console.log(`[seed] Đã có ${existing} thành viên, bỏ qua seed.`);
    return;
  }

  await prisma.generation.createMany({
    data: [1, 2, 3, 4].map((n) => ({ number: n, name: `Đời thứ ${['nhất', 'hai', 'ba', 'tư'][n - 1]}` })),
  });

  await prisma.branch.createMany({
    data: [
      { id: BRANCH(1), name: 'Chi trưởng', description: 'Chi của con trưởng Nguyễn Phúc Đức' },
      { id: BRANCH(2), name: 'Chi thứ', description: 'Chi của con thứ Nguyễn Phúc Tài' },
    ],
  });

  await prisma.member.createMany({
    data: [
      // ===== Đời 1 (thủy tổ) =====
      {
        id: ID(1), fullName: 'Nguyễn Phúc Khang', commonName: 'Cụ Khang', gender: 'male',
        birthDate: new Date('1920-03-15'), birthDateLunar: '25/02/1920',
        deathDate: new Date('1995-08-20'), deathDateLunar: '25/07/1995', isAlive: false,
        birthPlace: 'Làng Đông, Hà Nam', burialPlace: 'Nghĩa trang dòng họ, Hà Nam',
        occupation: 'Nhà nho, dạy học', generation: 1,
        biography: 'Thủy tổ dòng họ Nguyễn Phúc tại làng Đông. Cụ là người khai khẩn đất đai, dựng nhà thờ họ năm 1950.',
      },
      {
        id: ID(2), fullName: 'Trần Thị Nhân', commonName: 'Cụ bà Nhân', gender: 'female',
        birthDate: new Date('1924-06-10'), birthDateLunar: '09/05/1924',
        deathDate: new Date('2001-02-14'), deathDateLunar: '02/01/2001', isAlive: false,
        birthPlace: 'Làng Tây, Hà Nam', burialPlace: 'Nghĩa trang dòng họ, Hà Nam',
        occupation: 'Nông nghiệp', generation: 1,
        biography: 'Vợ cụ Nguyễn Phúc Khang, người phụ nữ tần tảo nuôi 3 người con khôn lớn.',
      },
      // ===== Đời 2 =====
      {
        id: ID(3), fullName: 'Nguyễn Phúc Đức', gender: 'male',
        birthDate: new Date('1945-01-20'), birthDateLunar: '07/12/1944',
        deathDate: new Date('2018-11-05'), deathDateLunar: '28/09/2018', isAlive: false,
        birthPlace: 'Làng Đông, Hà Nam', education: 'Tú tài', occupation: 'Cán bộ xã',
        generation: 2, branchId: BRANCH(1),
      },
      {
        id: ID(4), fullName: 'Lê Thị Hạnh', gender: 'female',
        birthDate: new Date('1948-04-02'), birthDateLunar: '23/02/1948',
        birthPlace: 'Nam Định', education: 'Trung cấp', occupation: 'Giáo viên',
        generation: 2, branchId: BRANCH(1),
      },
      {
        id: ID(5), fullName: 'Nguyễn Phúc Tài', gender: 'male',
        birthDate: new Date('1950-09-12'), birthDateLunar: '02/08/1950',
        birthPlace: 'Làng Đông, Hà Nam', education: 'Đại học Bách Khoa', occupation: 'Kỹ sư cơ khí',
        generation: 2, branchId: BRANCH(2),
      },
      {
        id: ID(6), fullName: 'Phạm Thị Lan', gender: 'female',
        birthDate: new Date('1953-12-01'), birthDateLunar: '25/10/1953',
        birthPlace: 'Hà Nội', education: 'Đại học Dược', occupation: 'Dược sĩ',
        generation: 2, branchId: BRANCH(2),
      },
      {
        id: ID(7), fullName: 'Nguyễn Thị Thảo', gender: 'female',
        birthDate: new Date('1955-07-07'), birthDateLunar: '18/05/1955',
        birthPlace: 'Làng Đông, Hà Nam', education: 'Phổ thông', occupation: 'Kinh doanh',
        generation: 2,
      },
      // ===== Đời 3 =====
      {
        id: ID(8), fullName: 'Nguyễn Phúc Minh', gender: 'male',
        birthDate: new Date('1972-05-30'), birthDateLunar: '18/04/1972',
        birthPlace: 'Hà Nam', education: 'Thạc sĩ CNTT', occupation: 'Kỹ sư phần mềm',
        title: 'Trưởng tộc đời 3', generation: 3, branchId: BRANCH(1),
      },
      {
        id: ID(9), fullName: 'Hoàng Thị Mai', gender: 'female',
        birthDate: new Date('1975-08-22'), birthDateLunar: '15/07/1975',
        birthPlace: 'Hà Nội', education: 'Cử nhân Kinh tế', occupation: 'Kế toán trưởng',
        generation: 3, branchId: BRANCH(1),
      },
      {
        id: ID(10), fullName: 'Nguyễn Thị Hương', gender: 'female',
        birthDate: new Date('1976-11-11'), birthDateLunar: '20/09/1976',
        birthPlace: 'Hà Nam', education: 'Cử nhân Sư phạm', occupation: 'Giáo viên',
        generation: 3, branchId: BRANCH(1),
      },
      {
        id: ID(11), fullName: 'Nguyễn Phúc Quang', gender: 'male',
        birthDate: new Date('1978-02-14'), birthDateLunar: '07/01/1978',
        birthPlace: 'Hà Nội', education: 'Tiến sĩ Y khoa', occupation: 'Bác sĩ',
        title: 'Phó khoa Nội - BV Bạch Mai', generation: 3, branchId: BRANCH(2),
      },
      {
        id: ID(12), fullName: 'Vũ Thị Ngọc', gender: 'female',
        birthDate: new Date('1980-10-05'), birthDateLunar: '27/08/1980',
        birthPlace: 'Hải Phòng', education: 'Cử nhân Ngoại ngữ', occupation: 'Biên dịch viên',
        generation: 3, branchId: BRANCH(2),
      },
      // ===== Đời 4 =====
      {
        id: ID(13), fullName: 'Nguyễn Phúc An', gender: 'male',
        birthDate: new Date('2000-01-01'), birthDateLunar: '25/11/1999',
        birthPlace: 'Hà Nội', education: 'Sinh viên ĐH Bách Khoa', generation: 4, branchId: BRANCH(1),
      },
      {
        id: ID(14), fullName: 'Nguyễn Thị Bình', gender: 'female',
        birthDate: new Date('2003-06-18'), birthDateLunar: '19/05/2003',
        birthPlace: 'Hà Nội', education: 'Sinh viên ĐH Ngoại Thương', generation: 4, branchId: BRANCH(1),
      },
      {
        id: ID(15), fullName: 'Nguyễn Phúc Duy', gender: 'male',
        birthDate: new Date('2005-09-09'), birthDateLunar: '07/08/2005',
        birthPlace: 'Hà Nội', education: 'Học sinh THPT', generation: 4, branchId: BRANCH(2),
      },
    ],
  });

  // Quan hệ vợ chồng (lưu 1 chiều)
  const spouse = (a: number, b: number, note?: string) => ({
    memberId: ID(a), relatedMemberId: ID(b), relationshipType: 'spouse', note: note ?? null,
  });
  // Cha/mẹ: member là CON, relatedMember là CHA/MẸ
  const parent = (child: number, father: number, mother: number) => [
    { memberId: ID(child), relatedMemberId: ID(father), relationshipType: 'father' },
    { memberId: ID(child), relatedMemberId: ID(mother), relationshipType: 'mother' },
  ];

  await prisma.relationship.createMany({
    data: [
      spouse(1, 2, 'vợ cả'), spouse(3, 4), spouse(5, 6), spouse(8, 9), spouse(11, 12),
      ...parent(3, 1, 2), ...parent(5, 1, 2), ...parent(7, 1, 2),
      ...parent(8, 3, 4), ...parent(10, 3, 4), ...parent(11, 5, 6),
      ...parent(13, 8, 9), ...parent(14, 8, 9), ...parent(15, 11, 12),
    ],
  });

  await prisma.familyRecord.createMany({
    data: [
      {
        recordType: 'pha_ky', title: 'Nguồn gốc dòng họ Nguyễn Phúc làng Đông',
        content: '<h2>Nguồn gốc</h2><p>Dòng họ Nguyễn Phúc định cư tại làng Đông, Hà Nam từ đầu thế kỷ XX. Thủy tổ là cụ Nguyễn Phúc Khang (1920-1995), một nhà nho có tiếng trong vùng.</p><h2>Gia phong</h2><p>Dòng họ coi trọng việc học, hiếu nghĩa với tổ tiên, đoàn kết giúp đỡ lẫn nhau.</p>',
      },
      {
        recordType: 'ngoai_pha', title: 'Văn tế tổ tiên ngày giỗ họ',
        content: '<p>Duy Việt Nam quốc, Hà Nam tỉnh... Hôm nay ngày giỗ tổ, con cháu nội ngoại xa gần tề tựu trước linh đường, kính cẩn dâng hương...</p>',
      },
      {
        recordType: 'gia_huan', title: 'Gia huấn dòng họ',
        content: '<ol><li>Kính trên nhường dưới, hiếu thảo với ông bà cha mẹ.</li><li>Chăm lo việc học của con cháu.</li><li>Đoàn kết, tương trợ trong họ.</li></ol>',
      },
    ],
  });

  await prisma.contribution.createMany({
    data: [
      { memberId: ID(8), contributorName: 'Nguyễn Phúc Minh', amount: 20000000, purpose: 'Trùng tu nhà thờ họ', contributedAt: new Date('2025-02-10'), note: 'Đợt 1' },
      { memberId: ID(11), contributorName: 'Nguyễn Phúc Quang', amount: 15000000, purpose: 'Trùng tu nhà thờ họ', contributedAt: new Date('2025-02-15') },
      { memberId: ID(5), contributorName: 'Nguyễn Phúc Tài', amount: 10000000, purpose: 'Quỹ khuyến học', contributedAt: new Date('2025-09-01'), note: 'Khen thưởng con cháu đỗ đại học' },
      { contributorName: 'Hội đồng hương Hà Nam tại TP.HCM', amount: 5000000, purpose: 'Quỹ khuyến học', contributedAt: new Date('2025-09-05'), note: 'Đóng góp tập thể' },
    ],
  });

  console.log('[seed] Hoàn tất: 15 thành viên, 23 quan hệ, 3 tài liệu, 4 công đức.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
