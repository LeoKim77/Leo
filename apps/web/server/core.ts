// 시뮬 서버 (OPS15 엔진 보호) — 엔진·전법 정의·계수는 이 서버 안에서만 돈다.
//   브라우저는 편성만 보내고, 결과 요약과 인게임 문구 전보만 받는다.
//   Vercel 함수(api/*.ts)와 로컬 서버(server/local.ts)가 같은 핸들러를 쓴다.
import { handle } from '../src/compute.ts';
import { gameLine } from '../src/log-format.ts';
import { checkRate, getAccount, chargePoints } from './account.ts';

export type ApiResult = { status: number; body: any };
const fail = (status: number, message: string): ApiResult => ({ status, body: { error: message } });

let ready = false;
let alternatives: any[] = [];
async function ensure() {
  if (ready) return;
  const { default: bundle } = await import('./_generated/bundle.json', { with: { type: 'json' } } as any);
  alternatives = (await import('./_generated/alternatives.json', { with: { type: 'json' } } as any)).default;
  handle({ type: 'init', bundle } as any, () => {});
  ready = true;
}

/** compute.ts 는 결과를 콜백으로 넘긴다(동기) — 마지막 result/error 를 받는다 */
function run(msg: any): any {
  let out: any = null;
  handle({ ...msg, id: 1 }, (m: any) => { if (m.type === 'result' || m.type === 'error') out = m; });
  if (!out) throw new Error('no result');
  if (out.type === 'error') throw Object.assign(new Error(out.error), { user: true });
  return out.result;
}

// ── 입력 검사 ──────────────────────────────────────────
const isId = (x: unknown) => typeof x === 'string' && x.length <= 64 && /^[a-z0-9-]+$/.test(x);
function deck(d: any) {
  if (!d || typeof d !== 'object' || !Array.isArray(d.units) || d.units.length < 1 || d.units.length > 3) return null;
  const units = d.units.map((u: any) => ({
    generalId: u?.generalId,
    skillIds: Array.isArray(u?.skillIds) ? u.skillIds.slice(0, 2) : [],
    ...(u?.manualId != null ? { manualId: u.manualId } : {}),
    ...(typeof u?.position === 'string' ? { position: u.position.slice(0, 8) } : {}),
    ...(typeof u?.unitType === 'string' ? { unitType: u.unitType.slice(0, 8) } : {}),
  }));
  if (!units.every((u: any) => isId(u.generalId) && (u.manualId == null || u.manualId === 'none' || isId(u.manualId)) && u.skillIds.every(isId))) return null;
  return { formation: typeof d.formation === 'string' ? d.formation.slice(0, 16) : '일자진', units, ...(typeof d.name === 'string' ? { name: d.name.slice(0, 40) } : {}) };
}
const seed = (s: unknown) => (typeof s === 'string' ? s.slice(0, 48) : String(Date.now()));

// ── 응답 정제: 인게임에 보이는 것만 ───────────────────────
const approx = (a: any) => a ? { A: (a.A || []).map((x: any) => ({ owner: x.owner, name: x.name, kind: x.kind, note: '' })), B: (a.B || []).map((x: any) => ({ owner: x.owner, name: x.name, kind: x.kind, note: '' })) } : undefined;
function cleanBattle(r: any) {
  const keep: number[] = [];
  const log: string[] = [];
  (r.log || []).forEach((l: string, i: number) => { const g = gameLine(l); if (g != null) { keep.push(i); log.push(g); } });
  const snaps = r.lineSnaps ? keep.map(i => r.lineSnaps[i] ?? null) : undefined;
  return { winner: r.winner, turns: r.turns, rounds: r.rounds, log, lineSnaps: snaps, approx: approx(r.approx),
    troopHistory: r.troopHistory, units: (r.units || []).map((u: any) => ({ id: u.id, side: u.side, name: u.name, generalId: u.generalId, troops: u.troops, maxTroops: u.maxTroops })) };
}
function cleanMc(m: any) {
  const c = (l: any[]) => (l || []).map(x => ({ id: x.id, name: x.name, pct: x.pct, procsPerRun: x.procsPerRun }));
  return { runs: m.runs, winA: m.winA, winB: m.winB, draw: m.draw, winRateA: m.winRateA, winRateB: m.winRateB, avgTurns: m.avgTurns, avgRounds: m.avgRounds,
    contribution: c(m.contribution), contributionB: c(m.contributionB), troopCurveAll: m.troopCurveAll, seed: m.seed, approx: approx(m.approx) };
}

/** POST /api/compute — { type: 'mc'|'list'|'battle'|'recommend', ... } */
export async function compute(body: any, ip: string, headers: Record<string, string | undefined>): Promise<ApiResult> {
  try {
    if (!body || typeof body !== 'object') return fail(400, '잘못된 요청입니다.');
    const acct = await getAccount(headers);
    const who = acct?.id || ip;
    if (!checkRate(who, body.type === 'recommend' ? 'recommend' : 'sim')) return fail(429, '요청이 너무 많습니다. 잠시 뒤 다시 시도해 주세요.');
    await ensure();
    if (body.type === 'mc' || body.type === 'list' || body.type === 'battle') {
      const a = deck(body.a), b = deck(body.b);
      if (!a || !b) return fail(400, '편성을 확인해 주세요.');
      if (body.type === 'mc') {
        // 시뮬 실행 버튼 1번 = 포인트 1회 (OPS3) — 계정 연결 전에는 차감 없이 통과
        const ok = await chargePoints(acct, 'sim');
        if (!ok) return fail(402, '포인트가 부족합니다.');
        const runs = Math.max(1, Math.min(100, Math.floor(Number(body.runs) || 10)));
        return { status: 200, body: cleanMc(run({ type: 'mc', a, b, runs, seed: seed(body.seed) })) };
      }
      if (body.type === 'list') {
        const count = Math.max(1, Math.min(20, Math.floor(Number(body.count) || 10)));
        return { status: 200, body: run({ type: 'list', a, b, count, seed: seed(body.seed) }).map((x: any) => ({ no: x.no, seed: x.seed, winner: x.winner, turns: x.turns, rounds: x.rounds, troopsA: x.troopsA, troopsB: x.troopsB })) };
      }
      return { status: 200, body: cleanBattle(run({ type: 'battle', a, b, seed: seed(body.seed) })) };
    }
    if (body.type === 'recommend') {
      const owned = { generals: (body.owned?.generals || []).filter(isId).slice(0, 300), skills: (body.owned?.skills || []).filter(isId).slice(0, 400) };
      const r = run({ type: 'recommend', owned, count: Math.max(1, Math.min(5, Number(body.count) || 3)), allowGeneralSub: !!body.allowGeneralSub,
        alternatives /* 서버 자료만 쓴다(클라이언트가 보낸 값 무시) */, validateRuns: Math.max(0, Math.min(40, Number(body.validateRuns) || 0)), season: typeof body.season === 'string' ? body.season.slice(0, 4) : undefined });
      return { status: 200, body: r };
    }
    return fail(400, '지원하지 않는 요청입니다.');
  } catch (e: any) {
    // 내부 오류 문구(엔진 내부 정보)는 내보내지 않는다. 편성 검사 오류처럼 사용자에게 필요한 것만
    if (e?.user && /편성|무장|전법|금병법|같은 인물|중복/.test(String(e.message))) return fail(400, String(e.message).slice(0, 200));
    console.error('[compute]', e);
    return fail(500, '계산 중 오류가 났습니다.');
  }
}
