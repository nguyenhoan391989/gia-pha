import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMemberDetail, type RelationPerson } from '@/lib/data';
import { EVENTS, PHOTOS, DOCUMENTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/** 05. Chi tiết thành viên - header hồ sơ + 5 tab (Thông tin, Quan hệ, Sự kiện, Hình ảnh, Tài liệu) */
export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getMemberDetail(id);
  if (!detail) notFound();
  const { member, relations } = detail;

  const birth = member.birthYear ? `01/01/${member.birthYear}` : '—';
  const infoRows: [string, string][] = [
    ['Họ và tên', member.name],
    ['Ngày sinh', birth],
    ['Giới tính', member.gender],
    ['Nơi sinh', member.birthPlace ?? '—'],
    ['Nghề nghiệp', member.occupation ?? '—'],
    ['Gia đình', member.family],
    ['Vai trò', member.role ?? 'Thành viên'],
    ['Ghi chú', member.note ?? `Thành viên đời thứ ${member.generation}`],
  ];

  const RelGroup = ({ title, people }: { title: string; people: RelationPerson[] }) =>
    people.length === 0 ? null : (
      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {people.map((p) => (
            <span key={p.name} className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm shadow-sm">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gold/20 text-xs text-primary dark:text-gold">
                  {p.name.split(' ').pop()!.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{p.name} <span className="text-xs text-muted-foreground">({p.years})</span></span>
            </span>
          ))}
        </div>
      </div>
    );

  const hasRelations =
    relations.parents.length + relations.spouse.length +
    relations.children.length + relations.siblings.length > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary dark:text-gold md:text-2xl">Chi tiết thành viên</h1>
        <Button variant="outline" asChild>
          <Link href="/members"><ArrowLeft /> Quay lại</Link>
        </Button>
      </div>

      {/* Header hồ sơ */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <Avatar className="h-24 w-24 border-4 border-gold/50">
            <AvatarFallback className="text-2xl">{member.name.split(' ').pop()!.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold">{member.name}</h2>
              <Badge variant="gold">Đời thứ {member.generation || '—'}</Badge>
            </div>
            <dl className="mt-2 grid grid-cols-1 gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
              <div className="flex gap-2"><dt className="text-muted-foreground">Ngày sinh:</dt><dd>{birth}</dd></div>
              <div className="flex gap-2"><dt className="text-muted-foreground">Giới tính:</dt><dd>{member.gender}</dd></div>
              <div className="flex gap-2"><dt className="text-muted-foreground">Vai trò:</dt><dd>{member.role ?? 'Thành viên'}</dd></div>
              <div className="flex gap-2"><dt className="text-muted-foreground">Nghề nghiệp:</dt><dd>{member.occupation ?? '—'}</dd></div>
              <div className="flex gap-2"><dt className="text-muted-foreground">Gia đình:</dt><dd>{member.family}</dd></div>
              <div className="flex gap-2"><dt className="text-muted-foreground">Nơi sinh:</dt><dd>{member.birthPlace ?? '—'}</dd></div>
            </dl>
          </div>
          <Button variant="gold" asChild>
            <Link href={`/members/${member.id}/edit`}><Pencil /> Sửa</Link>
          </Button>
        </CardContent>
      </Card>

      {/* 5 tab */}
      <Tabs defaultValue="info">
        <TabsList className="thin-scroll overflow-x-auto">
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="relations">Quan hệ</TabsTrigger>
          <TabsTrigger value="events">Sự kiện</TabsTrigger>
          <TabsTrigger value="photos">Hình ảnh</TabsTrigger>
          <TabsTrigger value="docs">Tài liệu</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card><CardContent className="divide-y p-5">
            {infoRows.map(([k, v]) => (
              <div key={k} className="flex gap-3 py-2.5 text-sm">
                <span className="w-32 shrink-0 text-muted-foreground">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="relations">
          <Card><CardContent className="space-y-5 p-5">
            {hasRelations ? (
              <>
                <RelGroup title="Cha mẹ" people={relations.parents} />
                <RelGroup title="Vợ / Chồng" people={relations.spouse} />
                <RelGroup title="Con cái" people={relations.children} />
                <RelGroup title="Anh chị em" people={relations.siblings} />
              </>
            ) : (
              <p className="py-4 text-sm text-muted-foreground">Chưa có dữ liệu quan hệ cho thành viên này.</p>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="events">
          <Card><CardContent className="divide-y p-5">
            {EVENTS.slice(0, 4).map((e) => (
              <div key={e.id} className="flex items-center gap-3 py-2.5 text-sm">
                <Badge variant={e.type === 'Giỗ' ? 'default' : 'gold'}>{e.type}</Badge>
                <span className="flex-1 font-medium">{e.title}</span>
                <span className="text-muted-foreground">{e.date}</span>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="photos">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {PHOTOS.slice(0, 8).map((p) => (
              <figure key={p.id} className={cn('group relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br', p.gradient)}>
                <figcaption className="absolute inset-x-0 bottom-0 bg-black/50 p-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {p.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="docs">
          <Card><CardContent className="divide-y p-5">
            {DOCUMENTS.map((d) => (
              <div key={d.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="text-lg">📄</span>
                <span className="flex-1 font-medium">{d.name}</span>
                <span className="text-muted-foreground">{d.size}</span>
                <span className="hidden text-muted-foreground sm:inline">{d.date}</span>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
