import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, ApiError, auditLog } from '@/lib/api';
import { createSupabaseAdmin, MEDIA_BUCKET } from '@/lib/supabase/admin';

type Ctx = { params: Promise<{ id: string }> };

/** DELETE /api/media/:id - xóa bản ghi + file trên Supabase Storage */
export const DELETE = handleApi(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireAuth('editor');
  const { id } = await params;

  const existed = await prisma.media.findUnique({ where: { id } });
  if (!existed) throw new ApiError(404, 'Không tìm thấy file');

  await prisma.media.delete({ where: { id } });

  if (existed.storagePath) {
    const supabase = createSupabaseAdmin();
    // Xóa file vật lý; lỗi storage không làm hỏng request (bản ghi đã xóa)
    const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([existed.storagePath]);
    if (error) console.error('[storage:remove]', error);
  }

  await auditLog(user.id, 'delete', 'media', id, { file: existed.fileName });
  return NextResponse.json({ message: 'Đã xóa file' });
});
