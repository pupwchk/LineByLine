import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './storage';
import { insertWaitingSchema } from '../shared/schema';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const sessionId = (req.cookies?.sessionId || req.headers['x-session-id'] || 'guest') as string;

  if (req.method === 'GET') {
    try {
      const waiting = storage.getActiveWaiting(sessionId);
      return res.status(200).json({ waiting });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch waiting status" });
    }
  }

  if (req.method === 'POST') {
    try {
      const existingWaiting = storage.getActiveWaiting(sessionId);
      if (existingWaiting) {
        return res.status(400).json({ error: "Already have an active waiting" });
      }

      const result = insertWaitingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request data", details: result.error.issues });
      }

      const facility = storage.getFacility(result.data.facilityId);
      if (!facility) {
        return res.status(404).json({ error: "Facility not found" });
      }

      const corner = facility.corners.find((c) => c.id === result.data.cornerId);
      if (!corner) {
        return res.status(404).json({ error: "Corner not found" });
      }

      if (corner.congestion >= 5) {
        return res.status(400).json({ error: "This corner is currently full" });
      }

      const waiting = storage.createWaiting(sessionId, result.data, corner);
      return res.status(201).json({ waiting });
    } catch (error) {
      return res.status(500).json({ error: "Failed to create waiting" });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const success = storage.cancelWaiting(sessionId);
      if (!success) {
        return res.status(404).json({ error: "No active waiting found" });
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to cancel waiting" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
