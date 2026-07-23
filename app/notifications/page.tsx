import type { Metadata } from 'next';
import { Bell, Pin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SuggestForm from '@/components/suggest-form';
import { getNotifications } from '@/lib/modules';

export const metadata: Metadata = { title: 'Thông báo' };
export const dynamic = 'force-dynamic';

const TAB_VARIANT: Record<string, 'default' | 'gold'> = { 'Thông báo': 'default' };

/** Module 8 — Thông báo & Góp ý dữ liệu */
export default async function NotificationsPage() {
  const { notices, pending, source } = await getNotifications();
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto flex items-center gap-2 text-xl font-bold text-primary dark:text-gold md:text-2xl">
          <Bell className="h-6 w-6 text-gold" /> Thông báo &amp; Góp ý
        </h1>
        {pending > 0 && <Badge variant="gold">{pending} đề xuất chờ duyệt</Badge>}
        {source === 'mock' && <Badge variant="outline" className="text-muted-foreground">Dữ liệu mẫu</Badge>}
      </div>

      <div className="flex flex-wrap gap-2">
        {['Thông báo', 'Xuất đinh mới', 'Góp ý – Đề xuất', 'Lịch sử'].map((t) => (
          <Badge key={t} variant={TAB_VARIANT[t] ?? 'outline'} className={TAB_VARIANT[t] ? '' : 'text-muted-foreground'}>{t}</Badge>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-primary dark:text-gold">Thông báo mới nhất</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {notices.map((n) => (
              <div key={n.title} className="flex items-start gap-3 py-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary dark:bg-gold/15 dark:text-gold">
                  <Pin className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{n.tag}</Badge> {n.date}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-primary dark:text-gold">Gửi góp ý / đề xuất</CardTitle></CardHeader>
          <CardContent><SuggestForm /></CardContent>
        </Card>
      </div>
    </div>
  );
}
