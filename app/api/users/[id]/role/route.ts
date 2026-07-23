import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, ApiError, auditLog } from '@/lib/api';
import { profileToApi } from '@/lib/serialize';

type Ctx = { params: Promise<{ id: string }> };

/** PUT /api/users/:id/role - phân quyền (admin) */
export const PUT = handleApi(async (req: NextRequest, { params }: Ctx) => {
  const user = await requireAuth('admin');
  const { id } = await params;
  const { role } = z.object({ role: z.enum(['admin', 'editor', 'viewer']) }).parse(await req.json());

  if (id === user.id) throw new ApiError(400, 'Không thể tự thay đổi quyền của chính mình');

  const existed = await prisma.profile.findUnique({ where: { id } });
  if (!existed) throw new ApiError(404, 'Không tìm thấy người dùng');

  const row = await prisma.profile.update({ where: { id }, data: { role } });
  await auditLog(user.id, 'update', 'profiles', id, { role });
  return NextResponse.json(profileToApi(row));
});
