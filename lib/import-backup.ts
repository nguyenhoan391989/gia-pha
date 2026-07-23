/**
 * Nhập file "Sao lưu (JSON)" từ bản gia-pha-app.html vào database.
 * Module THUẦN TÚY: parse + validate + lập kế hoạch import (có unit test).
 * Việc ghi DB nằm ở app/api/import/route.ts (transaction).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface HtmlMember {
  id: number; name: string; gender?: string; birthYear?: number | string; deathYear?: number | string;
  alive?: boolean; birthPlace?: string; occupation?: string; address?: string; generation?: number;
  branch?: string; branchL1?: string; fatherId?: number; spouseId?: number; bio?: string; avatar?: string;
}
export interface HtmlBackup {
  org?: { type?: string; name?: string; display?: string; short?: string };
  terms?: Record<string, string>;
  clan?: Record<string, unknown>;
  branchesL1?: string[]; branches?: string[];
  members?: HtmlMember[];
  fund?: Array<{ id: number; date?: string; name?: string; purpose?: string; amount?: number; type?: string; method?: string; note?: string }>;
  heritage?: Record<string, string | { text?: string; images?: string[]; videos?: string[] }>;
  events?: unknown[]; graves?: unknown[]; restoration?: unknown[]; notices?: unknown[];
  couplet?: Record<string, unknown>; ritualCustom?: Record<string, unknown>;
  photos?: Array<Record<string, unknown>>;
  [k: string]: unknown;
}

export interface PlannedMember {
  oldId: number; fullName: string; gender: 'male' | 'female' | 'other';
  birthDate: string | null; deathDate: string | null; isAlive: boolean;
  birthPlace: string | null; occupation: string | null; biography: string | null;
  generation: number | null; branchName: string | null;
}
export interface PlannedRelationship { fromOldId: number; toOldId: number; type: 'father' | 'spouse' }
export interface PlannedContribution { contributorName: string; purpose: string; amount: number; note: string | null; contributedAt: string | null; direction: 'thu' | 'chi' }
export interface PlannedRecord { recordType: string; title: string; content: string }
export interface ImportPlan {
  branches: string[];
  members: PlannedMember[];
  relationships: PlannedRelationship[];
  contributions: PlannedContribution[];
  familyRecords: PlannedRecord[];
  appState: Array<{ key: string; value: unknown }>;
  warnings: string[];
}

const HERITAGE_TYPE: Record<string, [string, string]> = {
  intro: ['pha_ky', 'Giới thiệu'], history: ['pha_ky', 'Lịch sử dòng họ'], thuyto: ['van_te', 'Câu chuyện Thủy tổ'],
  giahuan: ['gia_huan', 'Gia huấn'], giaquy: ['gia_huan', 'Gia quy'], sacphong: ['ngoai_pha', 'Sắc phong'],
};

/** dd/mm/yyyy -> ISO yyyy-mm-dd (null nếu không parse được) */
export function parseVnDate(s?: string): string | null {
  const m = String(s || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

const yearToIso = (y: unknown, end = false): string | null => {
  const n = parseInt(String(y ?? ''), 10);
  if (!n || n < 1000 || n > 3000) return null;
  return end ? `${n}-12-31` : `${n}-01-01`;
};

/** Cắt bỏ ảnh/video base64 (data:) nặng khỏi object trước khi lưu app_state */
export function stripBase64(value: unknown, maxLen = 2000): unknown {
  if (typeof value === 'string') return value.startsWith('data:') && value.length > maxLen ? '[đã lược ảnh nhúng — tải lại qua Storage]' : value;
  if (Array.isArray(value)) return value.map((v) => stripBase64(v, maxLen));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = stripBase64(v, maxLen);
    return out;
  }
  return value;
}

export function validateBackup(raw: unknown): { ok: boolean; error?: string; data?: HtmlBackup } {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'File không phải JSON hợp lệ' };
  const b = raw as HtmlBackup;
  if (!Array.isArray(b.members)) return { ok: false, error: 'Thiếu danh sách thành viên (members) — không phải file Sao lưu của app Gia Phả' };
  if (b.members.some((m) => !m || typeof m.id !== 'number' || !m.name)) return { ok: false, error: 'Danh sách thành viên có bản ghi thiếu id/tên' };
  return { ok: true, data: b };
}

