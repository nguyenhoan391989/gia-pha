import { jdFromDate } from '../lib/lunar';
import { canChiDay, canChiYear, canChiMonth, dayStar, dayInfo, rateDay, gioHoangDao } from '../lib/can-chi';

describe('Can Chi', () => {
  test('ngày 1/1/2000 là Mậu Ngọ', () => {
    const cc = canChiDay(jdFromDate(1, 1, 2000));
    expect(`${cc.can} ${cc.chi}`).toBe('Mậu Ngọ');
  });
  test('năm 1990 Canh Ngọ — Lộ Bàng Thổ (Thổ)', () => {
    const cc = canChiYear(1990);
    expect(`${cc.can} ${cc.chi}`).toBe('Canh Ngọ');
    expect(cc.menh).toBe('Lộ Bàng Thổ');
    expect(cc.hanh).toBe('Thổ');
  });
  test('năm 1984 Giáp Tý — Hải Trung Kim; 2000 Canh Thìn — Bạch Lạp Kim', () => {
    expect(canChiYear(1984).menh).toBe('Hải Trung Kim');
    expect(canChiYear(2000).menh).toBe('Bạch Lạp Kim');
  });
  test('tháng giêng năm Bính → Canh Dần', () => {
    const cc = canChiMonth(2026, 1);
    expect(`${cc.can} ${cc.chi}`).toBe('Canh Dần');
  });
});

describe('Hoàng đạo / Hắc đạo', () => {
  test('tháng 1 âm, ngày Tý = Thanh Long (hoàng đạo)', () => {
    const s = dayStar(1, 0);
    expect(s.name).toBe('Thanh Long');
    expect(s.hoangDao).toBe(true);
  });
  test('tháng 1 âm, ngày Dần = Thiên Hình (hắc đạo); tháng 2 ngày Dần = Thanh Long', () => {
    expect(dayStar(1, 2)).toEqual({ name: 'Thiên Hình', hoangDao: false });
    expect(dayStar(2, 2)).toEqual({ name: 'Thanh Long', hoangDao: true });
  });
  test('giờ hoàng đạo ngày Tý/Ngọ có Tý và Sửu', () => {
    expect(gioHoangDao(0)).toEqual(expect.arrayContaining([0, 1]));
    expect(gioHoangDao(6)).toEqual(gioHoangDao(0));
  });
});

describe('dayInfo + rateDay', () => {
  test('Tết 2026 (17/2) là 1/1 âm, có lễ Tết Nguyên Đán', () => {
    const i = dayInfo(new Date(2026, 1, 17));
    expect(i.lunar.day).toBe(1);
    expect(i.lunar.month).toBe(1);
    expect(i.leAm).toBe('Tết Nguyên Đán');
    expect(`${i.namCC.can} ${i.namCC.chi}`).toBe('Bính Ngọ');
  });
  test('rateDay trả điểm 0..10 kèm lý do thường ngữ', () => {
    const r = rateDay(new Date(2026, 1, 17), 'cuoi');
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(10);
    expect(r.reasons.length).toBeGreaterThan(0);
    expect(['Rất tốt', 'Tốt', 'Bình thường', 'Nên tránh']).toContain(r.label);
  });
});
