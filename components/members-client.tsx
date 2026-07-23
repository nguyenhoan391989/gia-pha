'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { api, ApiRequestError } from '@/services/api';
import { type UiMember } from '@/lib/adapters';

const PAGE_SIZE = 10;

interface Branch { id: string; name: string }
interface Props {
  initialItems: UiMember[];
  branches: Branch[];
  source: 'db' | 'mock';
}

/** 04. Danh sách thành viên — lọc, phân trang, xóa; Thêm/Sửa dùng form hồ sơ đầy đủ. */
export default function MembersClient({ initialItems, branches, source }: Props) {
  const [items, setItems] = useState<UiMember[]>(initialItems);
  const [q, setQ] = useState('');
  const [family, setFamily] = useState('all');
  const [gender, setGender] = useState('all');
  const [gen, setGen] = useState('all');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<UiMember | null>(null);

  const generations = useMemo(() => {
    const s = new Set<number>();
    items.forEach((m) => m.generation && s.add(m.generation));
    return [...s].sort((a, b) => a - b);
  }, [items]);

  const filtered = useMemo(() => {
    const nq = q.trim().toLowerCase();
    return items.filter((m) => {
      if (family !== 'all' && !m.family.startsWith(family)) return false;
      if (gender !== 'all' && m.gender !== gender) return false;
      if (gen !== 'all' && m.generation !== +gen) return false;
      if (nq && !m.name.toLowerCase().includes(nq)) return false;
      return true;
    });
  }, [items, q, family, gender, gen]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const rows = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const confirmDelete = async () => {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    try {
      await api(`/api/members/${target.id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((m) => m.id !== target.id));
      toast.success(`Đã xóa ${target.name}`);
    } catch (err) {
      if (err instanceof ApiRequestError && (err.status === 401 || err.status === 403)) {
        setItems((prev) => prev.filter((m) => m.id !== target.id));
        toast.info(`Đã xóa tạm ${target.name}`, { description: 'Tải lại trang để khôi phục.' });
      } else {
        toast.error('Không xóa được', { description: (err as Error).message });
      }
    }
  };

  const clearFilters = () => { setQ(''); setFamily('all'); setGender('all'); setGen('all'); };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-xl font-bold text-primary dark:text-gold md:text-2xl">Thành viên</h1>
        {source === 'mock' && <Badge variant="outline" className="text-muted-foreground">Dữ liệu mẫu</Badge>}
        <Button asChild><Link href="/members/new"><Plus /> Thêm thành viên</Link></Button>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-2 rounded-lg border bg-card p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Tìm kiếm thành viên..." value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <Select value={family} onValueChange={(val) => { setFamily(val); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả gia đình</SelectItem>
            {branches.map((b) => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={gender} onValueChange={(val) => { setGender(val); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả giới tính</SelectItem>
            <SelectItem value="Nam">Nam</SelectItem>
            <SelectItem value="Nữ">Nữ</SelectItem>
          </SelectContent>
        </Select>
        <Select value={gen} onValueChange={(val) => { setGen(val); setPage(1); }}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả đời</SelectItem>
            {generations.map((g) => <SelectItem key={g} value={String(g)}>Đời {g}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Bảng */}
      <div className="rounded-lg border bg-card">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <span className="text-4xl">🔍</span>
            <p className="font-medium">Không tìm thấy thành viên nào</p>
            <p className="text-sm text-muted-foreground">Thử đổi từ khóa hoặc bỏ bớt bộ lọc.</p>
            <Button variant="outline" className="mt-2" onClick={clearFilters}>Xóa bộ lọc</Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/60 hover:bg-accent/60">
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Năm sinh</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead className="hidden sm:table-cell">Gia đình</TableHead>
                  <TableHead>Đời</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Link href={`/members/${m.id}`} className="font-medium text-primary hover:underline dark:text-gold">{m.name}</Link>
                    </TableCell>
                    <TableCell>{m.birthYear ?? '—'}</TableCell>
                    <TableCell>{m.gender}</TableCell>
                    <TableCell className="hidden sm:table-cell">{m.family}</TableCell>
                    <TableCell><Badge variant="gold">{m.generation || '—'}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Sửa" asChild>
                        <Link href={`/members/${m.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label="Xóa"
                        onClick={() => setDeleting(m)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t p-3 text-sm">
              <span className="text-muted-foreground">
                Hiển thị {(pageSafe - 1) * PAGE_SIZE + 1}–{Math.min(pageSafe * PAGE_SIZE, filtered.length)} của {filtered.length} thành viên
              </span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={pageSafe <= 1}
                  onClick={() => setPage(pageSafe - 1)} aria-label="Trang trước"><ChevronLeft /></Button>
                {[...Array(Math.min(3, totalPages))].map((_, i) => (
                  <Button key={i} size="icon" className="h-8 w-8"
                    variant={pageSafe === i + 1 ? 'default' : 'outline'}
                    onClick={() => setPage(i + 1)}>{i + 1}</Button>
                ))}
                {totalPages > 3 && <span className="px-1 text-muted-foreground">…</span>}
                {totalPages > 3 && (
                  <Button size="icon" className="h-8 w-8"
                    variant={pageSafe === totalPages ? 'default' : 'outline'}
                    onClick={() => setPage(totalPages)}>{totalPages}</Button>
                )}
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={pageSafe >= totalPages}
                  onClick={() => setPage(pageSafe + 1)} aria-label="Trang sau"><ChevronRight /></Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Dialog xác nhận xóa */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xóa thành viên?</DialogTitle>
            <DialogDescription>
              Bạn chắc chắn muốn xóa <b>{deleting?.name}</b> khỏi gia phả? Thao tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Hủy</Button>
            <Button variant="destructive" onClick={confirmDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
