import { buildTree, countNodes, MemberLite, RelationshipLite } from '../lib/tree';

const m = (id: string, name: string, gender = 'male', birth?: string): MemberLite => ({
  id, full_name: name, gender, birth_date: birth ?? null,
});

describe('buildTree - dựng cây phả hệ', () => {
  const members: MemberLite[] = [
    m('ong', 'Ông Tổ', 'male', '1920-01-01'),
    m('ba', 'Bà Tổ', 'female', '1924-01-01'),
    m('con1', 'Con Trưởng', 'male', '1945-01-01'),
    m('con2', 'Con Thứ', 'male', '1950-01-01'),
    m('vo-con1', 'Vợ Con Trưởng', 'female', '1948-01-01'),
    m('chau1', 'Cháu Nội', 'male', '1972-01-01'),
  ];
  const rels: RelationshipLite[] = [
    { member_id: 'ong', related_member_id: 'ba', relationship_type: 'spouse' },
    { member_id: 'con1', related_member_id: 'ong', relationship_type: 'father' },
    { member_id: 'con1', related_member_id: 'ba', relationship_type: 'mother' },
    { member_id: 'con2', related_member_id: 'ong', relationship_type: 'father' },
    { member_id: 'con1', related_member_id: 'vo-con1', relationship_type: 'spouse' },
    { member_id: 'chau1', related_member_id: 'con1', relationship_type: 'father' },
  ];

  test('gốc là thủy tổ (không có cha mẹ trong dữ liệu)', () => {
    const roots = buildTree(members, rels);
    expect(roots).toHaveLength(1);
    expect(roots[0].member.id).toBe('ong');
  });

  test('vợ/chồng nằm trong spouses, không thành node riêng', () => {
    const roots = buildTree(members, rels);
    expect(roots[0].spouses.map((s) => s.id)).toEqual(['ba']);
  });

  test('con cái sắp theo năm sinh, cháu đúng tầng', () => {
    const roots = buildTree(members, rels);
    const children = roots[0].children;
    expect(children.map((c) => c.member.id)).toEqual(['con1', 'con2']);
    expect(children[0].spouses.map((s) => s.id)).toEqual(['vo-con1']);
    expect(children[0].children[0].member.id).toBe('chau1');
  });

  test('không thành viên nào bị trùng lặp trong cây', () => {
    const roots = buildTree(members, rels);
    expect(countNodes(roots)).toBe(members.length);
  });

  test('rootId cho phép dựng cây con', () => {
    const roots = buildTree(members, rels, 'con1');
    expect(roots).toHaveLength(1);
    expect(roots[0].member.id).toBe('con1');
    expect(roots[0].children[0].member.id).toBe('chau1');
  });

  test('dữ liệu rỗng không lỗi', () => {
    expect(buildTree([], [])).toEqual([]);
  });
});
