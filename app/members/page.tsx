import type { Metadata } from 'next';
import MembersClient from '@/components/members-client';
import { getMembersList, getBranches } from '@/lib/data';

export const metadata: Metadata = { title: 'Thành viên' };
export const dynamic = 'force-dynamic';

/** 04. Danh sách thành viên - server lấy dữ liệu (Prisma hoặc mock) rồi truyền cho client */
export default async function MembersPage() {
  const [{ items, source }, branches] = await Promise.all([getMembersList(), getBranches()]);
  return <MembersClient initialItems={items} branches={branches} source={source} />;
}
