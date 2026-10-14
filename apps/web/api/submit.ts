// Vercel 함수 POST /api/submit — 검증 요청 녹화 링크 제출 (OPS6)
import { submit } from '../server/submit.ts';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const r = await submit(typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body, ip, req.headers);
  res.setHeader('Cache-Control', 'no-store');
  res.status(r.status).json(r.body);
}
