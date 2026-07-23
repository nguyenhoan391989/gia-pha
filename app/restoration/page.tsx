import type { Metadata } from 'next';
import { Hammer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getRestoration, vnd } from '@/lib/modules';

export const metadata: Metadata = { title: 'Tu bổ - Sửa chữa' };
export const dynamic = 'force-dynamic';

/** Module 5 — Tu bổ, sửa chữa */
export default async function RestorationPage() {
  const r = getRestoration();
  const cards = [
    { label: 'Tổng hạng mục', value: String(r.totalItems) },
    { label: 'Đang thực hiện', value: String(r.inProgress) },
    { label: 'Hoàn thành', value: String(r.done) },
    { label: 'Tổng dự toán', value: vnd(r.totalBudget) },
    { label: 'Đã chi', value: vnd(r.totalSpent) },
  ];
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="flex items-center gap-2 text-xl font-bold text-primary dark:text-gold md:text-2xl">
          <Hammer className="h-6 w-6 text-gold" /> Tu bổ - Sửa chữa
        </h1>
        <Badge variant="outline" className="text-muted-foreground">Dữ liệu mẫu</Badge>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label} className="frame-gold">
            <CardContent className="p-4 text-center">
              <div className="font-serif text-lg font-bold text-primary dark:text-gold">{c.value}</div>
              <div className="text-xs text-muted-foreground">{c.label}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-accent/60 hover:bg-accent/60">
              <TableHead>Hạng mục</TableHead>
              <TableHead className="text-right">Dự toán</TableHead>
              <TableHead className="text-right">Đã chi</TableHead>
              <TableHead className="w-40">Tiến độ</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {r.items.map((it) => (
              <TableRow key={it.id}>
                <TableCell className="font-medium">{it.name}</TableCell>
                <TableCell className="text-right">{vnd(it.budget)}</TableCell>
                <TableCell className="text-right">{vnd(it.spent)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-accent">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${it.progress}%` }} />
                    </div>
                    <span className="w-9 text-right text-xs text-muted-foreground">{it.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={it.progress === 0 ? 'outline' : 'gold'}>{it.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
