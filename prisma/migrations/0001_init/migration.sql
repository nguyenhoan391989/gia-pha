-- Gia Phả Dòng Họ Việt Nam - migration khởi tạo (Supabase PostgreSQL)
-- Extension cần thiết (Supabase có sẵn, chỉ cần enable)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- profiles (id = auth.users.id của Supabase Auth)
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "member_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

CREATE TABLE "branches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "generations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "number" INTEGER NOT NULL,
    "name" TEXT,
    "description" TEXT,
    CONSTRAINT "generations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "generations_number_key" ON "generations"("number");

CREATE TABLE "members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "full_name" TEXT NOT NULL,
    "common_name" TEXT,
    "gender" TEXT NOT NULL DEFAULT 'other',
    "birth_date" DATE,
    "birth_date_lunar" TEXT,
    "death_date" DATE,
    "death_date_lunar" TEXT,
    "is_alive" BOOLEAN NOT NULL DEFAULT true,
    "birth_place" TEXT,
    "death_place" TEXT,
    "burial_place" TEXT,
    "education" TEXT,
    "occupation" TEXT,
    "title" TEXT,
    "biography" TEXT,
    "avatar_url" TEXT,
    "generation" INTEGER,
    "branch_id" UUID,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "members_generation_idx" ON "members"("generation");
CREATE INDEX "members_branch_id_idx" ON "members"("branch_id");
-- Index fuzzy search tên tiếng Việt (pg_trgm) - Prisma không mô hình hóa được, thêm thủ công
CREATE INDEX "idx_members_fullname_trgm" ON "members" USING gin ("full_name" gin_trgm_ops);

CREATE TABLE "relationships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL,
    "related_member_id" UUID NOT NULL,
    "relationship_type" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "relationships_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_not_self" CHECK ("member_id" <> "related_member_id")
);
CREATE UNIQUE INDEX "uq_relationship" ON "relationships"("member_id", "related_member_id", "relationship_type");
CREATE INDEX "relationships_member_id_idx" ON "relationships"("member_id");
CREATE INDEX "relationships_related_member_id_idx" ON "relationships"("related_member_id");

CREATE TABLE "family_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "record_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "family_records_pkey" PRIMARY KEY ("id")
);
-- Index tìm kiếm toàn văn Phả ký/Ngoại phả
CREATE INDEX "idx_records_fts" ON "family_records"
  USING gin (to_tsvector('simple', coalesce("title",'') || ' ' || coalesce("content",'')));

CREATE TABLE "contributions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_id" UUID,
    "contributor_name" TEXT NOT NULL,
    "amount" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "purpose" TEXT NOT NULL,
    "note" TEXT,
    "contributed_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "media" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_id" UUID,
    "album" TEXT,
    "media_type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storage_path" TEXT,
    "mime_type" TEXT,
    "size_bytes" BIGINT,
    "uploaded_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "resource" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "uq_permission" ON "permissions"("user_id", "resource");

CREATE TABLE "edit_suggestions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" UUID,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewed_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ,
    CONSTRAINT "edit_suggestions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "changes" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- Khóa ngoại
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "members" ADD CONSTRAINT "members_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_related_member_id_fkey" FOREIGN KEY ("related_member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "media" ADD CONSTRAINT "media_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "edit_suggestions" ADD CONSTRAINT "edit_suggestions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "edit_suggestions" ADD CONSTRAINT "edit_suggestions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
