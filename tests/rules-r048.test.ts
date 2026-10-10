// 기획 플랫폼 질문 답변 R-048 (2026-10-05) — 엔진 부품 검증
import { describe, it, expect } from 'vitest';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { Simulator } from '../packages/engine/src/index.ts';

const bundle: any = buildBundle();
const sim = new Simulator(bundle);
const E: any = (sim as any).engine;
let seed = 7;
E.setRng(() => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; });
const mk = (id: string, extra: any = {}) => ({ id, name: id, side: id[0], alive: true, position: 'front', troops: 5000, maxTroops: 10000, wounded: 0,
  stats: { 무력: 100, 지력: 200, 통솔: 100, 선공: 100 }, statuses: [], buffs: [], statBuffs: [], mods: {}, forcedTargetId: null, ...extra });

describe('R-048', () => {
  it('"가장 높은 ○○" 동률이면 무작위 (예전엔 늘 배치 순 앞)', () => {
    const a = mk('A0'), all = [a, mk('A1'), mk('B0'), mk('B1')];
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) seen.add(E.selectTargets(a, ['highest_power_enemy'], all)[0].id);
    expect([...seen].sort()).toEqual(['B0', 'B1']);
  });

  it('군량 고갈은 받는 회복 증감까지 계산한 최종 회복량 ×0.3', () => {
    const c = mk('A0');
    const plain = E.calcHeal(c, mk('A1'), 1, E.DEFAULT_COEFFS).heal;
    const starved = E.calcHeal(c, mk('A1', { statuses: [{ name: '군량 고갈', remain: 2 }] }), 1, E.DEFAULT_COEFFS).heal;
    expect(starved / plain).toBeCloseTo(0.3, 2);
    const boosted = E.calcHeal(c, mk('A1', { mods: { 받는회복량: 0.3 } }), 1, E.DEFAULT_COEFFS).heal;
    const both = E.calcHeal(c, mk('A1', { mods: { 받는회복량: 0.3 }, statuses: [{ name: '군량 고갈', remain: 2 }] }), 1, E.DEFAULT_COEFFS).heal;
    expect(both / boosted).toBeCloseTo(0.3, 2);   // 예전 합연산이면 0.6/1.3
  });

  it('연소: 화소연영이 스택을 쌓고 턴마다 60%×스택 피해 (부여 시점 스냅샷)', () => {
    const gen = (n: string) => bundle.generals.find((g: any) => g.name.ko === n);
    const unit = (n: string) => ({ generalId: gen(n).id, skillIds: [], manualId: 'none' });
    const logs = [1, 2, 3, 4].map(s => sim.simulate({ formation: '기형진', units: [unit('육손'), unit('주유'), unit('제갈량')] } as any,
      { formation: '기형진', units: [unit('손책'), unit('대교'), unit('조운')] } as any, { seed: s }).log.join('\n'));
    expect(logs.some(l => /「연소」 2스택으로 병력이/.test(l))).toBe(true);
  });

  it('능력치 하한 0', () => {
    const u = mk('A0', { stats: { 무력: 10, 지력: 10, 통솔: 10, 선공: 10 }, statuses: [{ name: '홍수', remain: 2 }] });
    expect(E.effStat(u, '통솔')).toBe(0);
  });
});
