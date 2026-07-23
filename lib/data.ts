/**
 * TẦNG TRUY CẬP DỮ LIỆU (chỉ chạy phía server).
 *
 * - Khi đã cấu hình DATABASE_URL: đọc trực tiếp từ Prisma/Supabase.
 * - Khi chưa cấu hình (hoặc lỗi kết nối): tự fallback về mock của Phase 1,
 *   để bản deploy vẫn hiển thị đầy đủ trước khi dựng xong cơ sở dữ liệu.
 *
 * Nhờ vậy giao diện storyboard được nối với dữ liệu thật mà không phá Phase 1.
 */

import type { Member as PMember, Relationship as PRel } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { apiMemberToUi, genderToUi, yearOf, type UiMember } from '@/lib/adapters';

/** Shape rút gọn cho các truy vấn select một phần (an toàn kiểu cả khi client suy luận yếu) */
type IdName = { id: string; name: string };
type RecentMember = { fullName: string; birthDate: Date | null };
type OtherMember = { id: string; fullName: string; birthDate: Date | null; deathDate: Date | null };
import {
  MEMBERS as MOCK_MEMBERS,
  FAMILIES as MOCK_FAMILIES,
  EVENTS as MOCK_EVENTS,
  UPCOMING_EVENTS as MOCK_UPCOMING,
  NEW_MEMBERS as MOCK_NEW_MEMBERS,
  RELATIONS as MOCK_RELATIONS,
  STATS as MOCK_STATS,
} from '@/lib/mock-data';

export const hasDatabase = (): boolean => !!process.env.DATABASE_URL;

export interface DashboardData {
  stats: { members: number; families: number; generations: number; events: number };
  newMembers: { name: string; year: number | string }[];
  upcomingEvents: { id: number | string; title: string; date: string }[];
  source: 'db' | 'mock';
}

export interface Branch {
  id: string;
  name: string;
}

export interface RelationPerson {
  name: string;
  years: string;
}
export interface MemberDetail {
  member: UiMember;
  relations: {
    parents: RelationPerson[];
    spouse: RelationPerson[];
    children: RelationPerson[];
    siblings: RelationPerson[];
  };
  source: 'db' | 'mock';
}

/* ------------------------------ Dashboard ------------------------------ */

export async function getDashboard(): Promise<DashboardData> {
  if (hasDatabase()) {
    try {
      const [members, branches, generations, events, recent] = await Promise.all([
        prisma.member.count(),
        prisma.branch.count(),
        prisma.member.findMany({
          where: { generation: { not: null } },
          distinct: ['generation'],
          select: { generation: true },
        }),
        prisma.familyRecord.count(),
        prisma.member.findMany({
          orderBy: { createdAt: 'desc' },
          take: 4,
          select: { fullName: true, birthDate: true },
        }),
      ]);
      return {
        stats: {
          members,
          families: branches,
          generations: generations.length,
          events,
        },
        newMembers: (recent as RecentMember[]).map((m) => ({
          name: m.fullName,
          year: yearOf(m.birthDate ? m.birthDate.toISOString() : null) ?? '—',
        })),
        // Sự kiện/ngày giỗ sắp tới sẽ nối ở bước sau; tạm dùng dữ liệu mẫu hiển thị
        upcomingEvents: MOCK_UPCOMING.map((e) => ({ id: e.id, title: e.title, date: e.date })),
        source: 'db',
      };
    } catch (err) {
      console.error('[data:getDashboard] fallback mock:', err);
    }
  }
  return {
    stats: {
      members: MOCK_STATS[0].value,
      families: MOCK_STATS[1].value,
      generations: MOCK_STATS[2].value,
      events: MOCK_STATS[3].value,
    },
    newMembers: MOCK_NEW_MEMBERS.map((m) => ({ name: m.name, year: m.year })),
    upcomingEvents: MOCK_UPCOMING.map((e) => ({ id: e.id, title: e.title, date: e.date })),
    source: 'mock',
  };
}

/* ------------------------------ Branches ------------------------------- */

export async function getBranches(): Promise<Branch[]> {
  if (hasDatabase()) {
    try {
      const rows = await prisma.branch.findMany({ orderBy: { name: 'asc' } });
      return (rows as IdName[]).map((b) => ({ id: b.id, name: b.name }));
    } catch (err) {
      console.error('[data:getBranches] fallback mock:', err);
    }
  }
  return MOCK_FAMILIES.map((f) => ({ id: String(f.id), name: f.name }));
}

/* ------------------------------ Members -------------------------------- */

function mockMembersAsUi(): UiMember[] {
  return MOCK_MEMBERS.map((m) => ({
    id: String(m.id),
    name: m.name,
    birthYear: m.birthYear,
    deathYear: m.deathYear ?? null,
    gender: m.gender,
    family: m.family,
    generation: m.generation,
    role: m.role,
    occupation: m.occupation,
    birthPlace: m.birthPlace,
    note: m.note,
    isAlive: m.deathYear == null,
  }));
}

