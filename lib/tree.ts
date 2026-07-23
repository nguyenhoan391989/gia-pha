/**
 * Xây dựng cây phả hệ từ danh sách thành viên + quan hệ (adjacency list).
 * Hàm buildTree là pure function - có unit test riêng, không phụ thuộc DB.
 */

export interface MemberLite {
  id: string;
  full_name: string;
  gender: string;
  birth_date?: string | null;
  death_date?: string | null;
  is_alive?: boolean;
  avatar_url?: string | null;
  generation?: number | null;
  [key: string]: unknown;
}

export interface RelationshipLite {
  member_id: string;
  related_member_id: string;
  relationship_type: 'father' | 'mother' | 'spouse' | 'child' | 'sibling';
}

export interface TreeNode {
  member: MemberLite;
  spouses: MemberLite[];
  children: TreeNode[];
}

/**
 * Ghép cây từ quan hệ father/mother (con -> cha/mẹ) và spouse.
 * - rootId: nếu truyền vào thì chỉ dựng cây từ gốc đó; nếu không, lấy tất cả
 *   thành viên không có cha/mẹ trong dữ liệu làm gốc (thủy tổ).
 * - Con được gắn dưới CHA nếu cha có trong dữ liệu, ngược lại gắn dưới MẸ
 *   (tránh trùng lặp một người xuất hiện 2 lần).
 */
export function buildTree(
  members: MemberLite[],
  relationships: RelationshipLite[],
  rootId?: string
): TreeNode[] {
  const byId = new Map<string, MemberLite>();
  members.forEach((m) => byId.set(m.id, m));

  const parentsOf = new Map<string, { father?: string; mother?: string }>();
  const spousesOf = new Map<string, Set<string>>();

  const addSpouse = (a: string, b: string) => {
    if (!spousesOf.has(a)) spousesOf.set(a, new Set());
    spousesOf.get(a)!.add(b);
  };

  for (const r of relationships) {
    if (r.relationship_type === 'father' || r.relationship_type === 'mother') {
      const p = parentsOf.get(r.member_id) || {};
      if (r.relationship_type === 'father') p.father = r.related_member_id;
      else p.mother = r.related_member_id;
      parentsOf.set(r.member_id, p);
    } else if (r.relationship_type === 'spouse') {
      addSpouse(r.member_id, r.related_member_id);
      addSpouse(r.related_member_id, r.member_id);
    }
  }

  // childId thuộc về cha nếu cha tồn tại trong tập dữ liệu, ngược lại thuộc mẹ
  const childrenOf = new Map<string, string[]>();
  for (const [childId, p] of parentsOf) {
    if (!byId.has(childId)) continue;
    const anchor =
      p.father && byId.has(p.father) ? p.father : p.mother && byId.has(p.mother) ? p.mother : null;
    if (!anchor) continue;
    if (!childrenOf.has(anchor)) childrenOf.set(anchor, []);
    childrenOf.get(anchor)!.push(childId);
  }

  // birth_date có thể là chuỗi ISO hoặc Date object (driver pg trả về Date)
  const birthTime = (id: string): number => {
    const d = byId.get(id)?.birth_date;
    if (!d) return Number.MAX_SAFE_INTEGER;
    const t = new Date(d as string | Date as any).getTime();
    return Number.isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
  };
  const sortByBirth = (ids: string[]) => ids.sort((a, b) => birthTime(a) - birthTime(b));

  const visited = new Set<string>();

  const buildNode = (id: string): TreeNode => {
    visited.add(id);
    const member = byId.get(id)!;
    const spouseIds = Array.from(spousesOf.get(id) || []).filter((s) => byId.has(s));
    spouseIds.forEach((s) => visited.add(s));
    const childIds = sortByBirth([...(childrenOf.get(id) || [])]);
    return {
      member,
      spouses: spouseIds.map((s) => byId.get(s)!),
      children: childIds.filter((c) => !visited.has(c)).map(buildNode),
    };
  };

  if (rootId && byId.has(rootId)) {
    return [buildNode(rootId)];
  }

  // Gốc = người không có cha lẫn mẹ trong dữ liệu, và không phải là "vợ/chồng" của người khác đã có trong cây
  const roots: string[] = [];
  for (const m of members) {
    const p = parentsOf.get(m.id);
    const hasParentInData = !!(p && ((p.father && byId.has(p.father)) || (p.mother && byId.has(p.mother))));
    if (!hasParentInData) roots.push(m.id);
  }
  sortByBirth(roots);

  const result: TreeNode[] = [];
  for (const r of roots) {
    if (!visited.has(r)) result.push(buildNode(r));
  }
  return result;
}

/** Đếm tổng số node trong rừng cây (phục vụ thống kê/kiểm thử) */
export function countNodes(nodes: TreeNode[]): number {
  let n = 0;
  for (const node of nodes) {
    n += 1 + node.spouses.length + countNodes(node.children);
  }
  return n;
}
