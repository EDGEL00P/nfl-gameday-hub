import type { VercelRequest, VercelResponse } from '@vercel/node';

const BDL_BASE = 'https://api.balldontlie.io/nfl';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const apiKey = process.env.BALLDONTLIE_API_KEY?.trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'BALLDONTLIE_API_KEY not configured' });
  }

  try {
    const response = await fetch(`${BDL_BASE}/games?seasons[]=2024&per_page=50`, {
      headers: { 'Authorization': apiKey }
    });
    
    const text = await response.text();
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'BallDontLie API error', 
        status: response.status,
        message: text 
      });
    }
    
    const data = JSON.parse(text);
    res.json(data.data || []);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch games', message: err.message });
  }
}
