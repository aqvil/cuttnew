-- Complete PostgreSQL schema for the Cuttly app.
-- Import this into the `cutt` database.
--
-- Example:
-- psql "postgresql://bob:YOUR_PASSWORD@YOUR_HOST:5432/cutt" -f scripts/cutt_postgres_schema.sql
--
-- This file is idempotent: it can repair an existing partially-created schema
-- by adding missing columns such as "user"."username".

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "email" TEXT UNIQUE,
  "emailVerified" TIMESTAMP,
  "image" TEXT
);

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "first_name" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "last_name" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "legacy_permissions" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "two_factor_secret" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "two_factor_recovery_codes" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "two_factor_confirmed_at" TIMESTAMP;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "card_brand" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "card_last_four" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "remember_token" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "language" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "timezone" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "avatar" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "stripe_id" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "available_space" BIGINT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "card_expires" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banned_at" TIMESTAMP;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS "user_username_unique" ON "user"("username") WHERE "username" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "user_created_at_idx" ON "user"("created_at");
CREATE INDEX IF NOT EXISTS "user_updated_at_idx" ON "user"("updated_at");

CREATE TABLE IF NOT EXISTS "account" (
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  PRIMARY KEY ("provider", "providerAccountId")
);

CREATE TABLE IF NOT EXISTS "session" (
  "sessionToken" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "expires" TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "verificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP NOT NULL,
  PRIMARY KEY ("identifier", "token")
);

CREATE TABLE IF NOT EXISTS "profiles" (
  "id" TEXT PRIMARY KEY REFERENCES "user"("id") ON DELETE CASCADE,
  "username" TEXT UNIQUE,
  "display_name" TEXT,
  "avatar_url" TEXT,
  "bio" TEXT,
  "plan" TEXT DEFAULT 'free',
  "stripe_customer_id" TEXT,
  "stripe_subscription_id" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "bio_pages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT REFERENCES "profiles"("id") ON DELETE CASCADE,
  "slug" TEXT UNIQUE NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "theme" JSONB DEFAULT '{"background": "#ffffff", "text": "#000000", "accent": "#000000", "style": "minimal"}',
  "is_published" BOOLEAN DEFAULT false,
  "custom_domain" TEXT,
  "seo_title" TEXT,
  "seo_description" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "bio_blocks" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "page_id" UUID REFERENCES "bio_pages"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "content" JSONB NOT NULL DEFAULT '{}',
  "position" INTEGER NOT NULL,
  "is_visible" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "short_links" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT REFERENCES "profiles"("id") ON DELETE CASCADE,
  "original_url" TEXT NOT NULL,
  "short_code" TEXT UNIQUE NOT NULL,
  "title" TEXT,
  "custom_slug" TEXT,
  "password" TEXT,
  "expires_at" TIMESTAMPTZ,
  "is_active" BOOLEAN DEFAULT true,
  "click_count" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "link_analytics" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "link_id" UUID REFERENCES "short_links"("id") ON DELETE CASCADE,
  "bio_block_id" UUID REFERENCES "bio_blocks"("id") ON DELETE CASCADE,
  "clicked_at" TIMESTAMPTZ DEFAULT NOW(),
  "referrer" TEXT,
  "country" TEXT,
  "city" TEXT,
  "device" TEXT,
  "browser" TEXT,
  "os" TEXT,
  "ip_hash" TEXT
);

CREATE TABLE IF NOT EXISTS "page_views" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "page_id" UUID REFERENCES "bio_pages"("id") ON DELETE CASCADE,
  "viewed_at" TIMESTAMPTZ DEFAULT NOW(),
  "referrer" TEXT,
  "country" TEXT,
  "city" TEXT,
  "device" TEXT,
  "browser" TEXT,
  "os" TEXT,
  "ip_hash" TEXT
);

CREATE TABLE IF NOT EXISTS "email_subscribers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "page_id" UUID REFERENCES "bio_pages"("id") ON DELETE CASCADE,
  "email" TEXT NOT NULL,
  "subscribed_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ai_generations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT REFERENCES "profiles"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "input" TEXT,
  "output" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_bio_pages_user_id" ON "bio_pages"("user_id");
CREATE INDEX IF NOT EXISTS "idx_bio_pages_slug" ON "bio_pages"("slug");
CREATE INDEX IF NOT EXISTS "idx_bio_blocks_page_id" ON "bio_blocks"("page_id");
CREATE INDEX IF NOT EXISTS "idx_bio_blocks_position" ON "bio_blocks"("page_id", "position");
CREATE INDEX IF NOT EXISTS "idx_short_links_user_id" ON "short_links"("user_id");
CREATE INDEX IF NOT EXISTS "idx_short_links_short_code" ON "short_links"("short_code");
CREATE INDEX IF NOT EXISTS "idx_link_analytics_link_id" ON "link_analytics"("link_id");
CREATE INDEX IF NOT EXISTS "idx_link_analytics_clicked_at" ON "link_analytics"("clicked_at");
CREATE INDEX IF NOT EXISTS "idx_page_views_page_id" ON "page_views"("page_id");
CREATE INDEX IF NOT EXISTS "idx_page_views_viewed_at" ON "page_views"("viewed_at");
