'use client';

import { useState } from 'react';
import { dayInfo, rateDay, gioHoangDao, GIO_RANGE, CHI, PURPOSES, type Purpose } from '@/lib/can-chi';
import { RITUALS, RL_CATS, RITUAL_SPEC, OFFERINGS, RITUAL_STEPS, MIEN_NOTE, prayerTraditional, prayerModern, lunarDateString, type RitualCat } from '@/lib/van-khan';
import { HV_DISCLAIMER } from '@/lib/huyen-hoc';

const WD = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const DAY_MS = 86400000;

/** 🏮 Trợ lý gia tộc: Lịch vạn niên + Thư viện văn khấn (chạy thuần client, không cần DB) */
export default function TroLyPage() {
  const [tab, setTab] = useState<'lich' | 'ngaytot' | 'vankhan'>('lich');
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-xl font-bold text-primary md:text-2xl">🏮 Trợ lý gia tộc</h1>
      <div className="flex flex-wrap gap-2">
        {([['lich', '📅 Lịch vạn niên'], ['ngaytot', '🎯 Xem ngày tốt'], ['vankhan', '📜 Văn khấn & nghi lễ']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border ${tab === k ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:border-primary'}`}>
            {l}
          </button>
        ))}
      </div>
      {tab === 'lich' && <LichTab />}
      {tab === 'ngaytot' && <NgayTotTab />}
      {tab === 'vankhan' && <VanKhanTab />}
      <p className="rounded-md border-l-4 border-amber-500 bg-amber-50 p-3 text-xs text-amber-900">ℹ️ {HV_DISCLAIMER}</p>
    </div>
  );
}

