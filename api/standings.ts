import type { VercelRequest, VercelResponse } from '@vercel/node';

const BDL_BASE = 'https://api.balldontlie.io/nfl/v1';

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
};

function transformTeam(bdlTeam: any) {
  const abbr = bdlTeam.abbreviation;
  const conf = bdlTeam.conference === 'AFC' || bdlTeam.conference === 'NFC' ? bdlTeam.conference : 'AFC';
  const div = bdlTeam.division?.replace('NORTH', 'North').replace('SOUTH', 'South').replace('EAST', 'East').replace('WEST', 'West') || 'East';
  return {
    id: abbr.toLowerCase(),
    name: bdlTeam.name,
    abbreviation: abbr,
    displayName: bdlTeam.full_name,
    shortDisplayName: bdlTeam.name,
    location: bdlTeam.location,
    color: '#002244',
    alternateColor: '#869397',
    logo: TEAM_LOGOS[abbr] || `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`,
    conference: conf,
    division: div,
    stadium: { id: 'stadium', name: 'Stadium', city: bdlTeam.location, state: '', country: 'USA', capacity: 70000, surface: 'Grass', roofType: 'Open', latitude: 0, longitude: 0, timezone: 'America/New_York', sections: [], amenities: [] },
  };
}

function transformStanding(bdlStanding: any) {
  const team = transformTeam(bdlStanding.team);
  const wins = bdlStanding.wins || 0;
  const losses = bdlStanding.losses || 0;
  const ties = bdlStanding.ties || 0;
  const total = wins + losses + ties || 1;
  
  return {
    team: { ...team, record: { wins, losses, ties, winPercentage: wins/total, conferenceRecord: bdlStanding.conference_record || '0-0', divisionRecord: bdlStanding.division_record || '0-0', homeRecord: bdlStanding.home_record || '0-0', awayRecord: bdlStanding.road_record || '0-0', streak: '-', pointsFor: bdlStanding.points_for || 0, pointsAgainst: bdlStanding.points_against || 0 } },
    rank: bdlStanding.division_rank || 1,
    wins, losses, ties,
    winPercentage: wins/total,
    conferenceWins: parseInt((bdlStanding.conference_record || '0-0').split('-')[0]) || 0,
    conferenceLosses: parseInt((bdlStanding.conference_record || '0-0').split('-')[1]) || 0,
    divisionWins: parseInt((bdlStanding.division_record || '0-0').split('-')[0]) || 0,
    divisionLosses: parseInt((bdlStanding.division_record || '0-0').split('-')[1]) || 0,
    homeWins: parseInt((bdlStanding.home_record || '0-0').split('-')[0]) || 0,
    homeLosses: parseInt((bdlStanding.home_record || '0-0').split('-')[1]) || 0,
    awayWins: parseInt((bdlStanding.road_record || '0-0').split('-')[0]) || 0,
    awayLosses: parseInt((bdlStanding.road_record || '0-0').split('-')[1]) || 0,
    pointsFor: bdlStanding.points_for || 0,
    pointsAgainst: bdlStanding.points_against || 0,
    pointDifferential: (bdlStanding.points_for || 0) - (bdlStanding.points_against || 0),
    streak: '-',
    last5: '-',
    playoffSeed: bdlStanding.conference_rank || 0,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const apiKey = process.env.BALLDONTLIE_API_KEY?.trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch(`${BDL_BASE}/standings?season=2024`, {
      headers: { 'Authorization': apiKey }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'API error' });
    }
    
    const data = await response.json();
    const standings: Record<string, any[]> = {};
    
    (data.data || []).forEach((s: any) => {
      const entry = transformStanding(s);
      const key = `${entry.team.conference} ${entry.team.division}`;
      if (!standings[key]) standings[key] = [];
      standings[key].push(entry);
    });
    
    // Sort each division by wins
    Object.keys(standings).forEach(k => {
      standings[k].sort((a, b) => b.winPercentage - a.winPercentage);
    });
    
    res.json(standings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
