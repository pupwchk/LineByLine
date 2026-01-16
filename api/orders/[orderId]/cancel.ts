import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../storage';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { orderId } = req.query;

  if (req.method === 'POST') {
    try {
      const success = storage.cancelOrder(orderId as string);
      if (!success) {
        return res.status(400).json({ success: false, message: "주문을 취소할 수 없습니다" });
      }
      return res.status(200).json({ success: true, message: "주문이 취소되었습니다" });
    } catch (error) {
      return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
