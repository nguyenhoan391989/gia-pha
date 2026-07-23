import { numerology, numRed, cungPhi, saoChieuMenh, banMenh, HV_DISCLAIMER } from '../lib/huyen-hoc';

describe('Thần số học', () => {
  test('numRed giữ số master 11/22', () => {
    expect(numRed(29)).toBe(11);
    expect(numRed(38)).toBe(11);
    expect(numRed(19)).toBe(1);
  });
  test('life path 1990-01-01 = 3 (1+1+1+9+9+0=21→3)', () => {
    const n = numerology('Nguyễn Văn A', { d: 1, m: 1, y: 1990 });
    expect(n.lifePath).toBe(3);
  });
  test('soul chỉ tính nguyên âm, expression tính cả tên', () => {
    const n = numerology('An');
    // a=1, n=5 → expression 6; soul: a=1
    expect(n.expression).toBe(6);
    expect(n.soul).toBe(1);
  });
});

describe('Cung phi bát trạch', () => {
  test('1990 Nam = Khảm (Đông tứ), Nữ = Cấn (Tây tứ)', () => {
    expect(cungPhi(1990, 'Nam')[0]).toBe('Khảm');
    expect(cungPhi(1990, 'Nữ')[0]).toBe('Cấn');
  });
});

describe('Sao chiếu mệnh', () => {
  test('nam 10 tuổi mụ = La Hầu, nữ 10 = Kế Đô; dưới 10 = null', () => {
    expect(saoChieuMenh(10, 'Nam')).toBe('La Hầu');
    expect(saoChieuMenh(10, 'Nữ')).toBe('Kế Đô');
    expect(saoChieuMenh(9, 'Nam')).toBeNull();
  });
});

describe('banMenh tổng hợp', () => {
  test('đủ trường + luôn kèm disclaimer', () => {
    const b = banMenh(1990, 'Nam', 'Nguyễn Văn A', 2026);
    expect(b.canChi).toBe('Canh Ngọ');
    expect(b.menh).toBe('Lộ Bàng Thổ');
    expect(b.cungPhi[0]).toBe('Khảm');
    expect(b.huongTot).toHaveLength(4);
    expect(b.tuoiMu).toBe(37);
    expect(b.disclaimer).toBe(HV_DISCLAIMER);
  });
});
