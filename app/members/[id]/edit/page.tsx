import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MemberForm, { type MemberFormValues } from '@/components/member-form';
import { getMemberDetail, getBranches } from '@/lib/data';

export const metadata: Metadata = { title: 'Sửa hồ sơ thành viên' };
export const dynamic = 'force-dynamic';

/** Sửa hồ sơ thành viên — form hồ sơ đầy đủ, điền sẵn dữ liệu hiện có */
export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [detail, branches] = await Promise.all([getMemberDetail(id), getBranches()]);
  if (!detail) notFound();
  const m = detail.member;

  const initial: Partial<MemberFormValues> = {
    full_name: m.name,
    gender: m.gender,
    birthYear: m.birthYear ? String(m.birthYear) : '',
    deathYear: m.deathYear ? String(m.deathYear) : '',
    is_alive: m.isAlive ?? m.deathYear == null,
    birth_place: m.birthPlace ?? '',
    occupation: m.occupation ?? '',
    title: m.role ?? '',
    generation: m.generation ? String(m.generation) : '',
    biography: m.note ?? '',
    branch_id: branches.find((b) => b.name === m.family)?.id ?? '',
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold text-primary dark:text-gold md:text-2xl">
          <Pencil className="h-6 w-6 text-gold" /> Sửa hồ sơ: {m.name}
        </h1>
        <Button variant="outline" asChild><Link href={`/members/${id}`}><ArrowLeft /> Quay lại</Link></Button>
      </div>
      <Card><CardContent className="p-5"><MemberForm mode="edit" memberId={id} branches={branches} initial={initial} /></CardContent></Card>
    </div>
  );
}
