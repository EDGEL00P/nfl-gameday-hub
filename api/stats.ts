import type { VercelRequest, VercelResponse } from '@vercel/node';

const BDL_BASE = 'https://api.balldontlie.io/nfl/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const apiKey = process.env.BALLDONTLIE_API_KEY?.trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { player_id, season = '2025' } = req.query;
    
    if (!player_id) {
      return res.status(400).json({ error: 'Player ID required' });
    }

    const response = await fetch(`${BDL_BASE}/stats?season=${season}&player_ids[]=${player_id}`, {
      headers: { 'Authorization': apiKey }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'API error' });
    }
    
    const data = await response.json();
    res.json(data.data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
