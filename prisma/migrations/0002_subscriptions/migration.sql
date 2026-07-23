-- =====================================================================
-- 0002 SUBSCRIPTION SYSTEM (per-Project) — Supabase PostgreSQL
-- Enum gói/trạng thái, bảng projects/subscriptions/plan_limits,
-- seed giới hạn (data-driven), trigger tự tạo FREE, RLS, hàm hết hạn Trial.
-- =====================================================================

-- 1) ENUMS -----------------------------------------------------------
CREATE TYPE "subscription_plan"   AS ENUM ('FREE','TRIAL','MONTHLY','YEARLY','LIFETIME','GIFT_LIFETIME');
CREATE TYPE "subscription_status" AS ENUM ('ACTIVE','EXPIRED','CANCELLED');

-- 2) BẢNG GIỚI HẠN THEO GÓI (data-driven) ---------------------------
CREATE TABLE "plan_limits" (
  plan                "subscription_plan" PRIMARY KEY,
  max_projects        INT,
  max_members         INT,
  storage_limit_bytes BIGINT NOT NULL,
  duration_days       INT,
  features            TEXT[] NOT NULL DEFAULT '{}'
);

INSERT INTO "plan_limits" (plan, max_projects, max_members, storage_limit_bytes, duration_days, features) VALUES
  ('FREE',          1,    5,    20971520,   NULL, ARRAY['media_upload','export_pdf']),
  ('TRIAL',         NULL, NULL, 2147483648, 30,   ARRAY['ai','ocr','export_pdf','export_data','manage_fund','media_upload','multi_editor','ritual_custom','restore_photo']),
  ('MONTHLY',       NULL, NULL, 2147483648, 30,   ARRAY['ai','ocr','export_pdf','export_data','manage_fund','media_upload','multi_editor','ritual_custom','restore_photo']),
  ('YEARLY',        NULL, NULL, 5368709120, 365,  ARRAY['ai','ocr','export_pdf','export_data','manage_fund','media_upload','multi_editor','ritual_custom','restore_photo']),
  ('LIFETIME',      NULL, NULL, 2147483648, NULL, ARRAY['ai','ocr','export_pdf','export_data','manage_fund','media_upload','multi_editor','ritual_custom','restore_photo']),
  ('GIFT_LIFETIME', NULL, NULL, 2147483648, NULL, ARRAY['ai','ocr','export_pdf','export_data','manage_fund','media_upload','multi_editor','ritual_custom','restore_photo']);

-- 3) BẢNG PROJECT ---------------------------------------------------
CREATE TABLE "projects" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES "profiles"(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  subscription_id UUID UNIQUE,
  storage_used    BIGINT NOT NULL DEFAULT 0,
  storage_limit   BIGINT NOT NULL DEFAULT 20971520,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "projects_owner_id_idx" ON "projects"(owner_id);

-- 4) BẢNG SUBSCRIPTION ----------------------------------------------
CREATE TABLE "subscriptions" (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID NOT NULL REFERENCES "projects"(id) ON DELETE CASCADE,
  plan             "subscription_plan"   NOT NULL DEFAULT 'FREE',
  status           "subscription_status" NOT NULL DEFAULT 'ACTIVE',
  start_date       TIMESTAMPTZ NOT NULL DEFAULT now(),
  expire_date      TIMESTAMPTZ,
  activated_at     TIMESTAMPTZ,
  payment_source   TEXT,
  payment_provider TEXT,
  transaction_id   TEXT UNIQUE,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "subscriptions_project_id_idx" ON "subscriptions"(project_id);
CREATE INDEX "subscriptions_status_expire_idx" ON "subscriptions"(status, expire_date);

ALTER TABLE "projects"
  ADD CONSTRAINT "projects_subscription_id_fkey"
  FOREIGN KEY (subscription_id) REFERENCES "subscriptions"(id) ON DELETE SET NULL;

-- 5) TRIGGER: tạo Project => tự tạo Subscription FREE + gắn con trỏ --
CREATE OR REPLACE FUNCTION "fn_project_free_subscription"() RETURNS TRIGGER AS $$
DECLARE new_sub_id UUID;
BEGIN
  INSERT INTO "subscriptions"(project_id, plan, status, start_date, activated_at, payment_source)
  VALUES (NEW.id, 'FREE', 'ACTIVE', now(), now(), 'trial')
  RETURNING id INTO new_sub_id;

  UPDATE "projects"
     SET subscription_id = new_sub_id,
         storage_limit   = (SELECT storage_limit_bytes FROM "plan_limits" WHERE plan = 'FREE')
   WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_project_free_subscription"
  AFTER INSERT ON "projects"
  FOR EACH ROW EXECUTE FUNCTION "fn_project_free_subscription"();

-- 6) HÀM HẾT HẠN: Trial/Monthly/Yearly quá hạn => EXPIRED -----------
--    (gọi bằng Supabase Scheduled Function / pg_cron định kỳ)
CREATE OR REPLACE FUNCTION "fn_expire_overdue_subscriptions"() RETURNS INT AS $$
DECLARE n INT;
BEGIN
  UPDATE "subscriptions"
     SET status = 'EXPIRED', updated_at = now()
   WHERE status = 'ACTIVE'
     AND plan NOT IN ('FREE','LIFETIME','GIFT_LIFETIME')
     AND expire_date IS NOT NULL
     AND expire_date < now();
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$ LANGUAGE plpgsql;

-- 7) ROW LEVEL SECURITY ---------------------------------------------
ALTER TABLE "projects"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan_limits"   ENABLE ROW LEVEL SECURITY;

-- projects: chủ sở hữu toàn quyền project của mình
CREATE POLICY "projects_owner_all" ON "projects"
  FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- subscriptions: chủ project được XEM; KHÔNG được tự ghi
-- (mọi thay đổi gói đi qua service role: webhook thanh toán / admin / trigger)
CREATE POLICY "subscriptions_owner_select" ON "subscriptions"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "projects" p WHERE p.id = subscriptions.project_id AND p.owner_id = auth.uid())
  );

-- plan_limits: ai đã đăng nhập cũng đọc được bảng giá/giới hạn
CREATE POLICY "plan_limits_read" ON "plan_limits"
  FOR SELECT USING (auth.role() = 'authenticated');
