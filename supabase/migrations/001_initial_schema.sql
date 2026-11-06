-- ============================================================================
-- WNBA HOOPS NEWS — COMPLETE SUPABASE POSTGRESQL SCHEMA & RLS MIGRATION
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Article & Draft Status Enum
DO $$ BEGIN
  CREATE TYPE article_status AS ENUM (
    'draft',
    'pending_review',
    'approved',
    'scheduled',
    'published',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Game Status Enum
DO $$ BEGIN
  CREATE TYPE game_status AS ENUM (
    'scheduled',
    'live',
    'final',
    'postponed',
    'canceled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. PROFILES (Role-based access control linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('reader', 'editor', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TAGS
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. MEDIA LIBRARY
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  caption TEXT,
  mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
  size_bytes INTEGER,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ARTICLES
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'WNBA Hoops News Editorial Desk',
  featured_image_url TEXT,
  featured_image_alt TEXT,
  status article_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_breaking BOOLEAN NOT NULL DEFAULT FALSE,
  is_trending BOOLEAN NOT NULL DEFAULT FALSE,
  seo_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  og_image_url TEXT,
  source_attribution TEXT,
  original_source_url TEXT,
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ARTICLE_TAGS (Many-to-Many Junction)
CREATE TABLE IF NOT EXISTS public.article_tags (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- 7. TEAMS (Dynamic by Season — no hardcoded team limit)
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  abbreviation TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  conference TEXT NOT NULL CHECK (conference IN ('Eastern', 'Western')),
  arena TEXT NOT NULL,
  head_coach TEXT,
  primary_color TEXT NOT NULL DEFAULT '#FF5500',
  secondary_color TEXT NOT NULL DEFAULT '#0A0F1D',
  logo_url TEXT,
  founded_year INTEGER,
  active_season INTEGER NOT NULL DEFAULT 2026,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PLAYERS
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  position TEXT NOT NULL CHECK (position IN ('G', 'F', 'C', 'G-F', 'F-C')),
  jersey_number TEXT NOT NULL,
  height TEXT NOT NULL,
  college_or_country TEXT,
  experience_years INTEGER NOT NULL DEFAULT 1,
  photo_url TEXT,
  biography TEXT,
  career_highlights TEXT,
  is_trending BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. GAMES
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_game_id TEXT UNIQUE,
  season INTEGER NOT NULL DEFAULT 2026,
  game_date TIMESTAMPTZ NOT NULL,
  status game_status NOT NULL DEFAULT 'scheduled',
  status_detail TEXT DEFAULT 'Scheduled',
  home_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  away_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  home_score INTEGER,
  away_score INTEGER,
  home_q1 INTEGER,
  home_q2 INTEGER,
  home_q3 INTEGER,
  home_q4 INTEGER,
  home_ot INTEGER,
  away_q1 INTEGER,
  away_q2 INTEGER,
  away_q3 INTEGER,
  away_q4 INTEGER,
  away_ot INTEGER,
  venue TEXT NOT NULL,
  broadcast_network TEXT,
  attendance INTEGER,
  data_source TEXT NOT NULL DEFAULT 'manual_verified',
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. GAME_STATISTICS (Box Score per Player per Game)
CREATE TABLE IF NOT EXISTS public.game_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  minutes INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  rebounds INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  steals INTEGER NOT NULL DEFAULT 0,
  blocks INTEGER NOT NULL DEFAULT 0,
  fg_made INTEGER NOT NULL DEFAULT 0,
  fg_attempted INTEGER NOT NULL DEFAULT 0,
  three_made INTEGER NOT NULL DEFAULT 0,
  three_attempted INTEGER NOT NULL DEFAULT 0,
  ft_made INTEGER NOT NULL DEFAULT 0,
  ft_attempted INTEGER NOT NULL DEFAULT 0,
  turnovers INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (game_id, player_id)
);

-- 11. PLAYER_STATISTICS (Season Averages)
CREATE TABLE IF NOT EXISTS public.player_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  season INTEGER NOT NULL DEFAULT 2026,
  games_played INTEGER NOT NULL DEFAULT 0,
  minutes_per_game NUMERIC(4,1) NOT NULL DEFAULT 0.0,
  points_per_game NUMERIC(4,1) NOT NULL DEFAULT 0.0,
  rebounds_per_game NUMERIC(4,1) NOT NULL DEFAULT 0.0,
  assists_per_game NUMERIC(4,1) NOT NULL DEFAULT 0.0,
  steals_per_game NUMERIC(4,1) NOT NULL DEFAULT 0.0,
  blocks_per_game NUMERIC(4,1) NOT NULL DEFAULT 0.0,
  fg_percentage NUMERIC(4,1) NOT NULL DEFAULT 0.0,
  three_point_percentage NUMERIC(4,1) NOT NULL DEFAULT 0.0,
  ft_percentage NUMERIC(4,1) NOT NULL DEFAULT 0.0,
  data_source TEXT NOT NULL DEFAULT 'manual_verified',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (player_id, season)
);

-- 12. STANDINGS
CREATE TABLE IF NOT EXISTS public.standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  season INTEGER NOT NULL DEFAULT 2026,
  conference TEXT NOT NULL CHECK (conference IN ('Eastern', 'Western')),
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  win_percentage NUMERIC(4,3) NOT NULL DEFAULT 0.000,
  games_behind NUMERIC(4,1) NOT NULL DEFAULT 0.0,
  home_record TEXT NOT NULL DEFAULT '0-0',
  away_record TEXT NOT NULL DEFAULT '0-0',
  streak TEXT NOT NULL DEFAULT '-',
  playoff_seed INTEGER,
  is_complete_dataset BOOLEAN NOT NULL DEFAULT TRUE,
  data_note TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (team_id, season)
);

