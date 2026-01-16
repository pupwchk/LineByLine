import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage, InsertWaiting } from './storage.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-session-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sessionId = (req.cookies?.sessionId || req.headers['x-session-id'] || 'guest') as string;

  if (req.method === 'GET') {
    try {
      const waiting = storage.getActiveWaiting(sessionId);
      return res.status(200).json({ waiting });
    } catch (error) {
      console.error('Error fetching waiting:', error);
      return res.status(500).json({ error: "Failed to fetch waiting status" });
    }
  }

  if (req.method === 'POST') {
    try {
      const existingWaiting = storage.getActiveWaiting(sessionId);
      if (existingWaiting) {
        return res.status(400).json({ error: "Already have an active waiting" });
      }

      const data = req.body as InsertWaiting;
      if (!data.facilityId || !data.cornerId) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const facility = storage.getFacility(data.facilityId);
      if (!facility) {
        return res.status(404).json({ error: "Facility not found" });
      }

      const corner = facility.corners.find((c) => c.id === data.cornerId);
      if (!corner) {
        return res.status(404).json({ error: "Corner not found" });
      }

      if (corner.congestion >= 5) {
        return res.status(400).json({ error: "This corner is currently full" });
      }

      const waiting = storage.createWaiting(sessionId, data, corner);
      return res.status(201).json({ waiting });
    } catch (error) {
      console.error('Error creating waiting:', error);
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
      console.error('Error cancelling waiting:', error);
      return res.status(500).json({ error: "Failed to cancel waiting" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
