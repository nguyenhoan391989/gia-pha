import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MemberForm from '@/components/member-form';
import { getBranches } from '@/lib/data';

export const metadata: Metadata = { title: 'Thêm thành viên' };
export const dynamic = 'force-dynamic';

/** Thêm thành viên mới (quản lý xuất đinh) — form hồ sơ đầy đủ */
export default async function NewMemberPage() {
  const branches = await getBranches();
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold text-primary dark:text-gold md:text-2xl">
          <UserPlus className="h-6 w-6 text-gold" /> Thêm thành viên
        </h1>
        <Button variant="outline" asChild><Link href="/members"><ArrowLeft /> Quay lại</Link></Button>
      </div>
      <Card><CardContent className="p-5"><MemberForm mode="create" branches={branches} /></CardContent></Card>
    </div>
  );
}
