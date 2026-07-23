'use client';

import { useState } from 'react';
import { Minus, Plus, Maximize2, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreeNodeBox } from '@/components/tree-node';
import { FAMILY_TREE } from '@/lib/mock-data';

/** 03. Cây gia phả - toolbar lọc + zoom + vùng cây cuộn/kéo được */
export default function TreePage() {
  const [zoom, setZoom] = useState(100);

  const setZ = (v: number) => setZoom(Math.min(200, Math.max(40, v)));

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
        <h1 className="mr-auto text-lg font-bold text-primary dark:text-gold md:text-xl">Cây gia phả</h1>
        <Select defaultValue="all">
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toàn bộ dòng tộc</SelectItem>
            <SelectItem value="f1">Gia đình 1</SelectItem>
            <SelectItem value="f2">Gia đình 2</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả đời</SelectItem>
            {[1, 2, 3, 4].map((g) => <SelectItem key={g} value={String(g)}>Đời {g}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 rounded-md border p-0.5">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZ(zoom - 10)} aria-label="Thu nhỏ"><Minus /></Button>
          <span className="w-12 text-center text-sm font-medium">{zoom}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZ(zoom + 10)} aria-label="Phóng to"><Plus /></Button>
        </div>
        <Button variant="outline" size="icon" onClick={() => setZoom(100)} aria-label="Vừa màn hình"><Maximize2 /></Button>
        <Button variant="outline" size="icon" onClick={() => { toast.info('Đang chuẩn bị bản in...'); setTimeout(() => window.print(), 400); }} aria-label="In"><Printer /></Button>
      </div>

      {/* Vùng cây */}
      <div className="thin-scroll flex-1 overflow-auto rounded-lg border bg-card p-6">
        <div
          className="mx-auto w-fit origin-top transition-transform duration-200"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          <TreeNodeBox node={FAMILY_TREE} isRoot />
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Hiển thị cây gia phả dạng cây với các thế hệ · Có thể zoom, thu nhỏ, di chuyển (cuộn/kéo)
      </p>
    </div>
  );
}
