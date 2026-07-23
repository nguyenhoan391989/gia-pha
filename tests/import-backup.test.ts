import { validateBackup, planImport, parseVnDate, stripBase64, summarize } from '../lib/import-backup';

const backup = {
  org: { display: 'Nguyễn Thượng Đại Tộc' },
  branches: ['Chi 1', 'Chi 2'],
  members: [
    { id: 1, name: 'Nguyễn Văn Tổ', gender: 'Nam', birthYear: 1920, deathYear: 1990, alive: false, generation: 1, branch: 'Chi 1', fatherId: 0, spouseId: 2 },
    { id: 2, name: 'Trần Thị Tổ', gender: 'Nữ', birthYear: 1925, alive: false, generation: 1, branch: 'Chi 1', fatherId: 0, spouseId: 1 },
    { id: 3, name: 'Nguyễn Văn A', gender: 'Nam', birthYear: 1950, generation: 2, branch: 'Chi 3', fatherId: 1, spouseId: 0 },
    { id: 4, name: 'Nguyễn Văn X', fatherId: 99 },
  ],
  fund: [
    { id: 1, date: '10/03/2026', name: 'Nguyễn Văn A', purpose: 'Tu bổ', amount: 10000000, type: 'Thu', method: 'Tiền mặt' },
    { id: 2, date: '11/03/2026', name: 'BQL', purpose: 'Mua vật tư', amount: 2000000, type: 'Chi' },
  ],
  heritage: { history: { text: 'Lịch sử họ...', images: [] }, giahuan: 'Kính trên nhường dưới', empty: { text: '' } },
  couplet: { daitu: 'Đức Lưu Quang', bg: 'data:image/jpeg;base64,' + 'x'.repeat(5000) },
  events: [{ id: 1, title: 'Giỗ Tổ' }],
  photos: [{ id: 1, data: 'data:...' }],
};

describe('validateBackup', () => {
  test('từ chối file không phải backup', () => {
    expect(validateBackup(null).ok).toBe(false);
    expect(validateBackup({ foo: 1 }).ok).toBe(false);
  });
  test('chấp nhận backup hợp lệ', () => {
    expect(validateBackup(backup).ok).toBe(true);
  });
});

describe('planImport', () => {
  const plan = planImport(backup as never);
  test('map thành viên: giới tính, năm sinh→ISO, mất', () => {
    expect(plan.members).toHaveLength(4);
    const to = plan.members[0];
    expect(to.gender).toBe('male');
    expect(to.birthDate).toBe('1920-01-01');
    expect(to.deathDate).toBe('1990-12-31');
    expect(to.isAlive).toBe(false);
    expect(plan.members[1].gender).toBe('female');
  });
  test('quan hệ: 1 cha hợp lệ + 1 vợ chồng (khử trùng lặp), cha ảo bị cảnh báo', () => {
    expect(plan.relationships.filter((r) => r.type === 'father')).toHaveLength(1);
    expect(plan.relationships.filter((r) => r.type === 'spouse')).toHaveLength(1);
    expect(plan.warnings.some((w) => w.includes('member 4'))).toBe(true);
  });
  test('chi nhánh gộp từ danh sách + trong hồ sơ', () => {
    expect(plan.branches.sort()).toEqual(['Chi 1', 'Chi 2', 'Chi 3']);
  });
  test('quỹ: khoản chi được đánh dấu, ngày dd/mm/yyyy → ISO', () => {
    expect(plan.contributions).toHaveLength(2);
    expect(plan.contributions[0].contributedAt).toBe('2026-03-10');
    expect(plan.contributions[1].note).toContain('[KHOẢN CHI]');
  });
  test('tư liệu: bỏ mục rỗng, map đúng loại', () => {
    expect(plan.familyRecords).toHaveLength(2);
    expect(plan.familyRecords.map((r) => r.recordType).sort()).toEqual(['gia_huan', 'pha_ky']);
  });
  test('app_state: có couplet đã lược base64, có events; cảnh báo ảnh thư viện', () => {
    const cp = plan.appState.find((s) => s.key === 'couplet')!.value as { bg: string };
    expect(cp.bg).toContain('đã lược');
    expect(plan.appState.some((s) => s.key === 'events')).toBe(true);
    expect(plan.warnings.some((w) => w.includes('ảnh thư viện'))).toBe(true);
  });
  test('summarize ra chuỗi đọc được', () => {
    expect(summarize(plan)).toContain('4 thành viên');
  });
});

describe('helpers', () => {
  test('parseVnDate', () => {
    expect(parseVnDate('05/02/2026')).toBe('2026-02-05');
    expect(parseVnDate('xxx')).toBeNull();
  });
  test('stripBase64 giữ chuỗi ngắn, cắt chuỗi data: dài', () => {
    expect(stripBase64('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
    expect(stripBase64('data:' + 'y'.repeat(3000))).toContain('đã lược');
  });
});
