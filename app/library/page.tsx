'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PHOTOS, DOCUMENTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

function LibraryInner() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'docs' ? 'docs' : 'photos';
  const [album, setAlbum] = useState('all');
  const photos = PHOTOS.filter((p) => album === 'all' || p.album === album);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-xl font-bold text-primary dark:text-gold md:text-2xl">Thư viện</h1>
        <Button onClick={() => toast.success('Đã tải lên (mock)')}><Upload /> Tải lên</Button>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="photos">Hình ảnh</TabsTrigger>
          <TabsTrigger value="videos">Video</TabsTrigger>
          <TabsTrigger value="docs">Tài liệu</TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="space-y-3">
          <Select value={album} onValueChange={setAlbum}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả album</SelectItem>
              {['Lễ giỗ', 'Họp mặt', 'Nhà thờ họ', 'Khuyến học'].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((p) => (
              <figure key={p.id}
                className={cn('group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gradient-to-br shadow-sm transition-transform hover:scale-[1.02]', p.gradient)}
                onClick={() => toast.info(p.title)}>
                <span className="absolute left-2 top-2 rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white">{p.album}</span>
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-black/55 p-2 text-xs text-white transition-transform group-hover:translate-y-0">
                  {p.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos">
          {/* Empty state */}
          <Card><CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <span className="text-4xl">🎬</span>
            <p className="font-medium">Chưa có video nào</p>
            <p className="text-sm text-muted-foreground">Tải lên video kỷ niệm, phóng sự về dòng tộc.</p>
            <Button variant="outline" className="mt-2" onClick={() => toast.success('Đã tải lên (mock)')}>
              <Upload /> Tải video đầu tiên
            </Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card><CardContent className="divide-y p-5">
            {DOCUMENTS.map((d) => (
              <div key={d.id} className="flex items-center gap-3 py-3 text-sm">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary dark:bg-gold/15 dark:text-gold">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.size} · {d.date}</p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Tải xuống"
                  onClick={() => toast.success(`Đang tải ${d.name} (mock)`)}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** 08. Thư viện ảnh / video / tài liệu (useSearchParams cần Suspense) */
export default function LibraryPage() {
  return (
    <Suspense>
      <LibraryInner />
    </Suspense>
  );
}
