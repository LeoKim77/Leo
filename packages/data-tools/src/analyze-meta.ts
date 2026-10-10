// 시즌 티어덱 교차 분석: 시뮬 전투 + 규칙 감사 + 계수 민감도 → data/analysis/<A>-vs-<B>.json
//
// 사용: tsx src/analyze-meta.ts S1 S2 [판 수=100]
//   1) A 시즌 × B 시즌 티어덱 전부 (진영 A/B 를 반씩 바꿔 진영 편향 제거)
//   2) 시즌별 상위 3덱(시트 티어 순) × 같은 시즌 덱 — 메타 안에서의 위치
//   3) 교차 전투 추적(trace)으로 덱별 피해 구성(병기/책략, 일반 공격/액티브/추격/지속) · 회복 · 상태
//   4) 같은 전투를 규칙 감사에 넣어 이 덱들에서 원문과 어긋나는 전법을 찾는다
//   5) 계수 민감도: 실측이 부족한 계수를 ±15% 바꿨을 때 상위 덱 대전 승률이 얼마나 바뀌는가
//      → 녹화로 먼저 알아내야 할 계수 순위
import { join } from 'node:path';
import { buildBundle } from './bundle.ts';
import { DATA, writeJson } from './paths.ts';
import { Simulator, type DeckSpec, type TraceEvent } from '../../engine/src/index.ts';
import { runAudit } from '../../audit/src/index.ts';

