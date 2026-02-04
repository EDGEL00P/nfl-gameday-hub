import type { VercelRequest, VercelResponse } from '@vercel/node';
import { NFL_TEAMS_DATA } from '../server/nfl-data';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(NFL_TEAMS_DATA);
}
