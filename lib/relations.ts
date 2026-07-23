/**
 * Module 10 — Truy xuất quan hệ (server-only).
 * Thuật toán: dựng cây tổ tiên (parent theo dòng cha), tìm TỔ TIÊN CHUNG (LCA)
 * của hai người, từ khoảng cách đời suy ra tên gọi quan hệ tiếng Việt.
 *
 * Hàm `computeRelation` là THUẦN (pure) — nhận map các nút, nên dùng được cho
 * cả dữ liệu mẫu lẫn dữ liệu thật (Prisma) và sẵn sàng bọc thành API cho GPT/Claude.
 */

export interface RelNode {
  id: string;
  name: string;
  gen: number;
  parentId: string | null;
  spouseId?: string | null;
}

export interface RelationResult {
  found: boolean;
  label: string;         // nhãn ngắn: "Anh em ruột", "Vợ/chồng"...
  description: string;   // diễn giải đầy đủ
  ancestor?: string;     // tên tổ tiên chung
  pathA: string[];       // tên từ A lên tổ tiên chung
  pathB: string[];
}

/* ------- Dữ liệu mẫu (khớp sơ đồ storyboard: Thủy tổ → A,C → D,F → H,K,L) ------ */
export const MOCK_NODES: RelNode[] = [
  { id: '100', name: 'Nguyễn Văn Tổ', gen: 1, parentId: null, spouseId: '101' },
  { id: '101', name: 'Trần Thị Tổ', gen: 1, parentId: null, spouseId: '100' },
  { id: '1', name: 'Nguyễn Văn A', gen: 2, parentId: '100', spouseId: '2' },
  { id: '2', name: 'Lê Thị B', gen: 2, parentId: null, spouseId: '1' },
  { id: '3', name: 'Nguyễn Văn C', gen: 2, parentId: '100' },
  { id: '4', name: 'Nguyễn Văn D', gen: 3, parentId: '1', spouseId: '5' },
  { id: '5', name: 'Phạm Thị E', gen: 3, parentId: null, spouseId: '4' },
  { id: '6', name: 'Nguyễn Văn F', gen: 3, parentId: '1', spouseId: '7' },
  { id: '7', name: 'Trần Thị G', gen: 3, parentId: null, spouseId: '6' },
  { id: '8', name: 'Nguyễn Văn H', gen: 4, parentId: '4' },
  { id: '9', name: 'Nguyễn Thị K', gen: 4, parentId: '4' },
  { id: '10', name: 'Nguyễn Văn L', gen: 4, parentId: '6' },
];

const UP: Record<number, string> = { 1: 'cha/mẹ', 2: 'ông/bà', 3: 'cụ', 4: 'kỵ' };
const DOWN: Record<number, string> = { 1: 'con', 2: 'cháu', 3: 'chắt', 4: 'chút' };
const upName = (d: number) => UP[d] ?? `tổ tiên bậc ${d}`;
const downName = (d: number) => DOWN[d] ?? `hậu duệ bậc ${d}`;

/** Chuỗi tổ tiên từ 1 người lên gốc: [chínhngười, cha, ông, ...] */
function ancestryChain(id: string, map: Map<string, RelNode>): string[] {
  const chain: string[] = [];
  let cur: string | null = id;
  const guard = new Set<string>();
  while (cur && map.has(cur) && !guard.has(cur)) {
    guard.add(cur);
    chain.push(cur);
    cur = map.get(cur)!.parentId;
  }
  return chain;
}

/** Tính quan hệ giữa 2 người (thuần) */
export function computeRelation(aId: string, bId: string, nodes: RelNode[]): RelationResult {
  const map = new Map(nodes.map((n) => [n.id, n]));
  const A = map.get(aId);
  const B = map.get(bId);
  const empty: RelationResult = { found: false, label: '', description: '', pathA: [], pathB: [] };
  if (!A || !B) return { ...empty, description: 'Không tìm thấy thành viên.' };
  if (aId === bId) return { found: true, label: 'Cùng một người', description: `${A.name} và ${B.name} là cùng một người.`, pathA: [], pathB: [] };
  if (A.spouseId === bId) return { found: true, label: 'Vợ/chồng', description: `${A.name} và ${B.name} là vợ/chồng.`, pathA: [], pathB: [] };

  const chainA = ancestryChain(aId, map);
  const chainB = ancestryChain(bId, map);
  const setB = new Map(chainB.map((id, i) => [id, i]));
  let lca: string | null = null; let dA = -1; let dB = -1;
  for (let i = 0; i < chainA.length; i++) {
    if (setB.has(chainA[i])) { lca = chainA[i]; dA = i; dB = setB.get(chainA[i])!; break; }
  }
  const nameOf = (id: string) => map.get(id)?.name ?? id;
  const pathA = chainA.slice(0, dA < 0 ? chainA.length : dA + 1).map(nameOf);
  const pathB = chainB.slice(0, dB < 0 ? chainB.length : dB + 1).map(nameOf);

  if (!lca) {
    return { ...empty, pathA, pathB, description: `${A.name} và ${B.name} không có tổ tiên chung theo dòng cha (có thể khác dòng hoặc là quan hệ hôn nhân).` };
  }
  const anc = nameOf(lca);

  // A hoặc B chính là tổ tiên chung
  if (dA === 0) return { found: true, label: `${upName(dB)} – ${downName(dB)}`, ancestor: anc, pathA, pathB, description: `${A.name} là ${upName(dB)} của ${B.name} (${B.name} là ${downName(dB)}).` };
  if (dB === 0) return { found: true, label: `${upName(dA)} – ${downName(dA)}`, ancestor: anc, pathA, pathB, description: `${B.name} là ${upName(dA)} của ${A.name} (${A.name} là ${downName(dA)}).` };

  // Cùng một cha/mẹ trực tiếp -> anh chị em ruột
  if (dA === 1 && dB === 1) {
    return { found: true, label: 'Anh/chị/em ruột', ancestor: anc, pathA, pathB, description: `${A.name} và ${B.name} là anh/chị/em ruột (cùng ${anc}).` };
  }

  // Họ hàng
  if (dA === dB) {
    const doi = dA; // đời thứ mấy tính từ nhánh
    return { found: true, label: `Anh/chị/em họ (đời ${doi})`, ancestor: anc, pathA, pathB, description: `${A.name} và ${B.name} là anh/chị/em họ đời thứ ${doi}, cùng tổ tiên ${anc}.` };
  }
  // Khác đời -> vai trên/dưới (bác/chú/cô họ – cháu họ)
  const upper = dA < dB ? A : B;
  const lower = dA < dB ? B : A;
  const chenh = Math.abs(dA - dB);
  return {
    found: true,
    label: 'Họ hàng (khác đời)',
    ancestor: anc,
    pathA, pathB,
    description: `${A.name} và ${B.name} là họ hàng, cùng tổ tiên ${anc}. ${upper.name} thuộc vai trên, ${lower.name} vai dưới, chênh ${chenh} đời (bác/chú/cô họ – cháu họ).`,
  };
}

/** Danh sách người cho ô chọn (mock). Khi có DB sẽ thay bằng truy vấn thật. */
export function getRelationMembers(): { id: string; name: string; gen: number }[] {
  return MOCK_NODES.filter((n) => n.name.startsWith('Nguyễn') || n.parentId)
    .map((n) => ({ id: n.id, name: n.name, gen: n.gen }))
    .sort((a, b) => a.gen - b.gen);
}
