// 시뮬·감사는 화면이 멈추지 않게 Web Worker 에서 돌린다
import { Simulator, type DeckSpec, type GameBundle, type MonteCarloResult } from '@cheonha/engine';
import { runAudit, auditSingleBattle } from '@cheonha/audit';

let bundle: GameBundle | null = null;
let sim: Simulator | null = null;

type Msg =
  | { type: 'init'; bundle: GameBundle }
  | { type: 'mc'; id: number; a: DeckSpec; b: DeckSpec; runs: number; seed: string }
  | { type: 'battle'; id: number; a: DeckSpec; b: DeckSpec; seed: string }
  | { type: 'audit'; id: number; skillIds: string[] };

function mergeMc(parts: MonteCarloResult[], seed: string): MonteCarloResult {
  const runs = parts.reduce((a, p) => a + p.runs, 0);
  const sum = (k: 'winA' | 'winB' | 'draw') => parts.reduce((a, p) => a + p[k], 0);
  const mergeContrib = (key: 'contribution' | 'contributionB') => {
    const m = new Map<string, { id: string; name: string; value: number; procs: number }>();
    parts.forEach(p => p[key].forEach(c => {
      const e = m.get(c.id) || { id: c.id, name: c.name, value: 0, procs: 0 };
      e.value += c.value; e.procs += c.procs; m.set(c.id, e);
    }));
    const total = [...m.values()].reduce((a, c) => a + c.value, 0) || 1;
    return [...m.values()].map(c => ({ ...c, pct: c.value / total, procsPerRun: c.procs / runs })).sort((a, b) => b.value - a.value);
  };
  const curve = new Map<number, { A: number; B: number; n: number }>();
  parts.forEach(p => p.troopCurveAll.forEach(pt => {
    const e = curve.get(pt.turn) || { A: 0, B: 0, n: 0 };
    e.A += pt.A * p.runs; e.B += pt.B * p.runs; e.n += p.runs; curve.set(pt.turn, e);
  }));
  const winA = sum('winA'), winB = sum('winB'), draw = sum('draw');
  return {
    runs, winA, winB, draw, winRateA: winA / runs, winRateB: winB / runs,
    avgTurns: parts.reduce((a, p) => a + p.avgTurns * p.runs, 0) / runs,
    contribution: mergeContrib('contribution'), contributionB: mergeContrib('contributionB'),
    troopCurveAll: [...curve.entries()].sort((a, b) => a[0] - b[0]).map(([turn, e]) => ({ turn, A: e.A / e.n, B: e.B / e.n })),
    seed,
    approx: parts[0]?.approx,
  };
}

self.onmessage = (ev: MessageEvent<Msg>) => {
  const m = ev.data;
  try {
    if (m.type === 'init') { bundle = m.bundle; sim = new Simulator(bundle); return; }
    if (!sim || !bundle) throw new Error('데이터가 아직 준비되지 않았습니다.');
    if (m.type === 'mc') {
      const errs = [...sim.validateDeck(m.a), ...sim.validateDeck(m.b)];
      if (errs.length) throw new Error(errs.join('\n'));
      const batches = Math.min(10, Math.max(1, Math.floor(m.runs / 20)));
      const parts: MonteCarloResult[] = [];
      for (let i = 0; i < batches; i++) {
        const runs = Math.floor(m.runs / batches) + (i < m.runs % batches ? 1 : 0);
        parts.push(sim.monteCarlo(m.a, m.b, { runs, seed: `${m.seed}:${i}` }));
        (self as any).postMessage({ id: m.id, type: 'progress', done: i + 1, total: batches });
      }
      (self as any).postMessage({ id: m.id, type: 'result', result: mergeMc(parts, m.seed) });
    } else if (m.type === 'battle') {
      const r = sim.simulate(m.a, m.b, { seed: m.seed, trace: true });
      const audit = auditSingleBattle(bundle, r.trace!);
      const { trace, ...rest } = r;
      void trace;
      (self as any).postMessage({ id: m.id, type: 'result', result: { ...rest, audit } });
    } else if (m.type === 'audit') {
      const r = runAudit(bundle, { onlySkillIds: m.skillIds, tierSeeds: 12, extraSeeds: 30, onProgress: (done, total) => (self as any).postMessage({ id: m.id, type: 'progress', done, total }) });
      (self as any).postMessage({ id: m.id, type: 'result', result: r });
    }
  } catch (e: any) {
    (self as any).postMessage({ id: (m as any).id, type: 'error', error: e?.message || String(e) });
  }
};
