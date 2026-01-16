import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../storage';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-session-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { orderId } = req.query;

  if (req.method === 'POST') {
    try {
      const { userLocation } = req.body;
      
      if (!userLocation || typeof userLocation.lat !== "number" || typeof userLocation.lng !== "number") {
        return res.status(400).json({ success: false, message: "위치 정보가 필요합니다" });
      }

      const result = storage.activateQR(orderId as string, userLocation);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error activating QR:', error);
      return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
