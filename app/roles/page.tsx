import type { Metadata } from 'next';
import { Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const metadata: Metadata = { title: 'Phân quyền' };

const ROLES: { role: string; en: string; desc: string; perms: string }[] = [
  { role: 'Khách', en: 'Guest', desc: 'Xem thông tin công khai', perms: 'Xem sơ đồ, thông báo, sự kiện' },
  { role: 'Thành viên', en: 'Member', desc: 'Đóng góp dữ liệu', perms: 'Xem chi tiết, gửi góp ý / đề xuất' },
  { role: 'Chi trưởng', en: 'Branch Manager', desc: 'Quản lý một chi', perms: 'Duyệt dữ liệu chi mình phụ trách' },
  { role: 'Ban quản trị', en: 'Admin', desc: 'Quản trị hệ thống', perms: 'Quản lý dữ liệu, nội dung, phân quyền' },
  { role: 'Trưởng họ', en: 'Clan Leader', desc: 'Toàn quyền', perms: 'Quyết định cuối cùng, quản lý toàn bộ' },
];

/** Module 9 — Phân quyền người dùng (Khách → Thành viên → Chi trưởng → Ban quản trị → Trưởng họ) */
export default function RolesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="flex items-center gap-2 text-xl font-bold text-primary dark:text-gold md:text-2xl">
          <Shield className="h-6 w-6 text-gold" /> Phân quyền người dùng
        </h1>
        <Badge variant="outline" className="text-muted-foreground">Cấu hình mẫu</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Vai trò tăng dần: Khách → Thành viên → Chi trưởng → Ban quản trị → Trưởng họ. Quản lý quyền xem, sửa và phê duyệt.
      </p>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-accent/60 hover:bg-accent/60">
              <TableHead>Vai trò</TableHead>
              <TableHead className="hidden sm:table-cell">Mô tả</TableHead>
              <TableHead>Quyền chính</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROLES.map((r) => (
              <TableRow key={r.en}>
                <TableCell>
                  <div className="font-semibold text-primary dark:text-gold">{r.role}</div>
                  <div className="text-xs text-muted-foreground">{r.en}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{r.desc}</TableCell>
                <TableCell className="text-muted-foreground">{r.perms}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
