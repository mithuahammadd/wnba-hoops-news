import { GameStatus } from '@/types/database';

export interface BoxScoreLine {
  playerId: string;
  playerName: string;
  teamAbbreviation: string;
  position: string;
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  fg: string;
  threePt: string;
  ft: string;
}

export interface NormalizedGame {
  id: string;
  season: number;
  gameDate: string; // ISO UTC timestamp
  status: GameStatus;
  statusDetail: string;
  homeTeam: {
    id: string;
    name: string;
    abbreviation: string;
    primaryColor: string;
    score: number | null;
    quarters: [number | null, number | null, number | null, number | null];
  };
  awayTeam: {
    id: string;
    name: string;
    abbreviation: string;
    primaryColor: string;
    score: number | null;
    quarters: [number | null, number | null, number | null, number | null];
  };
  venue: string;
  broadcast: string;
  boxScore: BoxScoreLine[];
}

export interface NormalizedStanding {
  teamId: string;
  teamName: string;
  abbreviation: string;
  conference: 'Eastern' | 'Western';
  wins: number;
  losses: number;
  winPercentage: number;
  gamesBehind: number;
  homeRecord: string;
  awayRecord: string;
  streak: string;
  playoffSeed: number;
}

export interface ProviderSyncMetadata {
  providerName: string;
  isLiveApiConfigured: boolean;
  isDemoMode: boolean;
  lastSyncedAt: string | null;
  statusMessage: string;
}

/**
 * SportsDataProvider Adapter Interface
 * Separates third-party WNBA API or manual database persistence from the UI.
 */
export interface SportsDataProvider {
  getMetadata(): Promise<ProviderSyncMetadata>;
  getGames(params?: { date?: string; status?: GameStatus; teamAbbr?: string }): Promise<NormalizedGame[]>;
  getStandings(season: number): Promise<{
    eastern: NormalizedStanding[];
    western: NormalizedStanding[];
    isCompleteDataset: boolean;
    dataNote?: string;
  }>;
}
