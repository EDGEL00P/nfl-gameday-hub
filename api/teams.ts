import type { VercelRequest, VercelResponse } from '@vercel/node';

const BDL_BASE = 'https://api.balldontlie.io/nfl/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const apiKey = process.env.BALLDONTLIE_API_KEY?.trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'BALLDONTLIE_API_KEY not configured' });
  }

  try {
    const response = await fetch(`${BDL_BASE}/teams`, {
      headers: { 'Authorization': apiKey }
    });
    
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: 'BallDontLie API error', message: text });
    }
    
    const data = await response.json();
    res.json(data.data || []);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch teams', message: err.message });
  }
}
