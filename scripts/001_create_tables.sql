-- LinkForge Database Schema
-- Run this migration to set up all required tables

-- 1. User Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bio Pages
CREATE TABLE IF NOT EXISTS bio_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  theme JSONB DEFAULT '{"background": "#ffffff", "text": "#000000", "accent": "#000000", "style": "minimal"}',
  is_published BOOLEAN DEFAULT false,
  custom_domain TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bio Blocks (for block-based editor)
CREATE TABLE IF NOT EXISTS bio_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES bio_pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('link', 'header', 'text', 'image', 'social', 'embed', 'divider', 'email-capture')),
  content JSONB NOT NULL DEFAULT '{}',
  position INTEGER NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Short Links
CREATE TABLE IF NOT EXISTS short_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  title TEXT,
  custom_slug TEXT,
  password TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Link Analytics (click events)
CREATE TABLE IF NOT EXISTS link_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES short_links(id) ON DELETE CASCADE,
  bio_block_id UUID REFERENCES bio_blocks(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  referrer TEXT,
  country TEXT,
  city TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  ip_hash TEXT
);

-- 6. Page Views (for bio pages)
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES bio_pages(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  referrer TEXT,
  country TEXT,
  city TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  ip_hash TEXT
);

-- 7. Email Subscribers (for email capture blocks)
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES bio_pages(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AI Generation History
CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bio', 'link_title', 'seo', 'content')),
  input TEXT,
  output TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE USING (auth.uid() = id);

-- Bio Pages RLS policies
CREATE POLICY "bio_pages_select_own" ON bio_pages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bio_pages_select_public" ON bio_pages FOR SELECT USING (is_published = true);
CREATE POLICY "bio_pages_insert_own" ON bio_pages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bio_pages_update_own" ON bio_pages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bio_pages_delete_own" ON bio_pages FOR DELETE USING (auth.uid() = user_id);

-- Bio Blocks RLS policies
CREATE POLICY "bio_blocks_select_own" ON bio_blocks FOR SELECT 
  USING (EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = bio_blocks.page_id AND bio_pages.user_id = auth.uid()));
CREATE POLICY "bio_blocks_select_public" ON bio_blocks FOR SELECT 
  USING (EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = bio_blocks.page_id AND bio_pages.is_published = true));
CREATE POLICY "bio_blocks_insert_own" ON bio_blocks FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = bio_blocks.page_id AND bio_pages.user_id = auth.uid()));
CREATE POLICY "bio_blocks_update_own" ON bio_blocks FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = bio_blocks.page_id AND bio_pages.user_id = auth.uid()));
CREATE POLICY "bio_blocks_delete_own" ON bio_blocks FOR DELETE 
  USING (EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = bio_blocks.page_id AND bio_pages.user_id = auth.uid()));

-- Short Links RLS policies
CREATE POLICY "short_links_select_own" ON short_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "short_links_insert_own" ON short_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "short_links_update_own" ON short_links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "short_links_delete_own" ON short_links FOR DELETE USING (auth.uid() = user_id);

-- Link Analytics RLS policies (anyone can insert for tracking, owners can read)
CREATE POLICY "link_analytics_insert_all" ON link_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "link_analytics_select_own" ON link_analytics FOR SELECT 
  USING (EXISTS (SELECT 1 FROM short_links WHERE short_links.id = link_analytics.link_id AND short_links.user_id = auth.uid()));

-- Page Views RLS policies (anyone can insert for tracking, owners can read)
CREATE POLICY "page_views_insert_all" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "page_views_select_own" ON page_views FOR SELECT 
  USING (EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = page_views.page_id AND bio_pages.user_id = auth.uid()));

-- Email Subscribers RLS policies
CREATE POLICY "email_subscribers_insert_all" ON email_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "email_subscribers_select_own" ON email_subscribers FOR SELECT 
  USING (EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = email_subscribers.page_id AND bio_pages.user_id = auth.uid()));

-- AI Generations RLS policies
CREATE POLICY "ai_generations_select_own" ON ai_generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_generations_insert_own" ON ai_generations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    LOWER(REPLACE(COALESCE(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 6)), ' ', '_'))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bio_pages_user_id ON bio_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_bio_pages_slug ON bio_pages(slug);
CREATE INDEX IF NOT EXISTS idx_bio_blocks_page_id ON bio_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_bio_blocks_position ON bio_blocks(page_id, position);
CREATE INDEX IF NOT EXISTS idx_short_links_user_id ON short_links(user_id);
CREATE INDEX IF NOT EXISTS idx_short_links_short_code ON short_links(short_code);
CREATE INDEX IF NOT EXISTS idx_link_analytics_link_id ON link_analytics(link_id);
CREATE INDEX IF NOT EXISTS idx_link_analytics_clicked_at ON link_analytics(clicked_at);
CREATE INDEX IF NOT EXISTS idx_page_views_page_id ON page_views(page_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);
