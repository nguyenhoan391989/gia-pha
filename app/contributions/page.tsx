import type { Metadata } from 'next';
import { HandCoins, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { getFund, formatVnd } from '@/lib/contributions';

export const metadata: Metadata = { title: 'Quỹ công đức' };
export const dynamic = 'force-dynamic';

const BAR_COLORS = ['bg-primary', 'bg-gold', 'bg-primary/70', 'bg-gold/70', 'bg-primary/50'];

/** Module 6 — Quỹ công đức dòng họ: tổng thu/chi/số dư + biểu đồ theo mục đích + danh sách */
export default async function ContributionsPage() {
  const { rows, summary } = await getFund();
  const maxPurpose = Math.max(1, ...summary.byPurpose.map((p) => p.total));

  const cards = [
    { label: 'Tổng thu', value: summary.totalIn, Icon: TrendingUp, cls: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'Tổng chi', value: summary.totalOut, Icon: TrendingDown, cls: 'text-primary dark:text-red-300' },
    { label: 'Số dư quỹ', value: summary.balance, Icon: Wallet, cls: 'text-gold-dark dark:text-gold' },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto flex items-center gap-2 text-xl font-bold text-primary dark:text-gold md:text-2xl">
          <HandCoins className="h-6 w-6 text-gold" /> Quỹ công đức dòng họ
        </h1>
        {summary.source === 'mock' && <Badge variant="outline" className="text-muted-foreground">Dữ liệu mẫu</Badge>}
      </div>

      {/* Tổng quan thu - chi - số dư */}
      <section className="grid gap-3 sm:grid-cols-3">
        {cards.map(({ label, value, Icon, cls }) => (
          <Card key={label} className="frame-gold">
            <CardContent className="flex flex-col items-center gap-1 p-5 text-center">
              <Icon className={`mb-1 h-5 w-5 ${cls}`} />
              <div className={`font-serif text-2xl font-bold ${cls}`}>{formatVnd(value)}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </section>
      <p className="text-center text-xs text-muted-foreground">
        * Khoản chi hiện là số tạm tính; sẽ nối trực tiếp với Module Tu bổ - Sửa chữa ở bước sau.
      </p>

      {/* Biểu đồ theo mục đích */}
      <Card>
        <CardHeader><CardTitle className="text-primary dark:text-gold">Công đức theo mục đích</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {summary.byPurpose.map((p, i) => (
            <div key={p.purpose} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{p.purpose}</span>
                <span className="text-muted-foreground">{formatVnd(p.total)}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-accent">
                <div
                  className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                  style={{ width: `${Math.round((p.total / maxPurpose) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danh sách công đức */}
      <Card>
        <CardHeader><CardTitle className="text-primary dark:text-gold">Danh sách công đức</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-accent/60 hover:bg-accent/60">
                <TableHead>Ngày</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead className="hidden sm:table-cell">Nội dung</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead className="hidden md:table-cell">Hình thức</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{r.date}</TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{r.purpose}</TableCell>
                  <TableCell className="text-right font-semibold text-primary dark:text-gold">{formatVnd(r.amount)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={r.method === 'Chuyển khoản' ? 'gold' : 'outline'}>{r.method}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
