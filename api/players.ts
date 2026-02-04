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

function transformPlayer(bdlPlayer: any) {
  return {
    id: String(bdlPlayer.id),
    firstName: bdlPlayer.first_name || '',
    lastName: bdlPlayer.last_name || '',
    displayName: `${bdlPlayer.first_name || ''} ${bdlPlayer.last_name || ''}`.trim(),
    position: bdlPlayer.position || 'N/A',
    positionGroup: bdlPlayer.position || 'N/A',
    jersey: bdlPlayer.jersey_number || '0',
    team: bdlPlayer.team?.abbreviation?.toLowerCase() || '',
    teamId: String(bdlPlayer.team?.id || 0),
    height: bdlPlayer.height || "6'0\"",
    weight: bdlPlayer.weight || 200,
    age: bdlPlayer.age || 25,
    college: bdlPlayer.college || '',
    experience: bdlPlayer.experience || 1,
    status: bdlPlayer.status?.toLowerCase() || 'active',
    headshot: undefined,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const apiKey = process.env.BALLDONTLIE_API_KEY?.trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { team_id, search } = req.query;
    let url = `${BDL_BASE}/players?per_page=100`;
    
    if (team_id) {
      url += `&team_ids[]=${team_id}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(String(search))}`;
    }
    
    const response = await fetch(url, {
      headers: { 'Authorization': apiKey }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'API error' });
    }
    
    const data = await response.json();
    const players = (data.data || []).map(transformPlayer);
    res.json(players);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
