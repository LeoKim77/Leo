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
