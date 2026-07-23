import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, ApiError, auditLog } from '@/lib/api';
import { createProjectWithFreeSubscription, loadPermissions } from '@/lib/subscription/service';

/** GET /api/projects — các gia phả của tôi + gói hiện hành */
export const GET = handleApi(async () => {
  const user = await requireAuth();
  const projects = await prisma.project.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { currentSubscription: true },
  });
  return NextResponse.json({
    items: projects.map((p: (typeof projects)[number]) => ({
      id: p.id, name: p.name,
      storageUsed: Number(p.storageUsed), storageLimit: Number(p.storageLimit),
      plan: p.currentSubscription?.plan ?? 'FREE',
      status: p.currentSubscription?.status ?? 'ACTIVE',
      expireDate: p.currentSubscription?.expireDate ?? null,
    })),
  });
});

/** POST /api/projects — tạo gia phả mới → tự động gói FREE (trigger DB) */
export const POST = handleApi(async (req: NextRequest) => {
  const user = await requireAuth();
  const { name } = await req.json();
  if (!name || !String(name).trim()) throw new ApiError(400, 'Thiếu tên gia phả');

  // Chặn theo giới hạn maxProjects của gói hiện có (đọc từ Permission Service, không hardcode)
  const owned = await prisma.project.count({ where: { ownerId: user.id } });
  // Người dùng mới chưa có project → dùng giới hạn FREE làm chuẩn khởi đầu
  const perm = await loadPermissions((await prisma.project.findFirst({ where: { ownerId: user.id } }))?.id ?? '');
  if (!perm.canCreateProject({ projects: owned })) {
    throw new ApiError(403, 'Đã đạt số gia phả tối đa của gói hiện tại. Nâng cấp để tạo thêm.');
  }

  const { project, subscription } = await createProjectWithFreeSubscription({ ownerId: user.id, name: String(name).trim() });
  await auditLog(user.id, 'create', 'projects', project?.id ?? null, { name });
  return NextResponse.json({ project, subscription }, { status: 201 });
});
