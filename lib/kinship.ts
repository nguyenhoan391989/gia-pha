/**
 * Bộ truy xuất quan hệ (Module 7 — Tìm kiếm & Truy xuất quan hệ).
 * Tính toán thuần trên cây gia phả mẫu (FAMILY_TREE) nên chạy được offline,
 * không cần DB. Về sau có thể thay bằng API đọc bảng `relationships` + LLM để
 * diễn giải xưng hô tự nhiên (chỗ cắm GPT/Claude).
 */
import { FAMILY_TREE, type TreeNode } from '@/lib/mock-data';

export interface Person { id: number; name: string; years: string }

interface Node { id: number; name: string; years: string; parent: number | null }

/** Duyệt cây -> bản đồ id => node (kèm cha) */
function flatten(): Map<number, Node> {
  const map = new Map<number, Node>();
  const walk = (n: TreeNode, parent: number | null) => {
    map.set(n.id, { id: n.id, name: n.name, years: n.years, parent });
    (n.children ?? []).forEach((c) => walk(c, n.id));
  };
  walk(FAMILY_TREE, null);
  return map;
}

const NODES = flatten();

/** Danh sách người có thể chọn (đã sắp theo đời rồi tên) */
export function listPeople(): Person[] {
  return [...NODES.values()]
    .map((n) => ({ id: n.id, name: n.name, years: n.years }))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
}

/** Đường lên tổ tiên: [x, cha, ông, ...] */
function ancestors(id: number): number[] {
  const path: number[] = [];
  let cur: number | null = id;
  while (cur != null) {
    path.push(cur);
    cur = NODES.get(cur)?.parent ?? null;
  }
  return path;
}

const ELDER = ['', 'cha/mẹ', 'ông/bà', 'cụ', 'kỵ'];
const YOUNGER = ['', 'con', 'cháu', 'chắt', 'chút'];

export interface RelationResult {
  label: string;       // nhãn ngắn gọn
  detail: string;      // diễn giải
  path: string[];      // đường phả hệ qua tổ chung
}

/** Tính quan hệ giữa hai người theo id */
export function relationship(aId: number, bId: number): RelationResult | null {
  const A = NODES.get(aId);
  const B = NODES.get(bId);
  if (!A || !B) return null;
  if (aId === bId) return { label: 'Cùng một người', detail: `${A.name} chính là người đang chọn.`, path: [A.name] };

  const ancA = ancestors(aId);
  const ancB = ancestors(bId);
  const setB = new Set(ancB);
  const commonId = ancA.find((x) => setB.has(x));
  if (commonId == null) {
    return { label: 'Không cùng huyết thống trực hệ', detail: 'Không tìm thấy tổ tiên chung trong dữ liệu hiện có.', path: [] };
  }
  const dA = ancA.indexOf(commonId); // số bậc từ A lên tổ chung
  const dB = ancB.indexOf(commonId);
  const common = NODES.get(commonId)!;

  // Đường phả hệ: A -> ... -> tổ chung -> ... -> B
  const upA = ancA.slice(0, dA + 1).map((id) => NODES.get(id)!.name);
  const downB = ancB.slice(0, dB).reverse().map((id) => NODES.get(id)!.name);
  const path = [...upA, ...downB];

  let label: string, detail: string;
  if (dA === 0) {
    label = `${A.name} là ${ELDER[dB] ?? 'bậc trên'} của ${B.name}`;
    detail = `${B.name} là ${YOUNGER[dB] ?? 'hậu duệ'} của ${A.name} (chênh ${dB} đời).`;
  } else if (dB === 0) {
    label = `${B.name} là ${ELDER[dA] ?? 'bậc trên'} của ${A.name}`;
    detail = `${A.name} là ${YOUNGER[dA] ?? 'hậu duệ'} của ${B.name} (chênh ${dA} đời).`;
  } else if (dA === dB) {
    label = dA === 1 ? 'Anh/chị em ruột' : `Anh/chị em họ (chung ${common.name})`;
    detail = dA === 1
      ? `${A.name} và ${B.name} là anh/chị em ruột.`
      : `${A.name} và ${B.name} cùng đời, là anh/chị em họ, chung tổ ${common.name}.`;
  } else {
    const gap = Math.abs(dA - dB);
    const elderName = dA < dB ? A.name : B.name;
    const youngerName = dA < dB ? B.name : A.name;
    label = `${elderName} là bậc trên ${youngerName} ${gap} đời (bác/chú/cô/cậu ↔ cháu)`;
    detail = `${youngerName} gọi ${elderName} theo vai bề trên (chênh ${gap} đời), chung tổ ${common.name}.`;
  }
  return { label, detail, path };
}
