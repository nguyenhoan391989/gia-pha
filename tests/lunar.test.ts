import { solarToLunar, lunarToSolar, parseLunarString, nextDeathAnniversary, jdFromDate, jdToDate } from '../lib/lunar';

describe('Chuyển đổi lịch âm - dương', () => {
  test('Tết Nguyên Đán 2024: 10/02/2024 dương = 01/01/2024 âm', () => {
    const l = solarToLunar(10, 2, 2024);
    expect(l).toMatchObject({ day: 1, month: 1, year: 2024, isLeapMonth: false });
  });

  test('Tết Nguyên Đán 2025: 29/01/2025 dương = 01/01/2025 âm', () => {
    const l = solarToLunar(29, 1, 2025);
    expect(l).toMatchObject({ day: 1, month: 1, year: 2025, isLeapMonth: false });
  });

  test('Tết Nguyên Đán 2023: 22/01/2023 dương = 01/01/2023 âm', () => {
    const l = solarToLunar(22, 1, 2023);
    expect(l).toMatchObject({ day: 1, month: 1, year: 2023, isLeapMonth: false });
  });

  test('Năm 2023 có tháng 2 âm nhuận', () => {
    // Tháng 2 âm thường: 25/02/2023 dương = 06/02/2023 âm
    const normal = solarToLunar(25, 2, 2023);
    expect(normal).toMatchObject({ month: 2, year: 2023, isLeapMonth: false });
    // Tháng 2 nhuận bắt đầu 22/03/2023 dương = 01/02 nhuận
    const leap = solarToLunar(22, 3, 2023);
    expect(leap).toMatchObject({ day: 1, month: 2, year: 2023, isLeapMonth: true });
    // Tháng 3 âm bắt đầu 20/04/2023 dương
    const after = solarToLunar(20, 4, 2023);
    expect(after).toMatchObject({ day: 1, month: 3, year: 2023, isLeapMonth: false });
  });

  test('Âm -> dương -> âm khớp nhau (round-trip) trên nhiều ngày', () => {
    const dates: [number, number, number][] = [
      [1, 1, 2020], [15, 7, 2021], [10, 3, 2022], [23, 12, 2023],
      [5, 5, 2024], [30, 4, 1975], [2, 9, 1945], [1, 6, 1995],
    ];
    for (const [dd, mm, yy] of dates) {
      const lunar = solarToLunar(dd, mm, yy);
      const back = lunarToSolar(lunar.day, lunar.month, lunar.year, lunar.isLeapMonth);
      expect(back).toEqual([dd, mm, yy]);
    }
  });

  test('Julian day round-trip', () => {
    const jd = jdFromDate(13, 7, 2026);
    expect(jdToDate(jd)).toEqual([13, 7, 2026]);
  });
});

describe('Parse chuỗi âm lịch', () => {
  test('đúng định dạng dd/mm/yyyy', () => {
    expect(parseLunarString('25/07/1995')).toMatchObject({ day: 25, month: 7, year: 1995, isLeapMonth: false });
  });
  test('có hậu tố nhuận', () => {
    expect(parseLunarString('10/02/2023 nhuận')).toMatchObject({ day: 10, month: 2, year: 2023, isLeapMonth: true });
  });
  test('sai định dạng trả về null', () => {
    expect(parseLunarString('1995-07-25')).toBeNull();
    expect(parseLunarString('32/13/2000')).toBeNull();
  });
});

describe('Tính ngày giỗ sắp tới', () => {
  test('trả về ngày dương trong tương lai gần', () => {
    const result = nextDeathAnniversary('25/07/1995', new Date(2026, 0, 15));
    expect(result).not.toBeNull();
    const [dd, mm, yy] = result!.solar;
    const d = new Date(yy, mm - 1, dd);
    expect(d.getTime()).toBeGreaterThanOrEqual(new Date(2026, 0, 15).getTime());
    // Ngày giỗ phải đúng ngày 25 tháng 7 âm lịch
    const lunarCheck = solarToLunar(dd, mm, yy);
    expect(lunarCheck.day).toBe(25);
    expect(lunarCheck.month).toBe(7);
  });

  test('chuỗi không hợp lệ trả về null', () => {
    expect(nextDeathAnniversary('không phải ngày')).toBeNull();
  });
});