export async function getMembersList(): Promise<{ items: UiMember[]; source: 'db' | 'mock' }> {
  if (hasDatabase()) {
    try {
      const [members, branches] = await Promise.all([
        prisma.member.findMany({
          orderBy: [{ generation: 'asc' }, { birthDate: 'asc' }, { fullName: 'asc' }],
        }),
        prisma.branch.findMany({ select: { id: true, name: true } }),
      ]);
      const branchName = new Map((branches as IdName[]).map((b) => [b.id, b.name]));
      const items = (members as PMember[]).map((m) =>
        apiMemberToUi(
          {
            id: m.id,
            full_name: m.fullName,
            gender: m.gender as 'male' | 'female' | 'other',
            birth_date: m.birthDate ? m.birthDate.toISOString().slice(0, 10) : null,
            death_date: m.deathDate ? m.deathDate.toISOString().slice(0, 10) : null,
            is_alive: m.isAlive,
            birth_place: m.birthPlace,
            occupation: m.occupation,
            title: m.title,
            biography: m.biography,
            avatar_url: m.avatarUrl,
            generation: m.generation,
            branch_id: m.branchId,
          },
          m.branchId ? branchName.get(m.branchId) : undefined,
        ),
      );
      return { items, source: 'db' };
    } catch (err) {
      console.error('[data:getMembersList] fallback mock:', err);
    }
  }
  return { items: mockMembersAsUi(), source: 'mock' };
}

/* --------------------------- Member detail ----------------------------- */

const yearsLabel = (birth: number | null, death: number | null): string =>
  death ? `${birth ?? '?'}-${death}` : `${birth ?? '?'}`;

export async function getMemberDetail(id: string): Promise<MemberDetail | null> {
  if (hasDatabase()) {
    try {
      const m = await prisma.member.findUnique({ where: { id } });
      if (!m) return null;
      const branch = m.branchId
        ? await prisma.branch.findUnique({ where: { id: m.branchId } })
        : null;
      const member = apiMemberToUi(
        {
          id: m.id,
          full_name: m.fullName,
          gender: m.gender as 'male' | 'female' | 'other',
          birth_date: m.birthDate ? m.birthDate.toISOString().slice(0, 10) : null,
          death_date: m.deathDate ? m.deathDate.toISOString().slice(0, 10) : null,
          is_alive: m.isAlive,
          birth_place: m.birthPlace,
          occupation: m.occupation,
          title: m.title,
          biography: m.biography,
          avatar_url: m.avatarUrl,
          generation: m.generation,
          branch_id: m.branchId,
        },
        branch?.name,
      );

      const rels = (await prisma.relationship.findMany({
        where: { OR: [{ memberId: id }, { relatedMemberId: id }] },
      })) as PRel[];
      const otherIds = new Set<string>();
      rels.forEach((r: PRel) => {
        otherIds.add(r.memberId === id ? r.relatedMemberId : r.memberId);
      });
      const others = (await prisma.member.findMany({
        where: { id: { in: [...otherIds] } },
        select: { id: true, fullName: true, birthDate: true, deathDate: true },
      })) as OtherMember[];
      const info = new Map<string, RelationPerson>(
        others.map((o: OtherMember) => [
          o.id,
          {
            name: o.fullName,
            years: yearsLabel(
              yearOf(o.birthDate ? o.birthDate.toISOString() : null),
              yearOf(o.deathDate ? o.deathDate.toISOString() : null),
            ),
          } as RelationPerson,
        ]),
      );

      const parents: RelationPerson[] = [];
      const children: RelationPerson[] = [];
      const spouse: RelationPerson[] = [];
      const siblings: RelationPerson[] = [];
      for (const r of rels) {
        const isParentLink = r.relationshipType === 'father' || r.relationshipType === 'mother';
        if (r.relationshipType === 'spouse') {
          const other = r.memberId === id ? r.relatedMemberId : r.memberId;
          const p = info.get(other);
          if (p) spouse.push(p);
        } else if (r.relationshipType === 'sibling') {
          const other = r.memberId === id ? r.relatedMemberId : r.memberId;
          const p = info.get(other);
          if (p) siblings.push(p);
        } else if (isParentLink) {
          if (r.memberId === id) {
            const p = info.get(r.relatedMemberId);
            if (p) parents.push(p);
          } else if (r.relatedMemberId === id) {
            const p = info.get(r.memberId);
            if (p) children.push(p);
          }
        }
      }
      return { member, relations: { parents, spouse, children, siblings }, source: 'db' };
    } catch (err) {
      console.error('[data:getMemberDetail] fallback mock:', err);
    }
  }

  // Fallback mock
  const mock = MOCK_MEMBERS.find((x) => String(x.id) === id) ?? MOCK_MEMBERS[0];
  const member: UiMember = {
    id: String(mock.id),
    name: mock.name,
    birthYear: mock.birthYear,
    deathYear: mock.deathYear ?? null,
    gender: mock.gender,
    family: mock.family,
    generation: mock.generation,
    role: mock.role,
    occupation: mock.occupation,
    birthPlace: mock.birthPlace,
    note: mock.note,
    isAlive: mock.deathYear == null,
  };
  return {
    member,
    relations: {
      parents: MOCK_RELATIONS.parents,
      spouse: MOCK_RELATIONS.spouse,
      children: MOCK_RELATIONS.children,
      siblings: MOCK_RELATIONS.siblings,
    },
    source: 'mock',
  };
}

/* ------------------------------- Events -------------------------------- */

export function getEvents() {
  return MOCK_EVENTS;
}

// Đảm bảo genderToUi được giữ trong bundle server (tránh cảnh báo unused khi mở rộng)
export { genderToUi };
