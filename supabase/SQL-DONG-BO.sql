-- ============================================================
--  GIA PHẢ — SQL đồng bộ nhiều máy (dán vào Supabase SQL Editor rồi bấm Run)
--  Tạo bảng "family_books": mỗi dòng = MỘT SỔ GIA PHẢ của một dòng họ.
--  Truy cập bằng MÃ DÒNG HỌ + MẬT KHẨU (không cần email).
--  An toàn: chỉ server (service role) được đọc/ghi bảng này. Trình duyệt
--  KHÔNG nói trực tiếp với bảng — luôn đi qua API của app.
-- ============================================================

-- Cần cho crypt()/gen_salt() để BĂM mật khẩu (không lưu mật khẩu thô)
create extension if not exists pgcrypto;

create table if not exists public.family_books (
  id           uuid primary key default gen_random_uuid(),
  -- Mã dòng họ: người trong họ nhập mã này để vào (vd: NGUYEN-AN-HOA)
  code         text not null unique,
  name         text not null default 'Sổ gia phả',
  -- Mật khẩu đã BĂM (bcrypt). admin = trưởng tộc/quản trị (sửa được);
  -- member = cả họ (chỉ xem). Có thể để trống member_pass_hash nếu muốn ai
  -- có mã cũng xem được.
  admin_pass_hash  text not null,
  member_pass_hash text,
  -- Toàn bộ sổ gia phả (đúng cấu trúc bản sao lưu JSON của app)
  data         jsonb not null default '{}'::jsonb,
  -- Gói dịch vụ (khớp lib/subscription/plans.ts)
  plan         text not null default 'FREE'
               check (plan in ('FREE','TRIAL','MONTHLY','YEARLY','LIFETIME','GIFT_LIFETIME')),
  plan_expires timestamptz,               -- null = không hết hạn (FREE/LIFETIME)
  member_count int  not null default 0,   -- để kiểm tra giới hạn theo gói
  -- Chống ghi đè lẫn nhau: mỗi lần lưu tăng 1
  version      bigint not null default 1,
  updated_by   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists family_books_code_idx on public.family_books (code);

-- Tự cập nhật updated_at + version mỗi lần sửa dữ liệu
create or replace function public.fn_family_books_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.data is distinct from old.data then
    new.version := old.version + 1;
  end if;
  return new;
end $$;

drop trigger if exists trg_family_books_touch on public.family_books;
create trigger trg_family_books_touch
  before update on public.family_books
  for each row execute function public.fn_family_books_touch();

-- ============================================================
--  BẢO MẬT: bật RLS và KHÔNG tạo policy nào cho người dùng thường.
--  => anon/authenticated không đọc/ghi được gì. Chỉ service role
--     (dùng ở server, trong API của app) mới truy cập được.
-- ============================================================
alter table public.family_books enable row level security;
revoke all on public.family_books from anon, authenticated;

-- Hàm kiểm tra mật khẩu (băm bcrypt) — gọi từ server
create or replace function public.fn_check_book_password(p_code text, p_pass text)
returns table(id uuid, name text, role text, plan text, plan_expires timestamptz, version bigint)
language plpgsql security definer set search_path = public as $$
begin
  return query
  select b.id, b.name,
         case
           when b.admin_pass_hash = crypt(p_pass, b.admin_pass_hash) then 'admin'
           when b.member_pass_hash is not null
                and b.member_pass_hash = crypt(p_pass, b.member_pass_hash) then 'member'
           else null
         end as role,
         b.plan, b.plan_expires, b.version
  from public.family_books b
  where b.code = upper(trim(p_code));
end $$;

revoke all on function public.fn_check_book_password(text, text) from anon, authenticated;

-- Hàm tạo sổ mới (băm mật khẩu ngay trong DB, server không cần tự băm)
create or replace function public.fn_create_book(
  p_code text, p_name text, p_admin_pass text, p_member_pass text, p_data jsonb
) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  insert into public.family_books (code, name, admin_pass_hash, member_pass_hash, data, member_count)
  values (
    upper(trim(p_code)), coalesce(nullif(trim(p_name),''),'Sổ gia phả'),
    crypt(p_admin_pass, gen_salt('bf')),
    case when p_member_pass is null or trim(p_member_pass)='' then null
         else crypt(p_member_pass, gen_salt('bf')) end,
    coalesce(p_data,'{}'::jsonb),
    coalesce(jsonb_array_length(p_data->'members'),0)
  )
  returning id into v_id;
  return v_id;
end $$;

revoke all on function public.fn_create_book(text, text, text, text, jsonb) from anon, authenticated;

-- Đổi mật khẩu (dùng khi trưởng tộc muốn đổi)
create or replace function public.fn_set_book_password(
  p_id uuid, p_which text, p_new_pass text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_which = 'admin' then
    update public.family_books set admin_pass_hash = crypt(p_new_pass, gen_salt('bf')) where id = p_id;
  else
    update public.family_books
       set member_pass_hash = case when p_new_pass is null or trim(p_new_pass)='' then null
                                   else crypt(p_new_pass, gen_salt('bf')) end
     where id = p_id;
  end if;
end $$;

revoke all on function public.fn_set_book_password(uuid, text, text) from anon, authenticated;

-- Xong. Kiểm tra nhanh:
--   select code, name, plan, version, updated_at from public.family_books;