const [, , SA = 'S1', SB = 'S2', RUNS = '100'] = process.argv;
const runs = +RUNS;
const bundle = buildBundle();
const sim = new Simulator(bundle);
const t0 = Date.now();
const log = (...a: unknown[]) => console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s]`, ...a);

/** 시트 티어 순서: 숫자가 작을수록 위, '+' 는 조금 위, '-' 는 조금 아래. 같으면 시트 순서 */
const tierKey = (t: string) => {
  const v = parseFloat(t.replace(/[^\d.]/g, ''));
  const n = Number.isNaN(v) ? 9 : v;
  return n + (t.endsWith('+') ? -0.01 : t.endsWith('-') ? 0.01 : 0);
};
const decksOf = (s: string) => bundle.tierDecks.filter(t => t.season === s).map((t, i) => ({ t, i })).sort((a, b) => tierKey(a.t.tier) - tierKey(b.t.tier) || a.i - b.i).map(x => x.t);
const A = decksOf(SA), B = decksOf(SB);
const spec = new Map<string, DeckSpec>([...A, ...B].map(t => [t.id, sim.tierDeckSpec(t.id)]));
const label = (id: string) => { const t = bundle.tierDecks.find(x => x.id === id)!; return `${t.season} ${t.tier} ${t.name}`; };

interface Pair { a: string; b: string; winA: number; winB: number; draw: number; runs: number; turns: number; rounds: number;
  contribA: Array<{ name: string; pct: number; procs: number }>; contribB: Array<{ name: string; pct: number; procs: number }> }

/** 진영(A/B 자리)을 반씩 바꿔 돌리고 a 기준으로 합친다 */
function matchup(a: string, b: string, n: number, seed: string, s = sim): Pair {
  const h = Math.ceil(n / 2);
  const m1 = s.monteCarlo(spec.get(a)!, spec.get(b)!, { runs: h, seed: `${seed}:1` });
  const m2 = s.monteCarlo(spec.get(b)!, spec.get(a)!, { runs: n - h, seed: `${seed}:2` });
  const top = (l: any[]) => l.slice(0, 6).map(c => ({ name: c.name, pct: +c.pct.toFixed(3), procs: +c.procsPerRun.toFixed(2) }));
  return {
    a, b, runs: n, winA: m1.winA + m2.winB, winB: m1.winB + m2.winA, draw: m1.draw + m2.draw,
    turns: +((m1.avgTurns * h + m2.avgTurns * (n - h)) / n).toFixed(2),
    rounds: +(((m1.avgRounds ?? 1) * h + (m2.avgRounds ?? 1) * (n - h)) / n).toFixed(2),
    contribA: top(m1.contribution), contribB: top(m1.contributionB),
  };
}

// ── 1) 교차 ──
const cross: Pair[] = [];
for (const a of A) {
  for (const b of B) cross.push(matchup(a.id, b.id, runs, `x:${a.id}:${b.id}`));
  log(`교차 ${cross.length}/${A.length * B.length}`, a.name);
}

// ── 2) 상위 3덱 × 같은 시즌 ──
const top3 = { [SA]: A.slice(0, 3).map(t => t.id), [SB]: B.slice(0, 3).map(t => t.id) };
const within: Pair[] = [];
for (const [season, ids] of Object.entries(top3)) {
  const pool = season === SA ? A : B;
  for (const id of ids) for (const o of pool) if (o.id !== id) within.push(matchup(id, o.id, runs, `w:${id}:${o.id}`));
}
log('같은 시즌 대전', within.length);

// ── 3)·4) 추적 전투: 피해 구성 + 감사 ──
type Comp = { battles: number; dmg: Record<string, number>; heal: number; statuses: Record<string, number>; dmgTaken: number; deaths: number };
const comp = new Map<string, Comp>();
const traceSeeds = 4;
const plan = cross.map(p => ({ label: `${label(p.a)} vs ${label(p.b)}`, a: spec.get(p.a)!, b: spec.get(p.b)!, seeds: traceSeeds }));
for (const p of cross) {
  for (let k = 0; k < traceSeeds; k++) {
    const r = sim.simulate(spec.get(p.a)!, spec.get(p.b)!, { seed: `audit:${label(p.a)} vs ${label(p.b)}:${k}`, trace: true });
    const sideDeck: Record<string, string> = { A: p.a, B: p.b };
    const unitSide = new Map<string, string>();
    for (const ev of r.trace as TraceEvent[]) if (ev.e === 'battle') (ev as any).units.forEach((u: any) => unitSide.set(u.id, u.side));
    for (const side of ['A', 'B']) {
      const c = comp.get(sideDeck[side]) || { battles: 0, dmg: {}, heal: 0, statuses: {}, dmgTaken: 0, deaths: 0 };
      c.battles++;
      comp.set(sideDeck[side], c);
    }
    for (const ev of r.trace as any[]) {
      if (ev.e === 'damage') {
        const side = unitSide.get(ev.src); if (!side) continue;
        const c = comp.get(sideDeck[side])!;
        const kind = ev.tag === 'basic' ? '일반 공격' : ev.tag === 'pursuit' ? '추격' : ev.tag === 'dot' ? '지속' : '전법';
        c.dmg[`${ev.dmgType}·${kind}`] = (c.dmg[`${ev.dmgType}·${kind}`] || 0) + ev.amount;
        comp.get(sideDeck[unitSide.get(ev.dst) || 'A'])!.dmgTaken += ev.amount;
      } else if (ev.e === 'heal') {
        const side = unitSide.get(ev.src); if (side) comp.get(sideDeck[side])!.heal += ev.amount;
      } else if (ev.e === 'status') {
        const side = unitSide.get(ev.src); if (side && unitSide.get(ev.dst) !== side) { const c = comp.get(sideDeck[side])!; c.statuses[ev.status] = (c.statuses[ev.status] || 0) + 1; }
      }
    }
    r.units.forEach(u => { if (u.troops <= 0) comp.get(sideDeck[u.side])!.deaths++; });
  }
}
log('추적 전투', cross.length * traceSeeds);
const audit = runAudit(bundle, { plan });
log('감사', audit.summary);

// ── 5) 계수 민감도 ──
// 실측이 부족하거나 잠정인 계수 (core.js DEFAULT_COEFFS 주석 기준)
const COEFS: Array<{ key: string; base: number | string; what: string; alt?: string }> = [
  { key: 'P0', base: 414, what: '병기 피해 기초값 (414 + 1.07×무력 − 1.63×통솔)' },
  { key: 'Pa', base: 1.07, what: '병기 피해의 무력 계수' },
  { key: 'Pd', base: 1.63, what: '병기 피해의 대상 통솔(방어) 계수' },
  { key: 'betaP', base: 0.47, what: '병기 피해의 병력 지수 (병력/10000)^β' },
  { key: 'Ma', base: 1.73, what: '책략 피해의 지력 계수' },
  { key: 'betaM', base: 0.40, what: '책략 피해의 병력 지수' },
  { key: 'counterBonus', base: 0.15, what: '병종 상성 피해 보너스' },
  { key: 'statScaleWeight', base: 0.00285, what: "'(스탯)의 영향 받음' 계수 (잠정 W08)" },
  { key: 'healStatW', base: 0.00027, what: '회복의 지력 가중치' },
  { key: 'woundedRate', base: 0.85, what: '손실 병력 중 부상병 비율(회복 상한)' },
  { key: 'critMult', base: 1.5, what: '회심·묘책 피해 배율' },
  { key: 'orderWindow', base: 70, what: '선공 차 확정 선행 기준 (70 이내는 확률)' },
  { key: 'durationMode', base: 'holder', alt: 'turnEnd', what: '지속 턴 감소 시점 (보유자 행동 기준 잠정 W05 ↔ 턴 종료)' },
];
const sensPairs: Array<[string, string]> = [];
for (const a of top3[SA]) for (const b of top3[SB]) sensPairs.push([a, b]);
for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) sensPairs.push([top3[SB][i], top3[SB][j]]);
for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) sensPairs.push([top3[SA][i], top3[SA][j]]);
const SR = 200;
const baseRates = sensPairs.map(([a, b]) => matchup(a, b, SR, `s:${a}:${b}`));
const sensitivity = COEFS.map(c => {
  const variants = typeof c.base === 'number' ? [{ v: +(c.base * 0.85).toPrecision(4), tag: '-15%' }, { v: +(c.base * 1.15).toPrecision(4), tag: '+15%' }] : [{ v: c.alt!, tag: c.alt! }];
  const out = variants.map(vr => {
    const s = new Simulator(bundle, { coeffs: { [c.key]: vr.v } as any });
    const deltas = sensPairs.map(([a, b], i) => {
      const r = matchup(a, b, SR, `s:${a}:${b}`, s);
      return { a, b, base: baseRates[i].winA / SR, now: r.winA / SR, delta: (r.winA - baseRates[i].winA) / SR };
    });
    return { variant: vr.tag, value: vr.v, meanAbs: deltas.reduce((x, d) => x + Math.abs(d.delta), 0) / deltas.length, max: deltas.reduce((m, d) => (Math.abs(d.delta) > Math.abs(m.delta) ? d : m)), deltas };
  });
  log('민감도', c.key, out.map(o => `${o.variant} ${(o.meanAbs * 100).toFixed(1)}%p`).join(' '));
  return { ...c, variants: out, score: Math.max(...out.map(o => o.meanAbs)) };
}).sort((x, y) => y.score - x.score);

// ── 정리 ──
const deckStats = (id: string) => {
  const own = cross.filter(p => p.a === id).map(p => ({ opp: p.b, win: p.winA / p.runs, lose: p.winB / p.runs, turns: p.turns, rounds: p.rounds }))
    .concat(cross.filter(p => p.b === id).map(p => ({ opp: p.a, win: p.winB / p.runs, lose: p.winA / p.runs, turns: p.turns, rounds: p.rounds })));
  const w = within.filter(p => p.a === id).map(p => ({ opp: p.b, win: p.winA / p.runs, lose: p.winB / p.runs, turns: p.turns, rounds: p.rounds }));
  const avg = (l: typeof own) => (l.length ? l.reduce((s, x) => s + x.win, 0) / l.length : null);
  return { id, label: label(id), crossWin: avg(own), withinWin: avg(w), cross: own, within: w, comp: comp.get(id), approx: sim.approxIn(spec.get(id)!) };
};
const decks = [...A, ...B].map(t => deckStats(t.id));
const auditFindings = audit.skills.filter(s => s.checks.some(c => c.level === 'fail' || (c.level === 'warn' && /^D/.test(c.rule))))
  .map(s => ({ id: s.id, name: s.name, owner: s.owner, checks: s.checks.filter(c => c.level === 'fail' || (c.level === 'warn' && /^D/.test(c.rule))).map(c => ({ rule: c.rule, level: c.level, message: c.message })) }));
const out = {
  generatedAt: new Date().toISOString(), dataVersion: bundle.dataVersion, seasons: [SA, SB], runsPerPair: runs,
  note: '진영 A/B 를 반씩 바꿔 돌린 승률. 8턴 무승부는 생존 무장끼리 재교전(R-009). 신규 카드의 임시값·근사 효과는 approx 에 표시.',
  top3, decks, cross, within,
  audit: { battles: audit.battles, summary: audit.summary, engineRules: audit.engineRules, findings: auditFindings },
  sensitivity: { pairs: sensPairs.map(([a, b]) => `${label(a)} vs ${label(b)}`), runsPerPair: SR, coefs: sensitivity },
};
const file = join(DATA, 'analysis', `${SA.toLowerCase()}-vs-${SB.toLowerCase()}.json`);
writeJson(file, out);
log('저장', file);
