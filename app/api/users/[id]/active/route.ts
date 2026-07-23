import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, ApiError, auditLog } from '@/lib/api';
import { profileToApi } from '@/lib/serialize';

type Ctx = { params: Promise<{ id: string }> };

/** PUT /api/users/:id/active - khóa/mở tài khoản (admin) */
export const PUT = handleApi(async (req: NextRequest, { params }: Ctx) => {
  const user = await requireAuth('admin');
  const { id } = await params;
  const { is_active } = z.object({ is_active: z.boolean() }).parse(await req.json());

  if (id === user.id) throw new ApiError(400, 'Không thể khóa tài khoản của chính mình');

  const existed = await prisma.profile.findUnique({ where: { id } });
  if (!existed) throw new ApiError(404, 'Không tìm thấy người dùng');

  const row = await prisma.profile.update({ where: { id }, data: { isActive: is_active } });
  await auditLog(user.id, 'update', 'profiles', id, { is_active });
  return NextResponse.json(profileToApi(row));
});
