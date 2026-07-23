'use client';

import { useState } from 'react';
import { CalendarDays, MapPin, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { EVENTS } from '@/lib/mock-data';

const TYPE_VARIANT: Record<string, 'default' | 'gold' | 'muted' | 'success'> = {
  'Giỗ': 'default', 'Họp mặt': 'gold', 'Kỷ niệm': 'success', 'Sinh nhật': 'muted',
};

/** 07. Quản lý sự kiện - lọc theo loại + timeline thẻ sự kiện + dialog thêm */
export default function EventsPage() {
  const [type, setType] = useState('all');
  const items = EVENTS.filter((e) => type === 'all' || e.type === type);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-xl font-bold text-primary dark:text-gold md:text-2xl">Sự kiện</h1>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            {['Giỗ', 'Họp mặt', 'Kỷ niệm', 'Sinh nhật'].map((tp) => <SelectItem key={tp} value={tp}>{tp}</SelectItem>)}
          </SelectContent>
        </Select>
        <Dialog>
          <DialogTrigger asChild><Button><Plus /> Thêm sự kiện</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm sự kiện</DialogTitle>
              <DialogDescription>Sự kiện, ngày giỗ, họp mặt của dòng tộc.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="space-y-1.5"><Label>Tên sự kiện *</Label><Input placeholder="Giỗ tổ..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Ngày</Label><Input type="date" /></div>
                <div className="space-y-1.5">
                  <Label>Loại</Label>
                  <Select defaultValue="Giỗ">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Giỗ', 'Họp mặt', 'Kỷ niệm', 'Sinh nhật'].map((tp) => <SelectItem key={tp} value={tp}>{tp}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5"><Label>Địa điểm</Label><Input placeholder="Nhà thờ họ" /></div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose>
              <DialogClose asChild>
                <Button onClick={() => toast.success('Đã thêm sự kiện (mock)')}>Lưu sự kiện</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-2 py-16 text-center">
          <span className="text-4xl">📅</span>
          <p className="font-medium">Chưa có sự kiện loại này</p>
          <p className="text-sm text-muted-foreground">Bấm &quot;Thêm sự kiện&quot; để tạo mới.</p>
        </CardContent></Card>
      ) : (
        <div className="relative space-y-3 pl-6">
          {/* Trục timeline */}
          <span className="absolute bottom-3 left-2 top-3 w-px bg-gold/50" />
          {items.map((e) => (
            <Card key={e.id} className="relative transition-all hover:-translate-y-0.5 hover:shadow-md">
              <span className="absolute -left-[22px] top-6 h-3 w-3 rounded-full border-2 border-gold bg-card" />
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <Badge variant={TYPE_VARIANT[e.type]}>{e.type}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{e.title}</p>
                  {e.description && <p className="mt-0.5 text-sm text-muted-foreground">{e.description}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {e.date}</span>
                  {e.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {e.location}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
