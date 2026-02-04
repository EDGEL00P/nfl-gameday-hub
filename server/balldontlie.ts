/**
 * BallDontLie NFL API Client
 * https://api.balldontlie.io/nfl
 * Provides real NFL data including teams, games, standings, players, and more
 */

const BASE_URL = 'https://api.balldontlie.io/nfl';

interface BDLTeam {
  id: number;
  conference: string;
  division: string;
  location: string;
  name: string;
  full_name: string;
  abbreviation: string;
}

interface BDLGame {
  id: number;
  date: string;
  season: number;
  week: number;
  status: string;
  period: number;
  time: string;
  postseason: boolean;
  home_team_score: number;
  visitor_team_score: number;
  datetime: string;
  home_team: BDLTeam;
  visitor_team: BDLTeam;
  venue?: string;
}

interface BDLStanding {
  team: BDLTeam;
  conference_record: string;
  conference_rank: number;
  division_record: string;
  division_rank: number;
  wins: number;
  losses: number;
  ties?: number;
  home_record: string;
  road_record: string;
  season: number;
  points_for?: number;
  points_against?: number;
  streak?: string;
}

interface BDLPlayer {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  jersey_number?: string;
  team: BDLTeam;
  status?: string;
}

interface BDLResponse<T> {
  data: T[];
  meta?: {
    next_cursor?: number;
    per_page?: number;
  };
}

class BallDontLieClient {
  private apiKey: string;
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private cacheTTL = 60000; // 1 minute cache

  constructor() {
    const apiKey = process.env.BALLDONTLIE_API_KEY;
    if (!apiKey) {
      console.warn('[BallDontLie] No API key found. Using mock data fallback.');
    }
    this.apiKey = apiKey || '';
  }

  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
    if (!this.apiKey) {
      console.warn('[BallDontLie] API key not configured');
      return null;
    }

    const queryString = new URLSearchParams(params).toString();
    const url = `${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
    const cacheKey = url;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`[BallDontLie] API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json() as T;
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('[BallDontLie] Fetch error:', error);
      return null;
    }
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async getTeams(): Promise<BDLTeam[]> {
    const response = await this.fetch<BDLResponse<BDLTeam>>('/teams');
    return response?.data || [];
  }

  async getTeam(id: number): Promise<BDLTeam | null> {
    const response = await this.fetch<{ data: BDLTeam }>(`/teams/${id}`);
    return response?.data || null;
  }

  async getGames(params: {
    dates?: string[];
    seasons?: number[];
    team_ids?: number[];
    weeks?: number[];
    postseason?: boolean;
    cursor?: number;
    per_page?: number;
  } = {}): Promise<BDLGame[]> {
    const queryParams: Record<string, string> = {};
    
    if (params.dates?.length) queryParams['dates[]'] = params.dates.join(',');
    if (params.seasons?.length) queryParams['seasons[]'] = params.seasons.join(',');
    if (params.team_ids?.length) queryParams['team_ids[]'] = params.team_ids.join(',');
    if (params.weeks?.length) queryParams['weeks[]'] = params.weeks.join(',');
    if (params.postseason !== undefined) queryParams.postseason = String(params.postseason);
    if (params.cursor) queryParams.cursor = String(params.cursor);
    if (params.per_page) queryParams.per_page = String(params.per_page);

    const response = await this.fetch<BDLResponse<BDLGame>>('/games', queryParams);
    return response?.data || [];
  }

  async getGame(id: number): Promise<BDLGame | null> {
    const response = await this.fetch<{ data: BDLGame }>(`/games/${id}`);
    return response?.data || null;
  }

  async getStandings(season?: number): Promise<BDLStanding[]> {
    const params: Record<string, string> = {};
    if (season) params.season = String(season);
    
    const response = await this.fetch<BDLResponse<BDLStanding>>('/standings', params);
    return response?.data || [];
  }

  async getPlayers(params: {
    search?: string;
    team_ids?: number[];
    cursor?: number;
    per_page?: number;
  } = {}): Promise<BDLPlayer[]> {
    const queryParams: Record<string, string> = {};
    
    if (params.search) queryParams.search = params.search;
    if (params.team_ids?.length) queryParams['team_ids[]'] = params.team_ids.join(',');
    if (params.cursor) queryParams.cursor = String(params.cursor);
    if (params.per_page) queryParams.per_page = String(params.per_page);

    const response = await this.fetch<BDLResponse<BDLPlayer>>('/players', queryParams);
    return response?.data || [];
  }

  async getActivePlayers(params: {
    team_ids?: number[];
    cursor?: number;
    per_page?: number;
  } = {}): Promise<BDLPlayer[]> {
    const queryParams: Record<string, string> = {};
    
    if (params.team_ids?.length) queryParams['team_ids[]'] = params.team_ids.join(',');
    if (params.cursor) queryParams.cursor = String(params.cursor);
    if (params.per_page) queryParams.per_page = String(params.per_page);

    const response = await this.fetch<BDLResponse<BDLPlayer>>('/players/active', queryParams);
    return response?.data || [];
  }
}

// Singleton instance
export const bdlClient = new BallDontLieClient();

// Export types
export type { BDLTeam, BDLGame, BDLStanding, BDLPlayer, BDLResponse };
