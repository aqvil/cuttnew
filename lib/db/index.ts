import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Bound the pool so a traffic spike can't exhaust Postgres connections.
  max: Number(process.env.DATABASE_POOL_MAX || 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
})

// A pool-level error (e.g. the database restarting) must not take the process
// down; pg emits these on idle clients and an unhandled 'error' event is fatal.
pool.on("error", (err) => {
  console.error("[db] idle client error:", err.message)
})

export const db = drizzle(pool, { schema })

/* ------------------------------------------------------------------
   Schema bootstrap
   ------------------------------------------------------------------
   The project has no migration runner wired into deploys, so the schema is
   reconciled here. Two changes over the previous version:

   1. It runs at most once per process, lazily, behind a shared promise —
      previously it fired on every module load and raced with real queries.
   2. Every statement is idempotent (IF NOT EXISTS), so it is safe to run
      against an existing database.

   `scripts/005_platform_upgrade.sql` contains the same DDL for teams that
   prefer to apply migrations explicitly; set DB_AUTO_MIGRATE=false to skip
   the bootstrap entirely.
------------------------------------------------------------------- */

const BOOTSTRAP_SQL = `
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT,
  role TEXT DEFAULT 'member',
  invited_email TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  domain TEXT UNIQUE NOT NULL,
  tracking_headers JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  verified_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS global_tracking_headers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  name TEXT NOT NULL,
  script TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS retargeting_pixels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  pixel_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB DEFAULT '[]'::jsonb,
  max_answers INT DEFAULT 5000,
  answer_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  ip_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS action_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  custom_domain TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  views_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS action_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_page_id UUID REFERENCES action_pages(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW(),
  referrer TEXT,
  device TEXT,
  browser TEXT,
  ip_hash TEXT
);

ALTER TABLE short_links ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE short_links ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES custom_domains(id) ON DELETE SET NULL;
ALTER TABLE short_links ADD COLUMN IF NOT EXISTS expiration_url TEXT;
ALTER TABLE short_links ADD COLUMN IF NOT EXISTS max_clicks INT;
ALTER TABLE short_links ADD COLUMN IF NOT EXISTS ios_url TEXT;
ALTER TABLE short_links ADD COLUMN IF NOT EXISTS android_url TEXT;
ALTER TABLE short_links ADD COLUMN IF NOT EXISTS deep_link_scheme TEXT;
ALTER TABLE short_links ADD COLUMN IF NOT EXISTS rotation_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE short_links ADD COLUMN IF NOT EXISTS retargeting_pixel_ids TEXT[] DEFAULT '{}';
ALTER TABLE short_links ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
ALTER TABLE short_links ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Distinguish QR scans from ordinary clicks so scan counts are real.
ALTER TABLE link_analytics ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'link';
ALTER TABLE link_analytics ADD COLUMN IF NOT EXISTS os TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS product_emails BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  link_id UUID NOT NULL REFERENCES short_links(id) ON DELETE CASCADE,
  title TEXT,
  foreground_color TEXT DEFAULT '#000000',
  background_color TEXT DEFAULT '#ffffff',
  logo_url TEXT,
  error_correction TEXT DEFAULT 'M',
  archived_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  last_used_at TIMESTAMP,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes. Without these the links list and every analytics aggregate is a
-- sequential scan over the whole table.
CREATE INDEX IF NOT EXISTS short_links_user_created_idx ON short_links (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS short_links_user_clicks_idx ON short_links (user_id, click_count DESC);
CREATE INDEX IF NOT EXISTS link_analytics_link_time_idx ON link_analytics (link_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS link_analytics_time_idx ON link_analytics (clicked_at DESC);
CREATE INDEX IF NOT EXISTS qr_codes_user_created_idx ON qr_codes (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS qr_codes_link_idx ON qr_codes (link_id);
CREATE UNIQUE INDEX IF NOT EXISTS api_keys_hash_idx ON api_keys (key_hash);
CREATE INDEX IF NOT EXISTS api_keys_user_idx ON api_keys (user_id);
CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON contact_messages (created_at DESC);
`

let bootstrapPromise: Promise<void> | null = null

/**
 * Reconciles the schema exactly once per process. Callers may await it, but
 * nothing depends on it having finished — a missing optional column degrades a
 * feature rather than breaking the app.
 */
export function ensureSchema(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise

  bootstrapPromise = (async () => {
    if (!process.env.DATABASE_URL) return
    if (process.env.DB_AUTO_MIGRATE === "false") return

    const client = await pool.connect()
    try {
      await client.query(BOOTSTRAP_SQL)
    } finally {
      client.release()
    }
  })().catch((err) => {
    // Reset so a transient outage at boot doesn't permanently skip the bootstrap.
    bootstrapPromise = null
    console.error("[db] schema bootstrap skipped:", err?.message || err)
  })

  return bootstrapPromise
}

// Kick off in the background at startup without blocking module evaluation.
void ensureSchema()
