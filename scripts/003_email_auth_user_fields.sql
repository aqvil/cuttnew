-- Email/password auth fields for the standard PostgreSQL Auth.js schema.
-- These columns mirror the important fields from the attached MySQL `users` table
-- while preserving the Auth.js-compatible "user" table name.

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "username" TEXT UNIQUE;
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

CREATE INDEX IF NOT EXISTS "user_username_idx" ON "user"("username");
CREATE INDEX IF NOT EXISTS "user_created_at_idx" ON "user"("created_at");
CREATE INDEX IF NOT EXISTS "user_updated_at_idx" ON "user"("updated_at");
