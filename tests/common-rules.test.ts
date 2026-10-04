// 공용 전투 규칙(docs/COMMON_RULES.md, R-022~R-027) — 엔진 부품 단위 검증
import { describe, it, expect } from 'vitest';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { Simulator } from '../packages/engine/src/index.ts';

const E: any = (new Simulator(buildBundle()) as any).engine;
const mk = (id: string, spd: number, extra: any = {}) => ({ id, side: id[0], alive: true, position: 'front', stats: { 무력: 100, 지력: 100, 통솔: 100, 선공: spd }, statuses: [], buffs: [], statBuffs: [], mods: {}, forcedTargetId: null, ...extra });
let seed = 1;
const rng = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

describe('공용 규칙: 행동 순서 (R-022·R-023)', () => {
  E.setRng(rng);
  const firstRate = (a: number, b: number, n = 4000) => {
    let k = 0;
    for (let i = 0; i < n; i++) { const o = E.mergeActionOrder([mk('A0', a), mk('B0', b)], {}); if (o[0].id === 'A0') k++; }
    return k / n;
  };
  it('선공 차 70 초과면 항상 먼저', () => { expect(firstRate(171, 100)).toBe(1); expect(firstRate(100, 171)).toBe(0); });
  it('동률이면 약 50%', () => { expect(Math.abs(firstRate(100, 100) - 0.5)).toBeLessThan(0.04); });
  it('선공 차 35 → 난수 ±35 두 개의 차(삼각분포)로 1 − 35²/(2·70²) = 87.5%', () => { expect(Math.abs(firstRate(135, 100) - 0.875)).toBeLessThan(0.03); });
  it('같은 편끼리도 70 이내면 순서가 바뀔 수 있다', () => {
    let swapped = 0;
    for (let i = 0; i < 500; i++) { const o = E.mergeActionOrder([mk('A0', 120), mk('A1', 100)], {}); if (o[0].id === 'A1') swapped++; }
    expect(swapped).toBeGreaterThan(0);
  });
});

describe('공용 규칙: 혼란·조롱 (R-026)', () => {
  E.setRng(rng);
  it('조롱: 적 단일 대상 전법은 조롱 시전자에게 고정, 전체 대상은 그대로', () => {
    const a = mk('A0', 100, { statuses: [{ name: '조롱', remain: 2, casterId: 'B2' }] });
    const all = [a, mk('A1', 100), mk('B0', 100), mk('B1', 100), mk('B2', 100)];
    for (let i = 0; i < 50; i++) expect(E.selectTargets(a, ['random_enemy_1'], all)[0].id).toBe('B2');
    expect(E.selectTargets(a, ['all_enemy'], all).length).toBe(3);
  });
  it('혼란: 단일 대상은 자신을 뺀 적·아군 전체에서 무작위 (아군 회복 전법이 적을 고를 수 있다)', () => {
    const a = mk('A0', 100, { statuses: [{ name: '혼란', remain: 2 }] });
    const all = [a, mk('A1', 100), mk('B0', 100), mk('B1', 100), mk('B2', 100)];
    const seen = new Set<string>();
    for (let i = 0; i < 400; i++) { const t = E.selectTargets(a, ['lowest_hp_ally'], all)[0]; expect(t.id).not.toBe('A0'); seen.add(t.id); }
    expect([...seen].sort()).toEqual(['A1', 'B0', 'B1', 'B2']);
  });
});

describe('공용 규칙: 지속 턴 = 걸린 무장의 행동 횟수 (R-025)', () => {
  const run = (appliedAfterAction: boolean) => {
    const u = mk('A0', 100);
    let affected = 0;
    // 1턴: 행동 전/후에 1턴 침묵이 걸린다
    if (!appliedAfterAction) u.statuses.push({ name: '침묵', remain: 1 });
    E.tickHolderBuffs(u); if (u.statuses.length) affected++;
    E.markHolderSeen(u);   // 자기 행동 종료
    if (appliedAfterAction) u.statuses.push({ name: '침묵', remain: 1 });   // 뒤에 행동한 적이 건다
    for (let t = 2; t <= 3; t++) { E.tickHolderBuffs(u); if (u.statuses.length) affected++; E.markHolderSeen(u); }
    return affected;
  };
  it('행동 전에 걸린 1턴 효과는 그 행동 1번', () => expect(run(false)).toBe(1));
  it('이미 행동한 무장에게 걸린 1턴 효과는 다음 행동 1번 (예전엔 0번)', () => expect(run(true)).toBe(1));
});

