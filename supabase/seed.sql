-- ============================================================================
-- WNBA HOOPS NEWS — INITIAL SEED SQL (CATEGORIES, TEAMS, RSS SOURCES, SETTINGS)
-- ============================================================================

INSERT INTO public.categories (name, slug, description) VALUES
  ('Breaking News', 'breaking-news', 'Urgent WNBA roster moves, injury updates, and league announcements.'),
  ('Game Recaps', 'game-recaps', 'Box score breakdowns, fourth-quarter analysis, and postgame takeaways.'),
  ('Tactical Analysis', 'tactical-analysis', 'Film room breakdowns, offensive sets, and defensive schemes.'),
  ('Trade & Free Agency', 'trade-free-agency', 'Salary cap projections, front-office moves, and contract reports.'),
  ('Draft & Prospects', 'draft-prospects', 'Scouting reports and WNBA Draft coverage.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.tags (name, slug) VALUES
  ('Playoff Race', 'playoff-race'),
  ('All-WNBA', 'all-wnba'),
  ('Eastern Conference', 'eastern-conference'),
  ('Western Conference', 'western-conference'),
  ('Commissioner''s Cup', 'commissioners-cup'),
  ('CBA Negotiations', 'cba-negotiations'),
  ('Expansion', 'expansion')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.teams (name, city, abbreviation, slug, conference, arena, head_coach, primary_color, secondary_color, founded_year, active_season) VALUES
  ('New York Liberty', 'Brooklyn, NY', 'NYL', 'new-york-liberty', 'Eastern', 'Barclays Center', 'Sandy Brondello', '#6ECEB2', '#000000', 1997, 2026),
  ('Connecticut Sun', 'Uncasville, CT', 'CON', 'connecticut-sun', 'Eastern', 'Mohegan Sun Arena', 'Rachid Meziane', '#DE3A1D', '#0A2240', 1999, 2026),
  ('Indiana Fever', 'Indianapolis, IN', 'IND', 'indiana-fever', 'Eastern', 'Gainbridge Fieldhouse', 'Stephanie White', '#E03A3E', '#002D62', 2000, 2026),
  ('Atlanta Dream', 'Atlanta, GA', 'ATL', 'atlanta-dream', 'Eastern', 'Gateway Center Arena', 'Karl Smesko', '#C8102E', '#418FDE', 2008, 2026),
  ('Chicago Sky', 'Chicago, IL', 'CHI', 'chicago-sky', 'Eastern', 'Wintrust Arena', 'Tyler Marsh', '#418FDE', '#FFCD00', 2006, 2026),
  ('Washington Mystics', 'Washington, D.C.', 'WAS', 'washington-mystics', 'Eastern', 'Entertainment & Sports Arena', 'Sydney Johnson', '#C8102E', '#0C2340', 1998, 2026),
  ('Minnesota Lynx', 'Minneapolis, MN', 'MIN', 'minnesota-lynx', 'Western', 'Target Center', 'Cheryl Reeve', '#236192', '#78BE20', 1999, 2026),
  ('Las Vegas Aces', 'Las Vegas, NV', 'LVA', 'las-vegas-aces', 'Western', 'Michelob ULTRA Arena', 'Becky Hammon', '#C8102E', '#000000', 1997, 2026),
  ('Seattle Storm', 'Seattle, WA', 'SEA', 'seattle-storm', 'Western', 'Climate Pledge Arena', 'Noelle Quinn', '#2C5234', '#FBE122', 2000, 2026),
  ('Phoenix Mercury', 'Phoenix, AZ', 'PHX', 'phoenix-mercury', 'Western', 'Footprint Center', 'Nate Tibbetts', '#CB6015', '#201747', 1997, 2026),
  ('Los Angeles Sparks', 'Los Angeles, CA', 'LAS', 'los-angeles-sparks', 'Western', 'Crypto.com Arena', 'Lynne Roberts', '#702F8A', '#FFC72C', 1997, 2026),
  ('Dallas Wings', 'Arlington, TX', 'DAL', 'dallas-wings', 'Western', 'College Park Center', 'Chris Koclanes', '#0C2340', '#C4D600', 1998, 2026),
  ('Golden State Valkyries', 'San Francisco, CA', 'GSV', 'golden-state-valkyries', 'Western', 'Chase Center', 'Natalie Nakase', '#AD96DC', '#000000', 2025, 2026)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.rss_sources (name, feed_url, website_url, is_enabled, check_interval_minutes) VALUES
  ('WNBA Official League Releases', 'https://www.wnba.com/feed/', 'https://www.wnba.com', true, 60),
  ('ESPN Women''s Basketball Feed', 'https://www.espn.com/espn/rss/wnba/news', 'https://www.espn.com/wnba/', true, 120),
  ('AP Sports Women''s Pro Basketball', 'https://apnews.com/hub/wnba/rss', 'https://apnews.com/hub/wnba', true, 120)
ON CONFLICT (feed_url) DO NOTHING;

INSERT INTO public.site_settings (site_name, tagline, logo_text, default_timezone)
VALUES ('WNBA Hoops News', 'Your Daily Source for Women''s Basketball.', 'WNBA HOOPS NEWS', 'America/New_York');
