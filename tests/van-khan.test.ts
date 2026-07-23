import { RITUALS, RL_CATS, OFFERINGS, RITUAL_STEPS, prayerTraditional, prayerModern, lunarDateString } from '../lib/van-khan';

describe('Thư viện văn khấn', () => {
  test('đủ 46 lễ, đúng phân bố 5 nhóm (15/8/8/6/9)', () => {
    expect(RITUALS).toHaveLength(46);
    const count: Record<string, number> = {};
    RITUALS.forEach((r) => (count[r.cat] = (count[r.cat] || 0) + 1));
    expect(count).toEqual({ nam: 15, ho: 8, nhatho: 8, mo: 6, giadinh: 9 });
    expect(RL_CATS).toHaveLength(5);
  });
  test('id lễ không trùng nhau', () => {
    expect(new Set(RITUALS.map((r) => r.id)).size).toBe(46);
  });
  test('13 lễ vật, 6 món bắt buộc; 10 bước hành lễ', () => {
    expect(OFFERINGS).toHaveLength(13);
    expect(OFFERINGS.filter((o) => o.required)).toHaveLength(6);
    expect(RITUAL_STEPS).toHaveLength(10);
  });
});

describe('Generator văn khấn', () => {
  const inp = { ritualName: 'Lễ Giao Thừa', clanName: 'Nguyễn Thượng Đại Tộc', host: 'Nguyễn Văn A', address: 'Hà Nội', wish: 'cầu bình an', date: new Date(2026, 1, 17) };
  test('bản truyền thống đủ biến + ngày âm đúng', () => {
    const p = prayerTraditional(inp);
    expect(p).toContain('Lễ Giao Thừa');
    expect(p).toContain('Nguyễn Thượng Đại Tộc');
    expect(p).toContain('Nguyễn Văn A');
    expect(p).toContain('cầu bình an');
    expect(p).toContain('ngày 1 tháng 1 năm Bính Ngọ');
    expect(p.startsWith('Nam mô A Di Đà Phật')).toBe(true);
  });
  test('bản hiện đại ngắn gọn, có tên họ', () => {
    const p = prayerModern(inp);
    expect(p).toContain('Nguyễn Thượng Đại Tộc');
    expect(p.length).toBeLessThan(prayerTraditional(inp).length);
  });
  test('lunarDateString Tết 2026', () => {
    expect(lunarDateString(new Date(2026, 1, 17))).toBe('ngày 1 tháng 1 năm Bính Ngọ');
  });
});
