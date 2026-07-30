-- ============================================================
--  CẤU HÌNH TỪ XA + CHỐNG QUÁ TẢI
--  Dán vào Supabase SQL Editor rồi bấm Run. Chạy được nhiều lần.
--  Sau khi chạy, bạn đổi giá / thông báo / bật tắt tính năng ngay trong bảng này,
--  app tự cập nhật trong vòng 1 giờ mà KHÔNG cần phát hành bản mới lên CH Play.
-- ============================================================

create table if not exists public.app_config (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.app_config enable row level security;
revoke all on public.app_config from anon, authenticated;

-- Cấu hình mặc định (sửa trực tiếp ở đây khi cần)
insert into public.app_config (key, value) values ('global', jsonb_build_object(
  'features', jsonb_build_object('sync', true, 'payment', false, 'ai', true, 'photoStudio', true, 'fortune', true),
  'pricing', jsonb_build_array(
     jsonb_build_object('plan','TRIAL',   'name','Dùng thử', 'price',0,      'unit','30 ngày','note','Đầy đủ tính năng'),
     jsonb_build_object('plan','YEARLY',  'name','Gói năm',  'price',299000, 'unit','năm',    'note','Tiết kiệm nhất'),
     jsonb_build_object('plan','LIFETIME','name','Trọn đời', 'price',1990000,'unit','một lần','note','Dùng mãi mãi')),
  'notice',   jsonb_build_object('text','', 'level','info', 'until',''),
  'capacity', jsonb_build_object('maxBooks', 5000, 'warnAt', 0.85)
))
on conflict (key) do nothing;

-- ============================================================
--  CHỐNG QUÁ TẢI: giới hạn số sổ tạo mới trong 1 giờ từ cùng một nguồn
-- ============================================================
create table if not exists public.rate_log (
  id      bigserial primary key,
  bucket  text not null,          -- khóa nhóm (vd: 'create', 'login:<mã>')
  at      timestamptz not null default now()
);
create index if not exists rate_log_bucket_at_idx on public.rate_log (bucket, at desc);
alter table public.rate_log enable row level security;
revoke all on public.rate_log from anon, authenticated;

-- Trả về true nếu CÒN lượt, false nếu đã vượt ngưỡng
create or replace function public.fn_rate_ok(p_bucket text, p_limit int, p_minutes int)
returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  delete from public.rate_log where at < now() - interval '1 day';   -- dọn log cũ
  select count(*) into n from public.rate_log
   where bucket = p_bucket and at > now() - (p_minutes || ' minutes')::interval;
  if n >= p_limit then return false; end if;
  insert into public.rate_log (bucket) values (p_bucket);
  return true;
end $$;
revoke all on function public.fn_rate_ok(text, int, int) from anon, authenticated;

-- Chặn tạo quá nhiều sổ khi hệ thống đã đầy
create or replace function public.fn_capacity_ok()
returns boolean
language plpgsql security definer set search_path = public as $$
declare cap int; cur int;
begin
  select coalesce((value->'capacity'->>'maxBooks')::int, 5000) into cap
    from public.app_config where key='global';
  select count(*) into cur from public.family_books;
  return cur < coalesce(cap, 5000);
end $$;
revoke all on function public.fn_capacity_ok() from anon, authenticated;

-- Xong. Kiểm tra:
--   select * from public.app_config;
--   select count(*) as so_so from public.family_books;
