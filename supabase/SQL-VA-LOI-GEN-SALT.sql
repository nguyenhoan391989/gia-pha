-- ============================================================
--  VÁ LỖI: function gen_salt(unknown) does not exist
--  Nguyên nhân: trên Supabase, pgcrypto nằm ở schema "extensions",
--  nhưng hàm cũ chỉ tìm trong "public" nên không thấy crypt()/gen_salt().
--  Cách sửa: khai báo search_path gồm cả "extensions".
--  => Dán toàn bộ file này vào SQL Editor và bấm Run (chạy được nhiều lần).
-- ============================================================

create extension if not exists pgcrypto with schema extensions;

create or replace function public.fn_check_book_password(p_code text, p_pass text)
returns table(id uuid, name text, role text, plan text, plan_expires timestamptz, version bigint)
language plpgsql security definer set search_path = public, extensions as $$
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

create or replace function public.fn_create_book(
  p_code text, p_name text, p_admin_pass text, p_member_pass text, p_data jsonb
) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
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

create or replace function public.fn_set_book_password(
  p_id uuid, p_which text, p_new_pass text
) returns void
language plpgsql security definer set search_path = public, extensions as $$
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

revoke all on function public.fn_check_book_password(text, text) from anon, authenticated;
revoke all on function public.fn_create_book(text, text, text, text, jsonb) from anon, authenticated;
revoke all on function public.fn_set_book_password(uuid, text, text) from anon, authenticated;

-- Kiểm tra nhanh: phải trả về một chuỗi băm bắt đầu bằng $2a$ hoặc $2b$
select extensions.crypt('test', extensions.gen_salt('bf')) as thu_bam;
