/**
 * Xuất dữ liệu gia phả: GEDCOM 5.5.1, CSV, HTML in ấn (browser in ra PDF).
 * Các hàm ở đây là pure function trên dữ liệu đã truy vấn.
 */
import { MemberLite, RelationshipLite } from './tree';

export interface FullMember extends MemberLite {
  common_name?: string | null;
  birth_date_lunar?: string | null;
  death_date_lunar?: string | null;
  birth_place?: string | null;
  burial_place?: string | null;
  occupation?: string | null;
  education?: string | null;
  title?: string | null;
  biography?: string | null;
}

function gedcomDate(iso?: string | null): string | null {
  if (!iso) return null;
  const m = String(iso).slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return `${parseInt(m[3], 10)} ${months[parseInt(m[2], 10) - 1]} ${m[1]}`;
}

/** Sinh file GEDCOM 5.5.1 (chuẩn gia phả quốc tế) */
export function toGedcom(members: FullMember[], rels: RelationshipLite[]): string {
  const lines: string[] = [
    '0 HEAD',
    '1 SOUR GiaPhaVN',
    '2 NAME Gia Pha Dong Ho Viet Nam',
    '1 GEDC',
    '2 VERS 5.5.1',
    '2 FORM LINEAGE-LINKED',
    '1 CHAR UTF-8',
  ];

  // Đánh chỉ số cá nhân @I n@
  const idx = new Map<string, number>();
  members.forEach((m, i) => idx.set(m.id, i + 1));

  // Gia đình = cặp (father, mother) hoặc cặp vợ chồng
  interface Fam { husb?: string; wife?: string; children: string[] }
  const famMap = new Map<string, Fam>();
  const famKey = (h?: string, w?: string) => `${h || '-'}|${w || '-'}`;

  const parentsOf = new Map<string, { father?: string; mother?: string }>();
  for (const r of rels) {
    if (r.relationship_type === 'father' || r.relationship_type === 'mother') {
      const p = parentsOf.get(r.member_id) || {};
      if (r.relationship_type === 'father') p.father = r.related_member_id;
      else p.mother = r.related_member_id;
      parentsOf.set(r.member_id, p);
    }
  }
  for (const [child, p] of parentsOf) {
    if (!idx.has(child)) continue;
    const key = famKey(p.father, p.mother);
    if (!famMap.has(key)) famMap.set(key, { husb: p.father, wife: p.mother, children: [] });
    famMap.get(key)!.children.push(child);
  }
  for (const r of rels) {
    if (r.relationship_type === 'spouse') {
      const a = members.find((m) => m.id === r.member_id);
      const b = members.find((m) => m.id === r.related_member_id);
      if (!a || !b) continue;
      const husb = a.gender === 'female' ? b.id : a.id;
      const wife = a.gender === 'female' ? a.id : b.id;
      const key = famKey(husb, wife);
      if (!famMap.has(key)) famMap.set(key, { husb, wife, children: [] });
    }
  }

  const famIdx = new Map<string, number>();
  let f = 1;
  for (const key of famMap.keys()) famIdx.set(key, f++);

  // INDI records
  for (const m of members) {
    const i = idx.get(m.id)!;
    lines.push(`0 @I${i}@ INDI`);
    lines.push(`1 NAME ${m.full_name}`);
    lines.push(`1 SEX ${m.gender === 'male' ? 'M' : m.gender === 'female' ? 'F' : 'U'}`);
    const bd = gedcomDate(m.birth_date as string);
    if (bd || m.birth_place) {
      lines.push('1 BIRT');
      if (bd) lines.push(`2 DATE ${bd}`);
      if (m.birth_place) lines.push(`2 PLAC ${m.birth_place}`);
    }
    const dd = gedcomDate(m.death_date as string);
    if (dd) {
      lines.push('1 DEAT');
      lines.push(`2 DATE ${dd}`);
    }
    if (m.occupation) lines.push(`1 OCCU ${m.occupation}`);
    if (m.biography) lines.push(`1 NOTE ${String(m.biography).replace(/\r?\n/g, ' ').slice(0, 200)}`);
    // FAMC: gia đình mà cá nhân là con
    const p = parentsOf.get(m.id);
    if (p) {
      const key = famKey(p.father, p.mother);
      if (famIdx.has(key)) lines.push(`1 FAMC @F${famIdx.get(key)}@`);
    }
    // FAMS: gia đình mà cá nhân là vợ/chồng
    for (const [key, fam] of famMap) {
      if (fam.husb === m.id || fam.wife === m.id) lines.push(`1 FAMS @F${famIdx.get(key)}@`);
    }
  }

  // FAM records
  for (const [key, fam] of famMap) {
    lines.push(`0 @F${famIdx.get(key)}@ FAM`);
    if (fam.husb && idx.has(fam.husb)) lines.push(`1 HUSB @I${idx.get(fam.husb)}@`);
    if (fam.wife && idx.has(fam.wife)) lines.push(`1 WIFE @I${idx.get(fam.wife)}@`);
    for (const c of fam.children) lines.push(`1 CHIL @I${idx.get(c)}@`);
  }

  lines.push('0 TRLR');
  return lines.join('\n');
}

