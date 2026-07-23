import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApi, requireAuth, ApiError, auditLog } from '@/lib/api';
import { createSupabaseAdmin, MEDIA_BUCKET } from '@/lib/supabase/admin';
import { mediaToApi } from '@/lib/serialize';

/** Whitelist MIME - giữ nguyên bản Express */
const ALLOWED_MIME: Record<string, 'image' | 'video' | 'document'> = {
  'image/jpeg': 'image', 'image/png': 'image', 'image/webp': 'image', 'image/gif': 'image',
  'video/mp4': 'video', 'video/webm': 'video',
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
};

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * POST /api/media/upload - upload ảnh/video/tài liệu lên Supabase Storage
 * (thay thế lưu đĩa cục bộ của bản Express - Vercel serverless không có ổ ghi).
 * Hỗ trợ chụp trực tiếp từ camera điện thoại như cũ.
 */
export const POST = handleApi(async (req: NextRequest) => {
  const user = await requireAuth('editor');
  const form = await req.formData();

  const file = form.get('file');
  if (!(file instanceof File)) throw new ApiError(400, 'Thiếu file upload (field "file")');
  const mediaType = ALLOWED_MIME[file.type];
  if (!mediaType) throw new ApiError(400, 'Định dạng file không được hỗ trợ');
  if (file.size > MAX_SIZE) throw new ApiError(400, 'File vượt quá 50MB');

  const memberId = (form.get('member_id') as string) || null;
  const album = (form.get('album') as string) || null;

  // Tên file ngẫu nhiên chống ghi đè & path traversal
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().slice(0, 10);
  const storagePath = `${mediaType}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const supabase = createSupabaseAdmin();
  const { error: upErr } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: false,
    });
  if (upErr) {
    console.error('[storage]', upErr);
    throw new ApiError(500, 'Upload thất bại, vui lòng thử lại');
  }

  const { data: pub } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);

  const row = await prisma.media.create({
    data: {
      memberId,
      album,
      mediaType,
      fileName: file.name,
      url: pub.publicUrl,
      storagePath,
      mimeType: file.type,
      sizeBytes: BigInt(file.size),
      uploadedBy: user.id,
    },
  });
  await auditLog(user.id, 'create', 'media', row.id, { file: file.name });
  return NextResponse.json(mediaToApi(row), { status: 201 });
});
