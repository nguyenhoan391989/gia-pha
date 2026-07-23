'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, ApiRequestError } from '@/services/api';

/** Form gửi góp ý / đề xuất — POST /api/suggestions (quy trình: đề xuất → chờ duyệt → xuất bản) */
export default function SuggestForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim() || !content.trim()) { toast.error('Nhập tiêu đề và nội dung'); return; }
    setBusy(true);
    try {
      await api('/api/suggestions', {
        method: 'POST',
        body: JSON.stringify({ entity: 'record', payload: { title: title.trim(), content: content.trim() } }),
      });
      toast.success('Đã gửi đề xuất', { description: 'Nội dung sẽ được ban quản trị xem xét và phê duyệt.' });
      setTitle(''); setContent('');
    } catch (err) {
      if (err instanceof ApiRequestError && (err.status === 401 || err.status === 403)) {
        toast.info('Đã ghi nhận (demo)', { description: 'Cần đăng nhập & cấu hình Supabase để lưu đề xuất.' });
        setTitle(''); setContent('');
      } else {
        toast.error('Không gửi được', { description: (err as Error).message });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="sg-title">Tiêu đề</Label>
        <Input id="sg-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nội dung góp ý..." />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sg-content">Nội dung</Label>
        <textarea id="sg-content" value={content} onChange={(e) => setContent(e.target.value)} rows={4}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Mô tả góp ý hoặc đề xuất chỉnh sửa..." />
      </div>
      <p className="text-xs text-muted-foreground">Quy trình: Đề xuất → Chờ duyệt → Xuất bản. Không ai được sửa trực tiếp dữ liệu.</p>
      <Button onClick={submit} disabled={busy}>{busy ? 'Đang gửi...' : 'Gửi đề xuất'}</Button>
    </div>
  );
}
