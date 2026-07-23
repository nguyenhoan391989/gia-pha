import type { Metadata } from 'next';
import { Landmark, MapPin, CalendarClock, Ruler, ScrollText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getHeritage } from '@/lib/modules';

export const metadata: Metadata = { title: 'Nhà thờ họ' };
export const dynamic = 'force-dynamic';

const RAIL = ['Giới thiệu chung', 'Lịch sử dòng họ', 'Câu chuyện Thủy tổ', 'Cụ tổ các ngành', 'Gia huấn – Gia quy', 'Sắc phong', 'Hình ảnh', 'Video'];
const GRAD = ['from-red-900 to-amber-700', 'from-amber-800 to-yellow-600', 'from-stone-700 to-amber-800', 'from-red-800 to-rose-600', 'from-yellow-700 to-amber-500'];

/** Module 1 — Nhà thờ họ & Lịch sử dòng họ */
export default async function NhaThoHoPage() {
  const h = await getHeritage();
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="flex items-center gap-2 text-xl font-bold text-primary dark:text-gold md:text-2xl">
          <Landmark className="h-6 w-6 text-gold" /> Nhà thờ họ &amp; Lịch sử dòng họ
        </h1>
        {h.source === 'mock' && <Badge variant="outline" className="text-muted-foreground">Dữ liệu mẫu</Badge>}
      </div>

      <div className="grid gap-4 md:grid-cols-[210px_1fr]">
        {/* Rail */}
        <Card className="h-fit p-2">
          <nav className="flex flex-col gap-1">
            {RAIL.map((x, i) => (
              <span key={x} className={`rounded-md px-3 py-2 text-sm ${i === 0 ? 'bg-primary font-semibold text-gold' : 'text-foreground/80 hover:bg-accent'}`}>{x}</span>
            ))}
          </nav>
        </Card>

        <div className="space-y-4">
          {/* Ảnh + thông tin nhà thờ */}
          <Card className="overflow-hidden frame-gold">
            <div className="h-44 w-full bg-gradient-to-br from-red-900 to-amber-700" />
            <CardContent className="p-5">
              <h2 className="text-lg font-bold text-primary dark:text-gold">{h.info.name}</h2>
              <p className="mt-2 text-sm text-foreground/90">{h.intro}</p>
              <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 text-gold" /> {h.info.address}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><CalendarClock className="h-4 w-4 text-gold" /> Khởi dựng {h.info.built} · Trùng tu {h.info.restored}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Ruler className="h-4 w-4 text-gold" /> Diện tích {h.info.area}</div>
              </dl>
            </CardContent>
          </Card>

          {/* Tài liệu: lịch sử, gia huấn, sắc phong... */}
          <div className="grid gap-3 sm:grid-cols-2">
            {h.docs.map((d) => (
              <Card key={d.title} className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 font-semibold text-primary dark:text-gold">
                    <ScrollText className="h-4 w-4 text-gold" /> {d.title}
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{d.excerpt}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sắc phong + hình ảnh */}
          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold text-primary dark:text-gold">Sắc phong &amp; Hình ảnh</div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {GRAD.concat(GRAD).slice(0, 6).map((g, i) => (
                <div key={i} className={`aspect-square rounded-md border border-gold/30 bg-gradient-to-br ${g}`} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
