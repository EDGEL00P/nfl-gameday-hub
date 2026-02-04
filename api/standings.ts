import type { VercelRequest, VercelResponse } from '@vercel/node';

const BDL_BASE = 'https://api.balldontlie.io/nfl';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const apiKey = process.env.BALLDONTLIE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'BALLDONTLIE_API_KEY not configured' });
  }

  try {
    const response = await fetch(`${BDL_BASE}/standings?season=2024`, {
      headers: { 'Authorization': apiKey }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'BallDontLie API error' });
    }
    
    const data = await response.json();
    res.json(data.data || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
}
