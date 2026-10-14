// 검증 요청 녹화 제출 (OPS5·OPS6·OPS7) — 시뮬서 '검증 요청' 탭의 제출 폼
//   구글 드라이브 링크 + 판 번호 + 메모 → 승인 대기. 판당 3건 상한.
//   저장: Supabase 연결 전에는 로컬 파일(data/submissions/*.jsonl, 운영자 확인용). 연결 뒤에는 submissions 테이블.
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { checkRate, getAccount } from './account.ts';
import type { ApiResult } from './core.ts';

const DIR = resolve(process.env.SUBMISSIONS_DIR || join(process.cwd(), '..', '..', 'data', 'submissions'));
const DRIVE = /^https:\/\/(drive|docs)\.google\.com\/[\w\-./?=&%#]+$/;
const CAP = 3;

function all(): any[] {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR).filter(f => f.endsWith('.jsonl')).flatMap(f => readFileSync(join(DIR, f), 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean));
}

export async function submit(body: any, ip: string, headers: Record<string, string | undefined>): Promise<ApiResult> {
  const acct = await getAccount(headers);
  const who = acct?.id || `ip:${ip}`;
  if (!checkRate(who, 'recommend')) return { status: 429, body: { error: '요청이 너무 많습니다. 잠시 뒤 다시 시도해 주세요.' } };
  const deck = Math.floor(Number(body?.deck));
  const url = String(body?.url || '').trim();
  const memo = String(body?.memo || '').slice(0, 500);   // deck 0 = 화면만 녹화
  if (!(deck >= 0 && deck <= 99)) return { status: 400, body: { error: '판 번호를 확인해 주세요.' } };
  if (!DRIVE.test(url) || url.length > 300) return { status: 400, body: { error: '구글 드라이브 공유 링크(https://drive.google.com/…)를 넣어 주세요.' } };
  if (process.env.SUPABASE_URL) return { status: 503, body: { error: '제출 저장소 연결 준비 중입니다.' } };   // TODO(OPS6): submissions 테이블
  if (process.env.VERCEL) return { status: 503, body: { error: '제출 접수는 로그인 기능과 함께 열립니다.' } };
  const mine = all().filter(x => x.who === who && x.deck === deck);
  if (mine.length >= CAP) return { status: 409, body: { error: `이 판은 이미 ${CAP}건 제출했습니다.` } };
  if (all().some(x => x.url === url)) return { status: 409, body: { error: '이미 제출된 링크입니다.' } };
  mkdirSync(DIR, { recursive: true });
  const rec = { id: `S-${Date.now().toString(36)}`, at: new Date().toISOString(), who, deck, url, memo, status: '승인 대기' };
  appendFileSync(join(DIR, `${rec.at.slice(0, 10)}.jsonl`), JSON.stringify(rec) + '\n');
  return { status: 200, body: { id: rec.id, status: rec.status, left: CAP - mine.length - 1 } };
}
