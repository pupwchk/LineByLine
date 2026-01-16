import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../storage';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-session-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { orderId } = req.query;

  if (req.method === 'GET') {
    try {
      const order = storage.getOrder(orderId as string);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      return res.status(200).json({ order });
    } catch (error) {
      console.error('Error fetching order:', error);
      return res.status(500).json({ error: "Failed to fetch order" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
