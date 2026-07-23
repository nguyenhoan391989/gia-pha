import { NextRequest, NextResponse } from 'next/server';
import { handleApi, requireAuth, ApiError } from '@/lib/api';
import { solarToLunar, lunarToSolar, parseLunarString } from '@/lib/lunar';

/** GET /api/members/lunar-convert - tiện ích chuyển đổi âm/dương lịch */
export const GET = handleApi(async (req: NextRequest) => {
  await requireAuth();
  const sp = req.nextUrl.searchParams;
  const direction = sp.get('direction') || 's2l';

  if (direction === 's2l') {
    const date = sp.get('date') || '';
    const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) throw new ApiError(400, 'Tham số date phải dạng YYYY-MM-DD');
    const lunar = solarToLunar(parseInt(m[3]), parseInt(m[2]), parseInt(m[1]));
    return NextResponse.json({ lunar });
  }

  const parsed = parseLunarString(sp.get('lunar') || '');
  if (!parsed) throw new ApiError(400, 'Tham số lunar phải dạng dd/mm/yyyy hoặc "dd/mm/yyyy nhuận"');
  const solar = lunarToSolar(parsed.day, parsed.month, parsed.year, parsed.isLeapMonth);
  if (!solar) throw new ApiError(400, 'Ngày âm lịch không hợp lệ');
  const [dd, mm, yy] = solar;
  return NextResponse.json({
    solar: `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`,
  });
});
