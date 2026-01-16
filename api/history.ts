import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './storage.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-session-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sessionId = (req.cookies?.sessionId || req.headers['x-session-id'] || 'guest') as string;

  if (req.method === 'GET') {
    try {
      const history = storage.getWaitingHistory(sessionId);
      return res.status(200).json({ history });
    } catch (error) {
      console.error('Error fetching history:', error);
      return res.status(500).json({ error: "Failed to fetch history" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
