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
