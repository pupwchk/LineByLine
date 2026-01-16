import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './storage';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const sessionId = (req.cookies?.sessionId || req.headers['x-session-id'] || 'guest') as string;

  if (req.method === 'GET') {
    try {
      const history = storage.getWaitingHistory(sessionId);
      return res.status(200).json({ history });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch history" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
