import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import RelationFinder from '@/components/relation-finder';

export const metadata: Metadata = { title: 'Tìm kiếm & Quan hệ' };

/** Module 7 — Tìm kiếm & Truy xuất quan hệ (AI) */
export default function RelationsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="flex items-center gap-2 text-xl font-bold text-primary dark:text-gold md:text-2xl">
        <Search className="h-6 w-6 text-gold" /> Tìm kiếm &amp; Truy xuất quan hệ
      </h1>
      <p className="text-sm text-muted-foreground">
        Chọn hai thành viên để xác định quan hệ, tổ tiên chung và đường phả hệ.
      </p>
      <RelationFinder />
    </div>
  );
}
