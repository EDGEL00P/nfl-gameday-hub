import type { VercelRequest, VercelResponse } from '@vercel/node';

// News endpoint - BallDontLie doesn't have news, returning placeholder
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json([]);
}
