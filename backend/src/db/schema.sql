-- Run this in your Supabase SQL editor

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone       TEXT,
  name        TEXT,
  city        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('Politics','Technology','Education','Crime','Environment','Sports','Business','Other')),
  location_text TEXT,
  image_url     TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','live','rejected')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast feed queries
CREATE INDEX IF NOT EXISTS idx_articles_status_created ON articles (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles (author_id);

-- Full-text search index
ALTER TABLE articles ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body,''))) STORED;
CREATE INDEX IF NOT EXISTS idx_articles_fts ON articles USING GIN(search_vector);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own profile
CREATE POLICY "users_own_profile" ON users
  FOR ALL USING (auth.uid() = id);

-- Anyone can read live articles
CREATE POLICY "public_read_live" ON articles
  FOR SELECT USING (status = 'live');

-- Authenticated users can insert articles
CREATE POLICY "auth_insert_articles" ON articles
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can read their own articles (any status)
CREATE POLICY "own_articles_read" ON articles
  FOR SELECT USING (auth.uid() = author_id);

-- Trigger: auto-create user row after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone)
  VALUES (NEW.id, NEW.phone)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
