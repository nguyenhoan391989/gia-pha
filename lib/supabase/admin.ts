import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client với service role - CHỈ dùng phía server
 * (upload/xóa file Storage). Tuyệt đối không import vào client component.
 */
export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/** Tên bucket lưu ảnh/tài liệu gia phả */
export const MEDIA_BUCKET = 'media';
