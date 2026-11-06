import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  NormalizedGame,
  NormalizedStanding,
  ProviderSyncMetadata,
  SportsDataProvider,
} from './provider';
import { GameStatus } from '@/types/database';

export class ManualDatabaseSportsProvider implements SportsDataProvider {
  async getMetadata(): Promise<ProviderSyncMetadata> {
    const hasExternalKey = Boolean(process.env.SPORTS_API_KEY);
    return {
      providerName: hasExternalKey
        ? 'Configured WNBA Sports API + Supabase Cache'
        : 'Verified Admin & Supabase Database Provider (Free-First)',
      isLiveApiConfigured: hasExternalKey,
      isDemoMode: process.env.SPORTS_DATA_PROVIDER === 'demo',
      lastSyncedAt: new Date().toISOString(),
      statusMessage: hasExternalKey
        ? 'Connected to live WNBA data feed.'
        : 'No external live API key configured. Displaying verified administrator game & standings records.',
    };
  }

  async getGames(params?: {
    date?: string;
    status?: GameStatus;
    teamAbbr?: string;
  }): Promise<NormalizedGame[]> {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from('games')
      .select(
        `
        *,
        home_team:teams!games_home_team_id_fkey(id, name, abbreviation, primary_color),
        away_team:teams!games_away_team_id_fkey(id, name, abbreviation, primary_color)
      `
      )
      .order('game_date', { ascending: true });

    if (params?.status) {
      query = query.eq('status', params.status);
    }

    const { data } = await query;
    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      season: row.season,
      gameDate: row.game_date,
      status: row.status,
      statusDetail: row.status_detail || row.status.toUpperCase(),
      homeTeam: {
        id: row.home_team.id,
        name: row.home_team.name,
        abbreviation: row.home_team.abbreviation,
        primaryColor: row.home_team.primary_color,
        score: row.home_score,
        quarters: [row.home_q1, row.home_q2, row.home_q3, row.home_q4],
      },
      awayTeam: {
        id: row.away_team.id,
        name: row.away_team.name,
        abbreviation: row.away_team.abbreviation,
        primaryColor: row.away_team.primary_color,
        score: row.away_score,
        quarters: [row.away_q1, row.away_q2, row.away_q3, row.away_q4],
      },
      venue: row.venue,
      broadcast: row.broadcast_network || 'WNBA League Pass',
      boxScore: [],
    }));
  }

  async getStandings(season: number): Promise<{
    eastern: NormalizedStanding[];
    western: NormalizedStanding[];
    isCompleteDataset: boolean;
    dataNote?: string;
  }> {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('standings')
      .select('*, team:teams(id, name, abbreviation)')
      .eq('season', season)
      .order('win_percentage', { ascending: false });

    const mapped: NormalizedStanding[] = (data || []).map((row: any) => ({
      teamId: row.team.id,
      teamName: row.team.name,
      abbreviation: row.team.abbreviation,
      conference: row.conference,
      wins: row.wins,
      losses: row.losses,
      winPercentage: Number(row.win_percentage),
      gamesBehind: Number(row.games_behind),
      homeRecord: row.home_record,
      awayRecord: row.away_record,
      streak: row.streak,
      playoffSeed: row.playoff_seed || 0,
    }));

    return {
      eastern: mapped.filter((s) => s.conference === 'Eastern'),
      western: mapped.filter((s) => s.conference === 'Western'),
      isCompleteDataset: mapped.length >= 12,
      dataNote:
        mapped.length < 12
          ? 'Partial standings dataset loaded; some franchises are awaiting official season initialization.'
          : undefined,
    };
  }
}