function LichTab() {
  const [t, setT] = useState(() => new Date());
  const i = dayInfo(t);
  const week = Array.from({ length: 7 }, (_, k) => new Date(t.getTime() + (k - 3) * DAY_MS));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className="rounded-md border px-3 py-1" onClick={() => setT(new Date(t.getTime() - DAY_MS))}>‹</button>
        <input type="date" className="rounded-md border px-2 py-1 text-sm"
          value={`${i.solar.y}-${String(i.solar.m).padStart(2, '0')}-${String(i.solar.d).padStart(2, '0')}`}
          onChange={(e: { target: { value: string } }) => { const [y, m, d] = e.target.value.split('-').map(Number); if (y) setT(new Date(y, m - 1, d)); }} />
        <button className="rounded-md border px-3 py-1" onClick={() => setT(new Date(t.getTime() + DAY_MS))}>›</button>
        <button className="rounded-md border px-3 py-1 text-sm" onClick={() => setT(new Date())}>Hôm nay</button>
      </div>
      <div className="flex gap-1.5">
        {week.map((w, k) => {
          const wi = dayInfo(w);
          return (
            <button key={k} onClick={() => setT(w)}
              className={`flex-1 rounded-lg border p-1.5 text-center text-xs ${k === 3 ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
              <div className="opacity-75">{['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][w.getDay()]}</div>
              <div className="text-base font-bold">{w.getDate()}</div>
              <div className="opacity-75">{wi.lunar.day}/{wi.lunar.month} âm</div>
            </button>
          );
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border-2 border-amber-400 bg-gradient-to-b from-red-900 to-red-950 p-5 text-center text-amber-100">
          <div className="text-sm opacity-90">{WD[i.solar.weekday]}, {i.solar.d}/{i.solar.m}/{i.solar.y}</div>
          <div className="text-5xl font-extrabold leading-tight">{i.lunar.day}</div>
          <div className="text-sm">Tháng {i.lunar.month}{i.lunar.isLeapMonth ? ' nhuận' : ''} năm <b>{i.namCC.can} {i.namCC.chi}</b></div>
          <div className="mt-1 text-xs opacity-95">Ngày <b>{i.ngayCC.can} {i.ngayCC.chi}</b> · Tháng <b>{i.thangCC.can} {i.thangCC.chi}</b></div>
          <span className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-bold ${i.star.hoangDao ? 'bg-green-700' : 'bg-red-700'}`}>
            {i.star.hoangDao ? '⭐ Hoàng đạo' : '⚫ Hắc đạo'} · {i.star.name}
          </span>
        </div>
        <div className="space-y-2 rounded-xl border bg-card p-4 text-sm">
          {i.leAm && <div className="inline-block rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">🏮 {i.leAm}</div>}
          {i.leDuong && <div className="inline-block rounded-full bg-amber-600 px-3 py-0.5 text-xs font-semibold text-white">🇻🇳 {i.leDuong}</div>}
          <div>🌤 Tiết khí: <b>{i.tietKhi}</b></div>
          {i.tamNuong && <div className="text-red-700">⚠️ Ngày Tam nương — kiêng khởi sự lớn</div>}
          {i.nguyetKy && <div className="text-red-700">⚠️ Ngày Nguyệt kỵ</div>}
          <div><b>🕐 Giờ hoàng đạo:</b><div className="mt-1 flex flex-wrap gap-1">
            {i.gioTot.map((h) => <span key={h} className="rounded-md border bg-background px-2 py-0.5 text-xs">{CHI[h]} {GIO_RANGE[h]}</span>)}
          </div></div>
          <div className="text-xs text-muted-foreground">Giờ hắc đạo: {i.gioXau.map((h) => CHI[h]).join(', ')}</div>
        </div>
      </div>
    </div>
  );
}

function NgayTotTab() {
  const [purpose, setPurpose] = useState<Purpose>('cuoi');
  const [base, setBase] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dim = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const rows = Array.from({ length: dim }, (_, k) => new Date(base.getFullYear(), base.getMonth(), k + 1))
    .filter((d) => d >= today)
    .map((d) => ({ d, r: rateDay(d, purpose), i: dayInfo(d) }))
    .sort((a, b) => b.r.score - a.r.score)
    .slice(0, 10);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <select className="rounded-md border px-2 py-1.5" value={purpose}
          onChange={(e: { target: { value: string } }) => setPurpose(e.target.value as Purpose)}>
          {PURPOSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <button className="rounded-md border px-3 py-1" onClick={() => setBase(new Date(base.getFullYear(), base.getMonth() - 1, 1))}>‹</button>
        <b>Tháng {base.getMonth() + 1}/{base.getFullYear()}</b>
        <button className="rounded-md border px-3 py-1" onClick={() => setBase(new Date(base.getFullYear(), base.getMonth() + 1, 1))}>›</button>
      </div>
      <p className="text-xs text-muted-foreground">Chấm điểm theo lệ dân gian phổ thông (hoàng/hắc đạo, Tam nương, Nguyệt kỵ) — giải thích dễ hiểu, chỉ mang tính tham khảo.</p>
      {rows.length === 0 && <p className="text-sm text-muted-foreground">Tháng này đã qua — chọn tháng sau.</p>}
      {rows.map(({ d, r, i }) => (
        <div key={d.getTime()} className="rounded-lg border bg-card p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <b>{['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]} {d.getDate()}/{base.getMonth() + 1}</b>
            <span className="text-xs text-muted-foreground">(âm {i.lunar.day}/{i.lunar.month} · {i.ngayCC.can} {i.ngayCC.chi})</span>
            <span className={`ml-auto font-bold ${r.score >= 8 ? 'text-green-700' : r.score >= 6 ? 'text-amber-700' : r.score >= 4 ? 'text-muted-foreground' : 'text-red-700'}`}>
              {r.label} · {r.score}/10
            </span>
          </div>
          <ul className="mt-1 list-disc pl-5 text-xs">{r.reasons.map((w, k) => <li key={k}>{w}</li>)}</ul>
          <div className="mt-1 text-xs"><b>Giờ tốt:</b> {gioHoangDao(i.ngayCC.chiIdx).map((h) => `${CHI[h]} ${GIO_RANGE[h]}`).join(' · ')}</div>
        </div>
      ))}
    </div>
  );
}

function VanKhanTab() {
  const [cat, setCat] = useState<RitualCat>('nam');
  const [sel, setSel] = useState<string>('');
  const [host, setHost] = useState('');
  const [wish, setWish] = useState('');
  const [ver, setVer] = useState<'trad' | 'modern'>('trad');
  const [big, setBig] = useState(false);
  const [copied, setCopied] = useState(false);
  const ritual = RITUALS.find((r) => r.id === sel);
  const clanName = 'Dòng họ'; // GĐ5: đọc từ app_state.org
  const prayer = ritual
    ? (ver === 'trad' ? prayerTraditional : prayerModern)({ ritualName: ritual.name, clanName, host: host || undefined, wish: wish || undefined })
    : '';
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {RL_CATS.map(([k, l]) => (
          <button key={k} onClick={() => { setCat(k as RitualCat); setSel(''); }}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${cat === k ? 'bg-primary text-primary-foreground border-primary' : 'bg-card'}`}>{l}</button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {RITUALS.filter((r) => r.cat === cat).map((r) => (
          <button key={r.id} onClick={() => setSel(r.id === sel ? '' : r.id)}
            className={`rounded-lg border p-3 text-left text-sm ${sel === r.id ? 'border-primary ring-1 ring-primary' : 'bg-card hover:border-amber-400'}`}>
            <b>📜 {r.name}</b>
            <div className="text-xs text-muted-foreground">{r.lunarDate} · {r.summary}</div>
          </button>
        ))}
      </div>
      {ritual && (
        <div className="space-y-3 rounded-xl border-2 border-amber-300 bg-card p-4">
          <h2 className="font-bold text-primary">📜 {ritual.name}</h2>
          <p className="text-sm">{ritual.summary}.{RITUAL_SPEC[ritual.id] && <> <b>Thời gian:</b> {RITUAL_SPEC[ritual.id].time}. {RITUAL_SPEC[ritual.id].extra}</>}</p>
          <details className="text-sm"><summary className="cursor-pointer font-semibold text-primary">🧺 Lễ vật ({OFFERINGS.length} món)</summary>
            <div className="mt-2 grid gap-1 sm:grid-cols-2">{OFFERINGS.map((o) => (
              <div key={o.name} className="rounded-md border bg-background px-2 py-1 text-xs" title={o.purpose}>
                {o.icon} <b>{o.name}</b> {o.required ? <span className="text-red-700">• bắt buộc</span> : <span className="text-muted-foreground">• tùy chọn</span>}
              </div>))}
            </div>
          </details>
          <details className="text-sm"><summary className="cursor-pointer font-semibold text-primary">📋 Trình tự 10 bước</summary>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs">{RITUAL_STEPS.map(([t2, d2]) => <li key={t2}><b>{t2}</b> — {d2}</li>)}</ol>
          </details>
          <details className="text-sm"><summary className="cursor-pointer font-semibold text-primary">🗾 Phong tục ba miền</summary>
            <p className="mt-1 text-xs">{MIEN_NOTE}</p>
          </details>
          <div className="space-y-2 rounded-lg border bg-background p-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <input className="min-w-40 flex-1 rounded-md border px-2 py-1.5" placeholder="Người chủ lễ (tùy chọn)" value={host}
                onChange={(e: { target: { value: string } }) => setHost(e.target.value)} />
              <input className="min-w-52 flex-1 rounded-md border px-2 py-1.5" placeholder="Mong cầu (tùy chọn)" value={wish}
                onChange={(e: { target: { value: string } }) => setWish(e.target.value)} />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button className={`rounded-md border px-2 py-1 ${ver === 'trad' ? 'bg-primary text-primary-foreground' : ''}`} onClick={() => setVer('trad')}>Bản truyền thống</button>
              <button className={`rounded-md border px-2 py-1 ${ver === 'modern' ? 'bg-primary text-primary-foreground' : ''}`} onClick={() => setVer('modern')}>Bản hiện đại</button>
              <button className={`rounded-md border px-2 py-1 ${big ? 'bg-primary text-primary-foreground' : ''}`} onClick={() => setBig(!big)}>A+</button>
              <button className="rounded-md border px-2 py-1" onClick={() => { void navigator.clipboard.writeText(prayer); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                {copied ? '✓ Đã chép' : '📋 Chép'}
              </button>
              <span className="text-muted-foreground">Hôm nay: {lunarDateString()}</span>
            </div>
            <pre className={`whitespace-pre-wrap rounded-md border bg-card p-3 font-serif leading-relaxed ${big ? 'text-lg' : 'text-sm'}`}>{prayer}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
