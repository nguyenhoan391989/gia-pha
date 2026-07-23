/**
 * Chuyển bản ghi Prisma (camelCase) -> JSON API (snake_case)
 * để giữ nguyên 100% hợp đồng API và giao diện của bản cũ.
 */
import type { Member, Relationship, FamilyRecord, Contribution, Media, Profile } from '@prisma/client';

const dateStr = (d: Date | null | undefined): string | null =>
  d ? d.toISOString().slice(0, 10) : null;

export function memberToApi(m: Member) {
  return {
    id: m.id,
    full_name: m.fullName,
    common_name: m.commonName,
    gender: m.gender,
    birth_date: dateStr(m.birthDate),
    birth_date_lunar: m.birthDateLunar,
    death_date: dateStr(m.deathDate),
    death_date_lunar: m.deathDateLunar,
    is_alive: m.isAlive,
    birth_place: m.birthPlace,
    death_place: m.deathPlace,
    burial_place: m.burialPlace,
    education: m.education,
    occupation: m.occupation,
    title: m.title,
    biography: m.biography,
    avatar_url: m.avatarUrl,
    generation: m.generation,
    branch_id: m.branchId,
    is_private: m.isPrivate,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
  };
}

export function relationshipToApi(r: Relationship) {
  return {
    id: r.id,
    member_id: r.memberId,
    related_member_id: r.relatedMemberId,
    relationship_type: r.relationshipType as
      | 'father' | 'mother' | 'spouse' | 'child' | 'sibling',
    note: r.note,
    created_at: r.createdAt,
  };
}

export function recordToApi(r: FamilyRecord) {
  return {
    id: r.id,
    record_type: r.recordType,
    title: r.title,
    content: r.content,
    attachments: r.attachments,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

export function contributionToApi(c: Contribution & { member?: { fullName: string } | null }) {
  return {
    id: c.id,
    member_id: c.memberId,
    member_name: c.member?.fullName ?? null,
    contributor_name: c.contributorName,
    amount: c.amount.toString(),
    currency: c.currency,
    purpose: c.purpose,
    note: c.note,
    contributed_at: dateStr(c.contributedAt),
    created_at: c.createdAt,
  };
}

export function mediaToApi(m: Media & { member?: { fullName: string } | null }) {
  return {
    id: m.id,
    member_id: m.memberId,
    member_name: m.member?.fullName ?? null,
    album: m.album,
    media_type: m.mediaType,
    file_name: m.fileName,
    url: m.url,
    mime_type: m.mimeType,
    size_bytes: m.sizeBytes ? Number(m.sizeBytes) : null,
    created_at: m.createdAt,
  };
}

export function profileToApi(p: Profile) {
  return {
    id: p.id,
    email: p.email,
    full_name: p.fullName,
    role: p.role,
    member_id: p.memberId,
    is_active: p.isActive,
    created_at: p.createdAt,
  };
}
