'use client';

import { useMemo, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listPeople, relationship, type RelationResult } from '@/lib/kinship';

/** Tìm & truy xuất quan hệ giữa hai thành viên (tính trên cây gia phả) */
export default function RelationFinder() {
  const people = useMemo(() => listPeople(), []);
  const [a, setA] = useState<string>(String(people[0]?.id ?? ''));
  const [b, setB] = useState<string>(String(people[people.length - 1]?.id ?? ''));
  const [result, setResult] = useState<RelationResult | null>(null);

  const lookup = () => setResult(relationship(Number(a), Number(b)));

  const PersonSelect = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
    <div className="flex-1">
      <div className="mb-1 text-xs text-muted-foreground">{label}</div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {people.map((p) => (
            <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.years})</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card className="frame-gold">
        <CardContent className="p-5">
          <div className="flex flex-col items-end gap-3 sm:flex-row">
            <PersonSelect value={a} onChange={setA} label="Người thứ nhất" />
            <span className="pb-2 text-muted-foreground">↔</span>
            <PersonSelect value={b} onChange={setB} label="Người thứ hai" />
            <Button onClick={lookup} className="w-full sm:w-auto"><Sparkles className="h-4 w-4" /> Tra cứu (AI)</Button>
          </div>

          {result && (
            <div className="mt-5 rounded-lg border border-gold/40 bg-accent/50 p-4 text-center">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Kết quả</div>
              <div className="mt-1 font-serif text-lg font-bold text-primary dark:text-gold">{result.label}</div>
              <p className="mt-1 text-sm text-muted-foreground">{result.detail}</p>
              {result.path.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-sm">
                  {result.path.map((name, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="rounded-md border bg-card px-2 py-0.5">{name}</span>
                      {i < result.path.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-gold" />}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        * Bản tính trên cây gia phả mẫu. Khi có dữ liệu thật, sẽ nối API quan hệ (bảng <code>relationships</code>) và có thể tích hợp
        GPT/Claude để diễn giải xưng hô tự nhiên hơn.
      </p>
    </div>
  );
}