describe('공용 규칙: 대상·혼란 (R-028·R-031·R-032)', () => {
  E.setRng(rng);
  const team = () => { const a = mk('A0', 100); return { a, all: [a, mk('A1', 100), mk('A2', 100), mk('B0', 100), mk('B1', 100), mk('B2', 100)] }; };
  it('자신과 랜덤 우군 1명 = 자신 + 자신 아닌 우군 1명', () => {
    const { a, all } = team();
    for (let i = 0; i < 50; i++) { const r = E.selectTargets(a, ['self_and_random_ally_1'], all); expect(r.length).toBe(2); expect(r[0]).toBe(a); expect(r[1].side).toBe('A'); expect(r[1]).not.toBe(a); }
  });
  it('자신을 제외한 전체 적군과 우군 = 5명', () => { const { a, all } = team(); expect(E.selectTargets(a, ['all_except_self'], all).length).toBe(5); });
  it('혼란: 랜덤 적 2명 → 자신 뺀 5명 풀에서 2명, 아군만 뽑히는 경우도 있다', () => {
    const { a, all } = team(); a.statuses.push({ name: '혼란', remain: 2 });
    let allyOnly = 0;
    for (let i = 0; i < 600; i++) { const r = E.selectTargets(a, ['random_enemy_n'], all); expect(r.length).toBe(2); expect(r).not.toContain(a); if (r.every((x: any) => x.side === 'A')) allyOnly++; }
    expect(allyOnly).toBeGreaterThan(0);   // 이론값 1/10
  });
  it('혼란: 전체 적군 → 전장 무작위 3명', () => { const { a, all } = team(); a.statuses.push({ name: '혼란', remain: 2 }); expect(E.selectTargets(a, ['all_enemy'], all).length).toBe(3); });
  it('"통솔이 가장 낮은 적"은 홍수(통솔 −20)까지 반영', () => {
    const { a, all } = team(); all[3].stats.통솔 = 110; all[4].stats.통솔 = 105; all[5].stats.통솔 = 120; all[5].statuses.push({ name: '홍수', remain: 2 });
    expect(E.selectTargets(a, ['lowest_control_enemy'], all)[0].id).toBe('B2');
  });
});

describe('공용 규칙: 지휘 효과 즉시 소멸 (R-029)', () => {
  it('시전자가 전사하는 순간 지휘 버프가 사라진다', () => {
    const c = mk('A0', 100), t = mk('A1', 100);
    t.mods.받는피해 = -0.2; t.buffs.push({ stat: '받는피해', value: -0.2, remain: 999, srcId: 'x', aura: 'A0' });
    c.alive = false;
    E.sweepDeadAuras([c, t], [], 1);
    expect(t.buffs.length).toBe(0); expect(t.mods.받는피해).toBeCloseTo(0);
  });
});

describe('공용 규칙: 연쇄 트리거 (R-033)', () => {
  it('초선차전은 원문대로 턴당 최대 5회', async () => {
    const { buildBundle } = await import('../packages/data-tools/src/bundle.ts');
    const { Simulator } = await import('../packages/engine/src/index.ts');
    const b: any = buildBundle(); const sim = new Simulator(b);
    const td = (n: string) => sim.tierDeckSpec(b.tierDecks.find((t: any) => t.name === n).id);
    let maxTurn = 0;
    for (let i = 0; i < 40; i++) {
      const r = sim.simulate(td('대황노'), td('충의궁'), { seed: 'chain' + i, trace: true });
      const per: Record<string, number> = {}; let cur = '';
      for (const e of r.trace as any[]) {
        if (e.e === 'turn') cur = String(e.turn ?? Math.random());
        if (e.e === 'skill' && e.skill === 'u-zhuge-liang' && e.via === 'event') { const k = cur + e.unit; per[k] = (per[k] || 0) + 1; maxTurn = Math.max(maxTurn, per[k]); }
      }
    }
    expect(maxTurn).toBeLessThanOrEqual(5);
    expect(maxTurn).toBeGreaterThan(0);
  });
});