-- 13. RSS_SOURCES
CREATE TABLE IF NOT EXISTS public.rss_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  feed_url TEXT NOT NULL UNIQUE,
  website_url TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  check_interval_minutes INTEGER NOT NULL DEFAULT 120,
  last_synced_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. NEWS_SOURCES (Discovered Raw Feed Items with Deduplication)
CREATE TABLE IF NOT EXISTS public.news_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rss_source_id UUID REFERENCES public.rss_sources(id) ON DELETE SET NULL,
  source_name TEXT NOT NULL,
  original_title TEXT NOT NULL,
  normalized_title TEXT NOT NULL,
  canonical_url TEXT NOT NULL UNIQUE,
  published_at TIMESTAMPTZ,
  factual_summary TEXT,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. NEWS_DRAFTS (AI-Assisted Pending Drafts — Never Auto-Published)
CREATE TABLE IF NOT EXISTS public.news_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_source_id UUID REFERENCES public.news_sources(id) ON DELETE SET NULL,
  proposed_title TEXT NOT NULL,
  proposed_slug TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  draft_content TEXT NOT NULL,
  seo_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  suggested_category TEXT NOT NULL DEFAULT 'League News',
  suggested_tags TEXT[] NOT NULL DEFAULT '{}',
  source_urls TEXT[] NOT NULL DEFAULT '{}',
  source_attribution TEXT NOT NULL,
  needs_manual_research BOOLEAN NOT NULL DEFAULT FALSE,
  research_flag_reason TEXT,
  status article_status NOT NULL DEFAULT 'pending_review',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
  ai_model_used TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. NEWSLETTER_SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  consent_granted BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. SITE_SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT NOT NULL DEFAULT 'WNBA Hoops News',
  tagline TEXT NOT NULL DEFAULT 'Your Daily Source for Women''s Basketball.',
  logo_text TEXT NOT NULL DEFAULT 'WNBA HOOPS NEWS',
  default_timezone TEXT NOT NULL DEFAULT 'America/New_York',
  social_links JSONB NOT NULL DEFAULT '{"x": "https://x.com/wnbahoopsnews", "instagram": "https://instagram.com/wnbahoopsnews", "youtube": "https://youtube.com/@wnbahoopsnews"}',
  homepage_config JSONB NOT NULL DEFAULT '{"showTicker": true, "showGameCenter": true, "showStandingsPreview": true, "showTrendingPlayers": true}',
  newsletter_heading TEXT NOT NULL DEFAULT 'Get the Daily WNBA Shootaround Briefing',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. AUTOMATION_LOGS
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_type TEXT NOT NULL CHECK (job_type IN ('rss_sync', 'ai_draft', 'sports_sync')),
  status TEXT NOT NULL CHECK (status IN ('success', 'warning', 'error')),
  items_processed INTEGER NOT NULL DEFAULT 0,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_articles_status_published_at ON public.articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_games_date_status ON public.games(game_date, status);
