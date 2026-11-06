export type ArticleStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'rejected';

export type GameStatus = 'scheduled' | 'live' | 'final' | 'postponed' | 'canceled';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id: string | null;
  category_name?: string;
  author_name: string;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  status: ArticleStatus;
  is_featured: boolean;
  is_breaking: boolean;
  is_trending: boolean;
  seo_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  source_attribution: string | null;
  original_source_url: string | null;
  published_at: string | null;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  slug: string;
  conference: 'Eastern' | 'Western';
  arena: string;
  head_coach: string | null;
  primary_color: string;
  secondary_color: string;
  active_season: number;
}

export interface PlayerWithStats {
  id: string;
  team_id: string;
  team_abbreviation: string;
  team_name: string;
  full_name: string;
  slug: string;
  position: 'G' | 'F' | 'C' | 'G-F' | 'F-C';
  jersey_number: string;
  height: string;
  college_or_country: string;
  biography: string;
  career_highlights: string;
  season: number;
  games_played: number;
  minutes_per_game: number;
  points_per_game: number;
  rebounds_per_game: number;
  assists_per_game: number;
  steals_per_game: number;
  blocks_per_game: number;
  fg_percentage: number;
  three_point_percentage: number;
  ft_percentage: number;
}