/** Escape 1 ô CSV theo RFC 4180 */
function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Xuất CSV (mở được bằng Excel, có BOM để hiển thị đúng tiếng Việt) */
export function toCsv(members: FullMember[]): string {
  const headers = ['full_name', 'common_name', 'gender', 'birth_date', 'birth_date_lunar',
    'death_date', 'death_date_lunar', 'is_alive', 'birth_place', 'burial_place',
    'education', 'occupation', 'title', 'generation', 'biography'];
  const rows = members.map((m) =>
    headers.map((h) => csvCell((m as Record<string, unknown>)[h])).join(',')
  );
  return '﻿' + headers.join(',') + '\n' + rows.join('\n');
}

/** Trang HTML in ấn - người dùng bấm In / Lưu thành PDF trên trình duyệt */
export function toPrintableHtml(members: FullMember[], familyName: string): string {
  const esc = (s: unknown) =>
    String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const byGen = new Map<number, FullMember[]>();
  for (const m of members) {
    const g = (m.generation as number) || 0;
    if (!byGen.has(g)) byGen.set(g, []);
    byGen.get(g)!.push(m);
  }
  const sections = Array.from(byGen.keys()).sort((a, b) => a - b).map((g) => {
    const rows = byGen.get(g)!.map((m) => `
      <tr>
        <td>${esc(m.full_name)}</td>
        <td>${m.gender === 'male' ? 'Nam' : m.gender === 'female' ? 'Nữ' : ''}</td>
        <td>${esc(m.birth_date ? String(m.birth_date).slice(0, 10) : '')}${m.birth_date_lunar ? `<br/><small>ÂL: ${esc(m.birth_date_lunar)}</small>` : ''}</td>
        <td>${esc(m.death_date ? String(m.death_date).slice(0, 10) : (m.is_alive ? 'Còn sống' : ''))}${m.death_date_lunar ? `<br/><small>Giỗ: ${esc(m.death_date_lunar)} ÂL</small>` : ''}</td>
        <td>${esc(m.occupation || '')}</td>
        <td>${esc(m.biography || '').slice(0, 300)}</td>
      </tr>`).join('');
    return `<h2>Đời thứ ${g || '?'}</h2>
      <table><thead><tr><th>Họ tên</th><th>Giới tính</th><th>Ngày sinh</th><th>Ngày mất</th><th>Nghề nghiệp</th><th>Tiểu sử</th></tr></thead>
      <tbody>${rows}</tbody></table>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="vi"><head><meta charset="UTF-8"/>
<title>Gia phả ${esc(familyName)}</title>
<style>
  body { font-family: 'Times New Roman', serif; margin: 40px; color: #3d2b1f; }
  h1 { text-align: center; color: #8b0000; }
  h2 { color: #8b4513; border-bottom: 2px solid #d4a017; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th, td { border: 1px solid #b8860b; padding: 6px 8px; text-align: left; vertical-align: top; font-size: 13px; }
  th { background: #f5e6c8; }
  @media print { body { margin: 10mm; } }
</style></head>
<body>
  <h1>GIA PHẢ ${esc(familyName).toUpperCase()}</h1>
  <p style="text-align:center"><em>Xuất ngày ${new Date().toLocaleDateString('vi-VN')} — Dùng chức năng In của trình duyệt để lưu thành PDF</em></p>
  ${sections}
</body></html>`;
}