CREATE INDEX IF NOT EXISTS idx_players_team ON public.players(team_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_season_ppg ON public.player_statistics(season, points_per_game DESC);
CREATE INDEX IF NOT EXISTS idx_standings_season_conf ON public.standings(season, conference, win_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_news_sources_norm_title ON public.news_sources(normalized_title);
CREATE INDEX IF NOT EXISTS idx_news_drafts_status ON public.news_drafts(status, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to verify if current user is an authorized admin or editor
CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Public Read Policies (Visitors can read published articles and public sports data)
CREATE POLICY "Public can read published articles" ON public.articles
  FOR SELECT USING (status = 'published' OR public.is_admin_or_editor());

CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can read tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public can read article_tags" ON public.article_tags FOR SELECT USING (true);
CREATE POLICY "Public can read media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Public can read teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Public can read players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Public can read games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Public can read game_statistics" ON public.game_statistics FOR SELECT USING (true);
CREATE POLICY "Public can read player_statistics" ON public.player_statistics FOR SELECT USING (true);
CREATE POLICY "Public can read standings" ON public.standings FOR SELECT USING (true);
CREATE POLICY "Public can read site_settings" ON public.site_settings FOR SELECT USING (true);

-- Public Newsletter Subscription Policy (Insert only with consent)
CREATE POLICY "Public can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (consent_granted = true);

-- Admin Write/Manage Policies Across All Tables
CREATE POLICY "Admins manage articles" ON public.articles FOR ALL USING (public.is_admin_or_editor());
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.is_admin_or_editor());
CREATE POLICY "Admins manage tags" ON public.tags FOR ALL USING (public.is_admin_or_editor());
CREATE POLICY "Admins manage article_tags" ON public.article_tags FOR ALL USING (public.is_admin_or_editor());
CREATE POLICY "Admins manage media" ON public.media FOR ALL USING (public.is_admin_or_editor());
CREATE POLICY "Admins manage teams" ON public.teams FOR ALL USING (public.is_admin_or_editor());
CREATE POLICY "Admins manage players" ON public.players FOR ALL USING (public.is_admin_or_editor());
CREATE POLICY "Admins manage games" ON public.games FOR ALL USING (public.is_admin_or_editor());
CREATE POLICY "Admins manage game_statistics" ON public.game_statistics FOR ALL USING (public.is_admin_or_editor());
CREATE POLICY "Admins manage player_statistics" ON public.player_statistics FOR ALL USING (public.is_admin_or_editor());
CREATE POLICY "Admins manage standings" ON public.standings FOR ALL USING (public.is_admin_or_editor());
CREATE POLICY "Admins manage rss_sources" ON public.rss_sources FOR ALL USING (public.is_admin_or_editor());
CREATE POLICY "Admins manage news_sources" ON public.news_sources FOR ALL USING (public.is_admin_or_editor());
CREATE POLICY "Admins manage news_drafts" ON public.news_drafts FOR ALL USING (public.is_admin_or_editor());
CREATE POLICY "Admins manage subscribers" ON public.newsletter_subscribers FOR ALL USING (public.is_admin_or_editor());
CREATE POLICY "Admins manage site_settings" ON public.site_settings FOR ALL USING (public.is_admin_or_editor());
CREATE POLICY "Admins manage automation_logs" ON public.automation_logs FOR ALL USING (public.is_admin_or_editor());
CREATE POLICY "Users read own profile or admin reads all" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin_or_editor());
