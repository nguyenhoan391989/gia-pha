import { toGedcom, toCsv, FullMember } from '../lib/export';
import { RelationshipLite } from '../lib/tree';

const members: FullMember[] = [
  { id: 'a', full_name: 'Nguyễn Văn Cha', gender: 'male', birth_date: '1950-01-20', occupation: 'Nông dân' },
  { id: 'b', full_name: 'Trần Thị Mẹ', gender: 'female', birth_date: '1953-05-10' },
  { id: 'c', full_name: 'Nguyễn Văn Con', gender: 'male', birth_date: '1975-03-15' },
];
const rels: RelationshipLite[] = [
  { member_id: 'a', related_member_id: 'b', relationship_type: 'spouse' },
  { member_id: 'c', related_member_id: 'a', relationship_type: 'father' },
  { member_id: 'c', related_member_id: 'b', relationship_type: 'mother' },
];

describe('Xuất GEDCOM 5.5.1', () => {
  const ged = toGedcom(members, rels);

  test('có header và trailer chuẩn', () => {
    expect(ged).toContain('0 HEAD');
    expect(ged).toContain('2 VERS 5.5.1');
    expect(ged).toContain('1 CHAR UTF-8');
    expect(ged.trim().endsWith('0 TRLR')).toBe(true);
  });

  test('đủ 3 cá nhân với giới tính đúng', () => {
    expect(ged.match(/0 @I\d+@ INDI/g)).toHaveLength(3);
    expect(ged).toContain('1 NAME Nguyễn Văn Cha');
    expect(ged).toContain('1 SEX F');
  });

  test('gia đình có HUSB, WIFE, CHIL', () => {
    expect(ged).toMatch(/1 HUSB @I\d+@/);
    expect(ged).toMatch(/1 WIFE @I\d+@/);
    expect(ged).toMatch(/1 CHIL @I\d+@/);
  });

  test('ngày sinh định dạng GEDCOM (20 JAN 1950)', () => {
    expect(ged).toContain('2 DATE 20 JAN 1950');
  });
});

describe('Xuất CSV', () => {
  test('có BOM UTF-8, header và escape đúng', () => {
    const csv = toCsv([{ ...members[0], biography: 'Ghi chú, có "dấu phẩy"' }]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('full_name');
    expect(csv).toContain('"Ghi chú, có ""dấu phẩy"""');
  });
});
