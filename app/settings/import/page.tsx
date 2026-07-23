'use client';

import { useState } from 'react';
import Link from 'next/link';
import { validateBackup, planImport, summarize, type ImportPlan } from '@/lib/import-backup';

/** Cài đặt → Nhập dữ liệu từ bản HTML (file Sao lưu JSON) */
export default function ImportPage() {
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [raw, setRaw] = useState<unknown>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string>('');
  const [replace, setReplace] = useState(true);

  const onFile = (f?: File) => {
    setError(''); setPlan(null); setDone('');
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const json = JSON.parse(String(r.result));
        const v = validateBackup(json);
        if (!v.ok || !v.data) { setError(v.error || 'File không hợp lệ'); return; }
        setRaw(json);
        setPlan(planImport(v.data));
      } catch { setError('Không đọc được file — hãy chọn đúng file Sao lưu (JSON) xuất từ app HTML.'); }
    };
    r.readAsText(f);
  };

  const run = async () => {
    if (!raw) return;
    setBusy(true); setError(''); setDone('');
    try {
      const res = await fetch(`/api/import${replace ? '?mode=replace' : ''}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(raw),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Import thất bại');
      setDone(`✅ Đã nhập: ${j.summary}${j.warnings?.length ? ` — Lưu ý: ${j.warnings.join('; ')}` : ''}`);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-primary md:text-2xl">⬆ Nhập dữ liệu từ bản HTML</h1>
      <p className="text-sm text-muted-foreground">
        Trong app HTML: <b>Cài đặt → Dữ liệu → Sao lưu (JSON)</b> để tải file, rồi chọn file đó ở đây.
        Thành viên, quan hệ, chi nhánh, quỹ công đức, tư liệu nhà thờ họ sẽ vào bảng riêng; các phần còn lại
        (sự kiện, mộ phần, hoành phi…) được giữ nguyên trong kho cấu hình.
      </p>

      <div className="rounded-lg border bg-card p-5 space-y-4">
        <input type="file" accept="application/json"
          onChange={(e: { target: { files?: FileList | null } }) => onFile(e.target.files?.[0])}
          className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground" />

        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">⚠ {error}</p>}

        {plan && (
          <div className="space-y-3">
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
              <b>Sẽ nhập:</b> {summarize(plan)}
              {plan.warnings.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-amber-800">{plan.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={replace}
                onChange={(e: { target: { checked: boolean } }) => setReplace(e.target.checked)} />
              Xóa dữ liệu hiện có trước khi nhập (khuyên dùng cho lần nhập đầu)
            </label>
            <button onClick={run} disabled={busy}
              className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {busy ? 'Đang nhập…' : '⬆ Bắt đầu nhập'}
            </button>
          </div>
        )}

        {done && <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">{done}</p>}
      </div>

      <p className="text-xs text-muted-foreground">
        Yêu cầu: đã cấu hình Supabase (DATABASE_URL) và đăng nhập bằng tài khoản quản trị.{' '}
        <Link href="/settings" className="underline">← Quay lại Cài đặt</Link>
      </p>
    </div>
  );
}