export function planImport(b: HtmlBackup): ImportPlan {
  const warnings: string[] = [];
  const members: PlannedMember[] = (b.members || []).map((m) => ({
    oldId: m.id,
    fullName: String(m.name).trim(),
    gender: m.gender === 'Nam' ? 'male' : m.gender === 'Nữ' ? 'female' : 'other',
    birthDate: yearToIso(m.birthYear),
    deathDate: yearToIso(m.deathYear, true),
    isAlive: m.alive !== false,
    birthPlace: m.birthPlace || null,
    occupation: m.occupation || null,
    biography: m.bio || null,
    generation: typeof m.generation === 'number' ? m.generation : null,
    branchName: m.branch || null,
  }));

  const ids = new Set(members.map((m) => m.oldId));
  const relationships: PlannedRelationship[] = [];
  const seenSpouse = new Set<string>();
  for (const m of b.members || []) {
    if (m.fatherId && ids.has(m.fatherId)) relationships.push({ fromOldId: m.id, toOldId: m.fatherId, type: 'father' });
    else if (m.fatherId) warnings.push(`Bỏ qua cha không tồn tại (member ${m.id})`);
    if (m.spouseId && ids.has(m.spouseId)) {
      const key = [Math.min(m.id, m.spouseId), Math.max(m.id, m.spouseId)].join('-');
      if (!seenSpouse.has(key)) { seenSpouse.add(key); relationships.push({ fromOldId: m.id, toOldId: m.spouseId, type: 'spouse' }); }
    }
  }

  const branches = Array.from(new Set([...(b.branches || []), ...members.map((m) => m.branchName).filter(Boolean) as string[]]));

  const contributions: PlannedContribution[] = (b.fund || []).map((f) => ({
    contributorName: f.name || 'Không rõ',
    purpose: f.purpose || (f.type === 'Chi' ? 'Chi quỹ' : 'Công đức'),
    amount: Math.abs(Number(f.amount) || 0),
    note: [f.method, f.note, f.type === 'Chi' ? '[KHOẢN CHI]' : null].filter(Boolean).join(' · ') || null,
    contributedAt: parseVnDate(f.date),
    direction: f.type === 'Chi' ? 'chi' : 'thu',
  }));

  const familyRecords: PlannedRecord[] = Object.entries(b.heritage || {})
    .filter(([k]) => HERITAGE_TYPE[k])
    .map(([k, v]) => {
      const text = typeof v === 'string' ? v : v?.text || '';
      return { recordType: HERITAGE_TYPE[k][0], title: HERITAGE_TYPE[k][1], content: text };
    })
    .filter((r) => r.content.trim());

  const stateKeys = ['org', 'terms', 'clan', 'branchesL1', 'couplet', 'events', 'graves', 'restoration', 'notices', 'ritualCustom'] as const;
  const appState = stateKeys
    .filter((k) => b[k] != null)
    .map((k) => ({ key: k, value: stripBase64(b[k]) }));
  if ((b.photos || []).length) warnings.push(`${b.photos!.length} ảnh thư viện dạng nhúng không được import — hãy tải lại qua Storage sau khi có Supabase`);

  return { branches, members, relationships, contributions, familyRecords, appState, warnings };
}

export function summarize(plan: ImportPlan): string {
  return [
    `${plan.members.length} thành viên`, `${plan.relationships.length} quan hệ`, `${plan.branches.length} chi/nhánh`,
    `${plan.contributions.length} giao dịch quỹ`, `${plan.familyRecords.length} tư liệu nhà thờ họ`,
    `${plan.appState.length} khối cấu hình (sự kiện, mộ phần, hoành phi…)`,
  ].join(' · ');
}
