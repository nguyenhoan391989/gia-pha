import type { Metadata } from 'next';
import { Boxes, MapPinned } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getGraves } from '@/lib/modules';

export const metadata: Metadata = { title: 'Mộ phần' };
export const dynamic = 'force-dynamic';

/** Module 3 — Quản lý mộ phần */
export default async function GravesPage() {
  const graves = getGraves();
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="flex items-center gap-2 text-xl font-bold text-primary dark:text-gold md:text-2xl">
          <Boxes className="h-6 w-6 text-gold" /> Quản lý mộ phần
        </h1>
        <Badge variant="outline" className="text-muted-foreground">Dữ liệu mẫu</Badge>
      </div>
      <p className="text-sm text-muted-foreground">Hồ sơ mộ phần, vị trí, hình ảnh, tình trạng và lịch sử tu bổ.</p>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-accent/60 hover:bg-accent/60">
                <TableHead>Họ tên</TableHead>
                <TableHead>Khu mộ</TableHead>
                <TableHead>Năm mất</TableHead>
                <TableHead>Tình trạng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {graves.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.name}</TableCell>
                  <TableCell>{g.area}</TableCell>
                  <TableCell>{g.year}</TableCell>
                  <TableCell>
                    <Badge variant={g.status === 'Tốt' ? 'gold' : 'outline'}>{g.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="frame-gold h-fit p-4 text-center">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary dark:text-gold">
            <MapPinned className="h-4 w-4 text-gold" /> Sơ đồ khu mộ
          </div>
          <div className="grid h-44 place-items-center rounded-lg bg-gradient-to-br from-green-800 to-lime-600 text-white/90">
            Bản đồ khu mộ
          </div>
          <Button variant="outline" className="mt-3 w-full">Xem bản đồ lớn</Button>
        </Card>
      </div>
    </div>
  );
}
