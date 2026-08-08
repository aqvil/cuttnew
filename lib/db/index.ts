import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Auto-initialize DB tables if missing on current PostgreSQL instance
async function initTables() {
  if (!process.env.DATABASE_URL) return;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
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
      `);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Auto DB schema init notice:", err);
  }
}

initTables().catch((err) => console.error("Init tables error:", err));

