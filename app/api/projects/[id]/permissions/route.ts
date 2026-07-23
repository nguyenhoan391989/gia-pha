import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, ApiError } from '@/lib/api';
import { loadPermissions } from '@/lib/subscription/service';

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/:id/permissions
 * Snapshot quyền của gia phả để UI dựa vào (UI KHÔNG tự đoán theo gói).
 * Kèm mức dùng hiện tại để client hiển thị "còn lại".
 */
export const GET = handleApi(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireAuth();
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new ApiError(404, 'Không tìm thấy gia phả');
  if (project.ownerId !== user.id) throw new ApiError(403, 'Không có quyền');

  const perm = await loadPermissions(id);
  const usage = {
    members: 0, // TODO khi member gắn project_id: prisma.member.count({ where: { projectId: id } })
    projects: await prisma.project.count({ where: { ownerId: user.id } }),
    storageUsedBytes: Number(project.storageUsed),
  };

  return NextResponse.json({
    ...perm.snapshot(),
    usage,
    remainingStorage: perm.remainingStorage({ storageUsedBytes: usage.storageUsedBytes }),
  });
});
