import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './storage';
import { insertOrderSchema } from '../shared/schema';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const sessionId = (req.cookies?.sessionId || req.headers['x-session-id'] || 'guest') as string;

  if (req.method === 'GET') {
    try {
      const orders = storage.getOrders(sessionId);
      return res.status(200).json({ orders });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch orders" });
    }
  }

  if (req.method === 'POST') {
    try {
      const result = insertOrderSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request data", details: result.error.issues });
      }

      const order = storage.createOrder(sessionId, result.data);
      return res.status(201).json({ success: true, order });
    } catch (error) {
      return res.status(500).json({ error: "Failed to create order" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
