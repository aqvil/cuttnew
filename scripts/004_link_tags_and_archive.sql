-- Cuttly: add tags and archiving to short links
ALTER TABLE short_links ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE short_links ADD COLUMN IF NOT EXISTS archived_at timestamptz;
