// 로컬 서버 (pnpm serve:local) — 배포 전, 계정 없이 공개 빌드(dist-public)와 API 를 그대로 시험한다.
//   Vercel 에서는 api/*.ts 가 같은 핸들러를 부른다.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { compute } from './core.ts';
import { submit } from './submit.ts';
import { SECURITY_HEADERS } from './headers.ts';

const ROOT = resolve(import.meta.dirname, '..', 'dist-public');
const PORT = Number(process.env.PORT || 8787);
const TYPES: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

createServer(async (req, res) => {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);
  const url = new URL(req.url || '/', 'http://x');
  const ip = String(req.socket.remoteAddress || '');
  if (url.pathname === '/api/compute' || url.pathname === '/api/submit') {
    if (req.method !== 'POST') { res.writeHead(405).end(); return; }
    let raw = '';
    for await (const c of req) { raw += c; if (raw.length > 32_000) { res.writeHead(413).end(); return; } }
    let body: any = null; try { body = JSON.parse(raw || '{}'); } catch { /* 400 */ }
    const r = await (url.pathname === '/api/compute' ? compute : submit)(body, ip, req.headers as any);
    res.writeHead(r.status, { 'content-type': 'application/json', 'cache-control': 'no-store' }).end(JSON.stringify(r.body));
    return;
  }
  const p = normalize(join(ROOT, url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname)));
  if (!p.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  try { const buf = await readFile(p); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }).end(buf); }
  catch { res.writeHead(404).end('not found'); }
}).listen(PORT, () => console.log(`공개 빌드 로컬 서버: http://localhost:${PORT}`));
