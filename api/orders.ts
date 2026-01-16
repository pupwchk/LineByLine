import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage, InsertOrder } from './storage';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-session-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sessionId = (req.cookies?.sessionId || req.headers['x-session-id'] || 'guest') as string;

  if (req.method === 'GET') {
    try {
      const orders = storage.getOrders(sessionId);
      return res.status(200).json({ orders });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = req.body as InsertOrder;
      if (!data.facilityId || !data.items || !data.totalAmount) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const order = storage.createOrder(sessionId, data);
      return res.status(201).json({ success: true, order });
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({ error: "Failed to create order" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
