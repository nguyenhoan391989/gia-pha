'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FAMILIES, RELATIONS } from '@/lib/mock-data';

/** Thẻ người trong sơ đồ quan hệ */
function Person({ name, years }: { name: string; years: string }) {
  return (
    <span className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-md">
      <Avatar className="h-7 w-7">
        <AvatarFallback className="bg-gold/20 text-xs text-primary dark:text-gold">
          {name.split(' ').pop()!.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span className="leading-tight">
        <span className="block whitespace-nowrap font-medium">{name}</span>
        <span className="block text-[11px] text-muted-foreground">({years})</span>
      </span>
    </span>
  );
}

/** 06. Hồ sơ gia đình - sơ đồ quan hệ (cha mẹ / vợ chồng / con cái / anh chị em) + danh sách gia đình */
export default function FamiliesPage() {
  const [selected, setSelected] = useState('1');

  const Group = ({ title, people }: { title: string; people: { name: string; years: string }[] }) => (
    <div className="relative pl-4">
      <span className="absolute bottom-2 left-0 top-2 w-px bg-gold/60" />
      <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {people.map((p) => <Person key={p.name} {...p} />)}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-xl font-bold text-primary dark:text-gold md:text-2xl">Quan hệ gia đình</h1>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Nguyễn Văn A (1950)</SelectItem>
            <SelectItem value="3">Nguyễn Văn C (1955)</SelectItem>
            <SelectItem value="4">Nguyễn Văn D (1975)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sơ đồ quan hệ - theo storyboard màn 06 */}
      <Card>
        <CardContent className="space-y-6 p-5 md:p-6">
          <Group title="Cha mẹ" people={RELATIONS.parents} />
          <Group title="Vợ / Chồng" people={RELATIONS.spouse} />
          <Group title="Con cái" people={RELATIONS.children} />
          <Group title="Anh chị em" people={RELATIONS.siblings} />
        </CardContent>
      </Card>

      {/* Danh sách hồ sơ gia đình */}
      <Card>
        <CardHeader><CardTitle className="text-primary dark:text-gold">Hồ sơ các gia đình (68)</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FAMILIES.map((f) => (
            <div key={f.id} className="rounded-lg border p-4 transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{f.name}</span>
                <Badge variant="gold">Đời {f.generation}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Trưởng gia đình: {f.head}</p>
              <p className="text-sm text-muted-foreground">{f.members} thành viên</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Hiển thị sơ đồ quan hệ gia đình của thành viên · Dễ dàng theo dõi mối quan hệ
      </p>
    </div>
  );
}
