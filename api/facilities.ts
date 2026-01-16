import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './storage';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-session-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const facilities = storage.getFacilities();
      return res.status(200).json({
        facilities,
        lastUpdate: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching facilities:', error);
      return res.status(500).json({ error: "Failed to fetch facilities" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
