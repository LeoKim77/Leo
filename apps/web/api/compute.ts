// Vercel 함수 POST /api/compute — 엔진은 서버에서만 돈다 (OPS15)
import { compute } from '../server/core.ts';

export const config = { maxDuration: 60 };

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  const len = Number(req.headers['content-length'] || 0);
  if (len > 32_000) { res.status(413).json({ error: '요청이 너무 큽니다.' }); return; }
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const r = await compute(typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body, ip, req.headers);
  res.setHeader('Cache-Control', 'no-store');
  res.status(r.status).json(r.body);
}
