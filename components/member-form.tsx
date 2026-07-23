'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, ApiRequestError } from '@/services/api';

export interface MemberFormValues {
  full_name: string;
  common_name: string;
  gender: 'Nam' | 'Nữ';
  birthYear: string;
  deathYear: string;
  is_alive: boolean;
  birth_place: string;
  occupation: string;
  education: string;
  title: string;
  generation: string;
  branch_id: string;
  biography: string;
}

interface Branch { id: string; name: string }

interface Props {
  mode: 'create' | 'edit';
  memberId?: string;
  branches: Branch[];
  initial?: Partial<MemberFormValues>;
}

const EMPTY: MemberFormValues = {
  full_name: '', common_name: '', gender: 'Nam', birthYear: '', deathYear: '',
  is_alive: true, birth_place: '', occupation: '', education: '', title: '',
  generation: '', branch_id: '', biography: '',
};

/** Form hồ sơ thành viên đầy đủ — dùng cho cả Thêm (POST) và Sửa (PUT). */
export default function MemberForm({ mode, memberId, branches, initial }: Props) {
  const router = useRouter();
  const [v, setV] = useState<MemberFormValues>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof MemberFormValues>(k: K, val: MemberFormValues[K]) =>
    setV((prev) => ({ ...prev, [k]: val }));

  const buildPayload = () => ({
    full_name: v.full_name.trim(),
    common_name: v.common_name.trim() || null,
    gender: v.gender === 'Nữ' ? 'female' : 'male',
    birth_date: v.birthYear ? `${v.birthYear}-01-01` : null,
    death_date: v.deathYear ? `${v.deathYear}-12-31` : null,
    is_alive: v.is_alive,
    birth_place: v.birth_place.trim() || null,
    occupation: v.occupation.trim() || null,
    education: v.education.trim() || null,
    title: v.title.trim() || null,
    generation: v.generation ? Number(v.generation) : null,
    branch_id: v.branch_id || null,
    biography: v.biography.trim() || null,
  });

  const submit = async () => {
    if (!v.full_name.trim()) { toast.error('Vui lòng nhập họ tên'); return; }
    setSaving(true);
    const path = mode === 'create' ? '/api/members' : `/api/members/${memberId}`;
    try {
      await api(path, { method: mode === 'create' ? 'POST' : 'PUT', body: JSON.stringify(buildPayload()) });
      toast.success(mode === 'create' ? 'Đã thêm thành viên' : 'Đã cập nhật hồ sơ', { description: v.full_name.trim() });
      router.push('/members');
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError && (err.status === 401 || err.status === 403)) {
        toast.info('Chế độ xem thử (demo)', { description: 'Cần đăng nhập & cấu hình Supabase để lưu dữ liệu thật.' });
        router.push('/members');
      } else {
        toast.error('Không lưu được', { description: (err as Error).message });
      }
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, children }: { label: string; children: ReactNode }) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="fn">Họ và tên *</Label>
          <Input id="fn" value={v.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Nguyễn Văn ..." />
        </div>

        <Field label="Tên thường gọi">
          <Input value={v.common_name} onChange={(e) => set('common_name', e.target.value)} placeholder="Tên gọi khác" />
        </Field>
        <Field label="Giới tính">
          <Select value={v.gender} onValueChange={(val) => set('gender', val as 'Nam' | 'Nữ')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Nam">Nam</SelectItem><SelectItem value="Nữ">Nữ</SelectItem></SelectContent>
          </Select>
        </Field>

        <Field label="Năm sinh">
          <Input type="number" value={v.birthYear} onChange={(e) => set('birthYear', e.target.value)} placeholder="1950" />
        </Field>
        <Field label="Năm mất (nếu đã mất)">
          <Input type="number" value={v.deathYear} onChange={(e) => set('deathYear', e.target.value)} placeholder="2020" />
        </Field>

        <Field label="Nơi sinh">
          <Input value={v.birth_place} onChange={(e) => set('birth_place', e.target.value)} placeholder="Hà Nội" />
        </Field>
        <Field label="Đời (thế hệ)">
          <Select value={v.generation} onValueChange={(val) => set('generation', val)}>
            <SelectTrigger><SelectValue placeholder="Chọn đời" /></SelectTrigger>
            <SelectContent>{[1, 2, 3, 4, 5, 6, 7, 8].map((g) => <SelectItem key={g} value={String(g)}>Đời {g}</SelectItem>)}</SelectContent>
          </Select>
        </Field>

        <Field label="Nghề nghiệp">
          <Input value={v.occupation} onChange={(e) => set('occupation', e.target.value)} placeholder="Giáo viên" />
        </Field>
        <Field label="Học vấn">
          <Input value={v.education} onChange={(e) => set('education', e.target.value)} placeholder="Cử nhân..." />
        </Field>

        <Field label="Chức vụ / Vai trò trong họ">
          <Input value={v.title} onChange={(e) => set('title', e.target.value)} placeholder="Trưởng chi..." />
        </Field>
        <Field label="Gia đình / Chi">
          <Select value={v.branch_id} onValueChange={(val) => set('branch_id', val)}>
            <SelectTrigger><SelectValue placeholder="Chọn chi" /></SelectTrigger>
            <SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
          </Select>
        </Field>

        <div className="flex items-center gap-3 rounded-md border p-3 sm:col-span-2">
          <Switch checked={v.is_alive} onCheckedChange={(c) => set('is_alive', c)} id="alive" />
          <Label htmlFor="alive" className="cursor-pointer">{v.is_alive ? 'Còn sống' : 'Đã mất'}</Label>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="bio">Tiểu sử</Label>
          <textarea id="bio" value={v.biography} onChange={(e) => set('biography', e.target.value)} rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Tiểu sử, công trạng, ghi chú..." />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Ảnh &amp; tài liệu đính kèm</Label>
          <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            Tải ảnh chân dung / tài liệu (sẽ lưu vào Supabase Storage khi bật dữ liệu thật).
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/members')} disabled={saving}>Hủy</Button>
        <Button onClick={submit} disabled={saving}>{saving ? 'Đang lưu...' : mode === 'create' ? 'Thêm thành viên' : 'Lưu thay đổi'}</Button>
      </div>
    </div>
  );
}
