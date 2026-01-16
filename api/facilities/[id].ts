import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../storage';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const facility = storage.getFacility(id as string);
      if (!facility) {
        return res.status(404).json({ error: "Facility not found" });
      }
      return res.status(200).json(facility);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch facility" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
