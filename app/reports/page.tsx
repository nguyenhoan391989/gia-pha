'use client';

import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { REPORT_BY_GENERATION, REPORT_GENDER, REPORT_BY_FAMILY, STATS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

/** 09. Báo cáo - thống kê theo đời / giới tính / gia đình (biểu đồ thanh CSS nhẹ) */
export default function ReportsPage() {
  const maxGen = Math.max(...REPORT_BY_GENERATION.map((r) => r.count));
  const totalGender = REPORT_GENDER.reduce((s, g) => s + g.value, 0);
  const maxFam = Math.max(...REPORT_BY_FAMILY.map((r) => r.count));

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-xl font-bold text-primary dark:text-gold md:text-2xl">Báo cáo</h1>
        <Button variant="gold" onClick={() => toast.success('Đang xuất báo cáo PDF (mock)')}>
          <Download /> Xuất báo cáo
        </Button>
      </div>

      {/* Tổng quan nhanh */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary dark:text-gold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Theo đời */}
        <Card>
          <CardHeader><CardTitle className="text-primary dark:text-gold">Thống kê theo đời</CardTitle></CardHeader>
          <CardContent className="space-y-2.5">
            {REPORT_BY_GENERATION.map((r) => (
              <div key={r.gen} className="flex items-center gap-3 text-sm">
                <span className="w-14 shrink-0 text-muted-foreground">{r.gen}</span>
                <div className="h-6 flex-1 overflow-hidden rounded bg-muted">
                  <div
                    className="flex h-full items-center justify-end rounded bg-gradient-to-r from-primary to-primary-light px-2 text-[11px] font-semibold text-white transition-all"
                    style={{ width: `${(r.count / maxGen) * 100}%` }}
                  >
                    {r.count}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Theo giới tính */}
        <Card>
          <CardHeader><CardTitle className="text-primary dark:text-gold">Tỷ lệ giới tính</CardTitle></CardHeader>
          <CardContent>
            <div className="flex h-8 overflow-hidden rounded-full">
              {REPORT_GENDER.map((g) => (
                <div key={g.label}
                  className={cn('grid place-items-center text-xs font-semibold text-white', g.color)}
                  style={{ width: `${(g.value / totalGender) * 100}%` }}>
                  {g.label} {Math.round((g.value / totalGender) * 100)}%
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              {REPORT_GENDER.map((g) => (
                <span key={g.label} className="flex items-center gap-2">
                  <span className={cn('h-3 w-3 rounded-full', g.color)} />
                  {g.label}: <b>{g.value}</b>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Theo gia đình */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-primary dark:text-gold">Thành viên theo gia đình</CardTitle></CardHeader>
          <CardContent className="grid gap-2.5 sm:grid-cols-2">
            {REPORT_BY_FAMILY.map((r) => (
              <div key={r.name} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-muted-foreground">{r.name}</span>
                <div className="h-5 flex-1 overflow-hidden rounded bg-muted">
                  <div className="h-full rounded bg-gold transition-all" style={{ width: `${(r.count / maxFam) * 100}%` }} />
                </div>
                <span className="w-8 text-right font-semibold">{r.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
