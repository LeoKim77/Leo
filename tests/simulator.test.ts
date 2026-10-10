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
    const i = r.log.findIndex(l => /\[([^\]]+)\]의 병력이 \d+\(\d+\) 손실/.test(l));
    const m = r.log[i].match(/\[([^\]]+)\]의 병력이 \d+\((\d+)\)/)!;
    expect(r.lineSnaps![i]![m[1]].troops).toBe(+m[2]);
    expect(r.lineSnaps![i]![m[1]].stats.length).toBe(4);
    const plain = sim.simulate(d(0), d(1), { seed: 'snap' });
    expect(plain.lineSnaps).toBeUndefined();
    expect(plain.log).toEqual(r.log);   // 툴팁을 켜도 전투 결과는 같다
  });
});

describe('원문 그대로 확률 실행 (R-019, FEAT-017)', () => {
  it('"랜덤 2~3명"은 수백 번 돌리면 2명·3명이 반반에 가깝게 나온다', () => {
    const E: any = (sim as any).engine;
    let seed = 7; E.setRng(() => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; });
    const mk = (id: string, side: string) => ({ id, name: id, side, alive: true, troops: 100, stats: {}, mods: {}, statuses: [], position: 'front', formation: { hitRate: { front: 0.6, mid: 0.2, back: 0.2 } } });
    const all = [mk('a', 'A'), mk('b1', 'B'), mk('b2', 'B'), mk('b3', 'B')];
    const n = { 2: 0, 3: 0 } as Record<number, number>;
    for (let i = 0; i < 600; i++) n[E.selectTargets(all[0], ['random_enemy_2to3'], all).length]++;
    expect(n[2] / 600).toBeGreaterThan(0.43);
    expect(n[3] / 600).toBeGreaterThan(0.43);
  });
});

describe('전법 랜덤 대상은 피격률과 무관 (R-020, FIX-007)', () => {
  it('기형진 상대로도 랜덤 적군 1명은 세 명이 각 1/3 근처', () => {
    const E: any = (sim as any).engine;
    let seed = 11; E.setRng(() => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; });
    const f = { hitRate: { front: 0.6, mid: 0.2, back: 0.2 } };
    const mk = (id: string, side: string, position: string) => ({ id, name: id, side, alive: true, troops: 100, stats: {}, mods: {}, statuses: [], position, formation: f });
    const all = [mk('a', 'A', 'front'), mk('b1', 'B', 'front'), mk('b2', 'B', 'back'), mk('b3', 'B', 'back')];
    const n: Record<string, number> = { b1: 0, b2: 0, b3: 0 };
    for (let i = 0; i < 900; i++) n[E.selectTargets(all[0], ['random_enemy_1'], all)[0].id]++;
    for (const k of Object.keys(n)) expect(Math.abs(n[k] / 900 - 1 / 3)).toBeLessThan(0.06);
  });
});

describe('확률 판정 순서 (R-021, FIX-008)', () => {
  it('난공불락: 60% 판정에 성공하면 뽑힌 2~3명 전원 조롱, 실패하면 아무도 없음', () => {
    const E: any = (sim as any).engine;
    const sk = bundle.skills.find(s => s.name.ko === '난공불락')!;
    expect((sk.engine as any).effects.statusEffects[0].chanceOnce).toBe(true);
    // 대상 수 분포: 0명(판정 실패) 또는 2·3명만 나오고 1명은 나오지 않는다
    const counts: Record<number, number> = {};
    const g = (n: string) => bundle.generals.find(x => x.name.ko === n)!.id;
    for (let i = 0; i < 60; i++) {
      const r = sim.simulate({ formation: '기형진', units: [{ generalId: g('주태'), skillIds: [sk.id] }] } as any,
        { formation: '기형진', units: ['조조', '전위', '순욱'].map(n => ({ generalId: g(n), skillIds: [] })) } as any, { seed: 'nk' + i, trace: true });
      const byTurn: Record<string, Set<string>> = {};
      for (const t of r.trace!) if ((t as any).e === 'status' && (t as any).status === '조롱' && (t as any).skill === sk.id && (t as any).phase === 'turnStart') (byTurn[t.turn] = byTurn[t.turn] || new Set()).add((t as any).dst);
      for (const s of Object.values(byTurn)) counts[s.size] = (counts[s.size] || 0) + 1;
    }
    expect(counts[1] || 0).toBe(0);
    expect((counts[2] || 0) + (counts[3] || 0)).toBeGreaterThan(0);
    void E;
  });
});
