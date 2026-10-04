import { describe, it, expect } from 'vitest';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { Simulator } from '../packages/engine/src/index.ts';

const bundle = buildBundle();
const sim = new Simulator(bundle);

describe('Simulator (한국판 데이터)', () => {
  it('모든 티어덱이 오류 없이 구성되고 전투가 끝난다', () => {
    for (const td of bundle.tierDecks) {
      const deck = sim.tierDeckSpec(td.id);
      expect(sim.validateDeck(deck)).toEqual([]);
    }
    const a = sim.tierDeckSpec(bundle.tierDecks[0].id);
    const b = sim.tierDeckSpec(bundle.tierDecks[1].id);
    const r = sim.simulate(a, b, { seed: 'x', trace: true });
    expect(['A', 'B', 'draw']).toContain(r.winner);
    expect(r.trace!.some(e => e.e === 'skill')).toBe(true);
    expect(r.trace!.some(e => e.e === 'damage')).toBe(true);
  });

  it('시드 고정 → 같은 몬테카를로 결과, 다른 시드 → 보통 다른 전보', () => {
    const a = sim.tierDeckSpec(bundle.tierDecks[2].id);
    const b = sim.tierDeckSpec(bundle.tierDecks[3].id);
    const m1 = sim.monteCarlo(a, b, { runs: 60, seed: 7 });
    const m2 = sim.monteCarlo(a, b, { runs: 60, seed: 7 });
    expect(m2.winA).toBe(m1.winA);
    expect(m2.avgTurns).toBe(m1.avgTurns);
    const l1 = sim.simulate(a, b, { seed: 1 }).log.join('\n');
    const l2 = sim.simulate(a, b, { seed: 2 }).log.join('\n');
    expect(l1).not.toBe(l2);
  });
});

describe('8턴 무승부 재교전 (R-009)', () => {
  const s2 = bundle.tierDecks.filter(t => t.season === 'S2');
  const d = (n: string) => sim.tierDeckSpec(s2.find(t => t.name === n)!.id);
  it('8턴이 끝나도 양쪽이 살아 있으면 생존 무장끼리 다시 싸워 한쪽이 전멸할 때까지 간다', () => {
    let found = false;
    for (let i = 0; i < 40 && !found; i++) {
      const r = sim.simulate(d('태황유'), d('조감초'), { seed: `rm-${i}`, trace: true });
      if ((r.rounds || 1) < 2) continue;
      found = true;
      expect(r.turns).toBeGreaterThan(8);
      expect(r.log.some(l => /2차 교전/.test(l))).toBe(true);
      if (r.winner !== 'draw') {
        const loser = r.winner === 'A' ? 'B' : 'A';
        expect(r.units.filter(u => u.side === loser).every(u => u.troops <= 0)).toBe(true);
      }
      // 2차 교전 부대에는 1차에서 전사한 무장이 없다
      const battles = r.trace!.filter(t => t.e === 'battle') as any[];
      const deadAfter1 = new Set(r.trace!.filter(t => t.e === 'damage' && (t as any).after <= 0 && t.turn <= 8).map(t => (t as any).dst));
      for (const u of battles[1].units) expect(deadAfter1.has(u.id)).toBe(false);
      // FIX-005: 재교전은 남은 병력이 그대로 최대 병력이 된다 (전보: 손책 13,967/13,967)
      for (const u of battles[1].units) expect(u.maxTroops).toBe(u.troops);
    }
    expect(found).toBe(true);
  });
});

describe('전보 툴팁 (FEAT-016)', () => {
  it('detail 옵션이면 전보 줄마다 그 줄에 나온 무장의 그 순간 상태가 붙는다', () => {
    const s2 = bundle.tierDecks.filter(t => t.season === 'S2');
    const d = (i: number) => sim.tierDeckSpec(s2[i].id);
    const r = sim.simulate(d(0), d(1), { seed: 'snap', detail: true });
    expect(r.lineSnaps!.length).toBe(r.log.length);
    const i = r.log.findIndex(l => /병력이 \d+\(\d+\) 손실/.test(l));
    const m = r.log[i].match(/\[([^\]]+)\]의 병력이 \d+\((\d+)\)/)!;
    expect(r.lineSnaps![i]![m[1]].troops).toBe(+m[2]);
    expect(r.lineSnaps![i]![m[1]].stats.length).toBe(4);
    const plain = sim.simulate(d(0), d(1), { seed: 'snap' });
    expect(plain.lineSnaps).toBeUndefined();
    expect(plain.log).toEqual(r.log);   // 툴팁을 켜도 전투 결과는 같다
  });
});
