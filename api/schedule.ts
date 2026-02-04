import type { VercelRequest, VercelResponse } from '@vercel/node';
import { addDays, format, parseISO } from 'date-fns';

const BDL_BASE = 'https://api.balldontlie.io/nfl/v1';

// Helper to generate week dates for 2025 Season
// Week 1 starts Sept 4, 2025
const SEASON_START = '2025-09-03'; // Wednesday before kickoff

function getWeekDates(week: number) {
  const start = addDays(parseISO(SEASON_START), (week - 1) * 7);
  const end = addDays(start, 6);
  return {
    start_date: format(start, 'yyyy-MM-dd'),
    end_date: format(end, 'yyyy-MM-dd')
  };
}

const TEAM_LOGOS: Record<string, string> = {
  ARI: 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png', ATL: 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',
  BAL: 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png', BUF: 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
  CAR: 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png', CHI: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
  CIN: 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png', CLE: 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
  DAL: 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png', DEN: 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
  DET: 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png', GB: 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
  HOU: 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png', IND: 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
  JAX: 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png', KC: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
  LAC: 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png', LAR: 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
  LV: 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png', MIA: 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
  MIN: 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png', NE: 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
  NO: 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png', NYG: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
  NYJ: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png', PHI: 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
  PIT: 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png', SEA: 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
  SF: 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png', TB: 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',
  TEN: 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png', WAS: 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png',
  WSH: 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png',
};

function transformTeam(bdlTeam: any) {
  const abbr = bdlTeam.abbreviation;
  return {
    id: abbr.toLowerCase(),
    apiId: bdlTeam.id,
    name: bdlTeam.name,
    abbreviation: abbr,
    displayName: bdlTeam.full_name,
    shortDisplayName: bdlTeam.name,
    location: bdlTeam.location,
    color: '#002244',
    alternateColor: '#869397',
    logo: TEAM_LOGOS[abbr] || `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`,
    conference: bdlTeam.conference,
    division: bdlTeam.division,
    record: { wins: 0, losses: 0, ties: 0 }
  };
}

function transformGame(bdlGame: any) {
  const status = bdlGame.status?.toLowerCase().includes('final') ? 'final' 
    : bdlGame.status?.toLowerCase().includes('progress') ? 'in_progress' 
    : 'scheduled';
  
  return {
    id: String(bdlGame.id),
    date: bdlGame.date || new Date().toISOString(),
    time: bdlGame.time || 'TBD',
    status,
    homeTeam: transformTeam(bdlGame.home_team),
    awayTeam: transformTeam(bdlGame.visitor_team),
    homeScore: bdlGame.home_team_score || 0,
    awayScore: bdlGame.visitor_team_score || 0,
    quarter: bdlGame.period || 0,
    timeRemaining: bdlGame.time || '',
    possession: '',
    down: 0,
    distance: 0,
    yardLine: 0,
    redZone: false,
    venue: bdlGame.venue || 'Stadium'
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const apiKey = process.env.BALLDONTLIE_API_KEY?.trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { team_id, week } = req.query;
    
    // Default to full 2025 season
    let url = `${BDL_BASE}/games?seasons[]=2025&per_page=100`;
    
    // Add filtering
    if (team_id && team_id !== 'all') {
      url += `&team_ids[]=${team_id}`;
    }
    
    if (week) {
      const { start_date, end_date } = getWeekDates(Number(week));
      url += `&start_date=${start_date}&end_date=${end_date}`;
    }

    // Fetch multiple pages if filtering isn't specific might be needed, 
    // but with week filtering, 100 is plenty (max 16 games/week).
    // If team_id is present, 100 covers full season (17 games).
    // So 100 limit is fine.

    const response = await fetch(url, {
      headers: { 'Authorization': apiKey }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'API error' });
    }
    
    const data = await response.json();
    const games = (data.data || []).map(transformGame);
    
    res.json(games);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
