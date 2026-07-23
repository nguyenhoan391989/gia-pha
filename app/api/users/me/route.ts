import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth } from '@/lib/api';
import { profileToApi } from '@/lib/serialize';

/** GET /api/users/me - thông tin + vai trò của bản thân */
export const GET = handleApi(async () => {
  const user = await requireAuth();
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  return NextResponse.json(profile ? profileToApi(profile) : null);
});
