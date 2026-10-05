// 녹화 '제갈량·육손·주유 vs 서서·여몽·노숙' (2026-10-05) 로 확인한 전투 로직 — FIX-016~021, FEAT-027
import { describe, it, expect } from 'vitest';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { Simulator } from '../packages/engine/src/index.ts';

const bundle: any = buildBundle();
const sim = new Simulator(bundle);
const E: any = (sim as any).engine;
const gen = (n: string) => bundle.generals.find((g: any) => g.name.ko === n);
const unit = (n: string, skillIds: string[] = []) => ({ generalId: gen(n).id, skillIds, manualId: 'none' });
const mk = (id: string, extra: any = {}) => ({ id, name: id, side: id[0], alive: true, position: 'front', troops: 8000, maxTroops: 10000, wounded: 0,
  stats: { 무력: 100, 지력: 200, 통솔: 100, 선공: 100 }, statuses: [], buffs: [], statBuffs: [], mods: {}, forcedTargetId: null, ...extra });

/** 시드별 전투를 돌리며 감사 기록(trace)을 모은다 */
function traces(ally: any, enemy: any, seeds: number[]) {
  return seeds.map(seed => sim.simulate(ally, enemy, { seed, trace: true }).trace as any[]);
}

describe('녹화 2026-10-05 (제갈량·육손·주유)', () => {
  it('FIX-016 책략 피해: 상대 지력이 높을수록 덜 받는다', () => {
    const a = mk('A0', { stats: { 무력: 100, 지력: 300, 통솔: 200, 선공: 100 } });
    E.setRng(() => 0.999);
    const lo = E.calcDamage(a, mk('B0', { stats: { 무력: 100, 지력: 150, 통솔: 200, 선공: 100 } }), 1, '책략', { ...E.DEFAULT_COEFFS, damageVariance: 0 }, null, 1, 'active').dmg;
    const hi = E.calcDamage(a, mk('B1', { stats: { 무력: 100, 지력: 350, 통솔: 200, 선공: 100 } }), 1, '책략', { ...E.DEFAULT_COEFFS, damageVariance: 0 }, null, 1, 'active').dmg;
    expect(hi).toBeLessThan(lo * 0.75);
  });

  it('FIX-016 회복식: 주유 지력 341.34, 기지의 승리 41.2% → 육손 179 (녹화)', () => {
    const c = mk('A0', { stats: { 무력: 108.66, 지력: 341.34, 통솔: 240, 선공: 137 } });
    const t = mk('A1', { troops: 1000 });
    const { heal } = E.calcHeal(c, t, 0.412, E.DEFAULT_COEFFS);
    expect(Math.abs(heal - 179) / 179).toBeLessThan(0.03);
  });

  it('FIX-019 전사한 무장이 건 효과는 모두 사라진다(지속 피해 제외)', () => {
    const d = mk('B0', { alive: false, troops: 0 });
    const t = mk('A0', { stats: { 무력: 100, 지력: 170, 통솔: 100, 선공: 100 },
      statBuffs: [{ stat: '지력', value: -30, remain: 2, caster: 'B0' }], buffs: [{ stat: '받는피해', value: 0.28, remain: 1, caster: 'B0' }], mods: { 받는피해: 0.28 },
      statuses: [{ name: '침묵', remain: 1, casterId: 'B0' }, { name: '연소', remain: 2, casterId: 'B0' }] });
    E.sweepDeadAuras([d, t], [], 3);
    expect(t.stats.지력).toBe(200);
    expect(t.mods.받는피해).toBeCloseTo(0, 6);
    expect(t.statuses.map((s: any) => s.name)).toEqual(['연소']);
  });

  it('FEAT-027 초선차전은 자기 피해로 다시 판정한다(초선차전 피해가 연달아 나온다)', () => {
    const evs = traces({ formation: '기형진', units: [unit('제갈량'), unit('육손'), unit('주유')] },
      { formation: '기형진', units: [unit('서서'), unit('여몽'), unit('노숙')] }, [1, 2, 3, 4, 5, 6]);
    const chained = evs.some(ev => {
      const dmg = ev.filter(e => e.e === 'damage');
      return dmg.some((e, i) => i > 0 && e.skill === 'u-zhuge-liang' && dmg[i - 1].skill === 'u-zhuge-liang');
    });
    expect(chained).toBe(true);
  });

  it('FIX-021 백의도강: 첫 시전엔 추가 80% 없이 목표당 한 번만 피해', () => {
    const evs = traces({ formation: '기형진', units: [unit('여몽'), unit('손책'), unit('대교')] },
      { formation: '기형진', units: [unit('조운'), unit('대교'), unit('손책')] }, [1, 2, 3, 4, 5, 6, 7, 8]);
    let checked = 0;
    for (const ev of evs) {
      const i = ev.findIndex(e => e.e === 'damage' && e.skill === 'u-lü-meng');
      if (i < 0) continue;
      let n = 0;
      for (let j = i; j < ev.length && !(ev[j].e === 'action'); j++) if (ev[j].e === 'damage' && ev[j].skill === 'u-lü-meng') n++;
      expect(n).toBeLessThanOrEqual(2);
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('FIX-018 연소 지속 피해는 턴 시작이 아니라 보유자 행동 차례에 들어간다', () => {
    const logs = [1, 2, 3, 4, 5, 6].map(s => sim.simulate({ formation: '기형진', units: [unit('육손'), unit('주유'), unit('제갈량')] } as any,
      { formation: '기형진', units: [unit('손책'), unit('대교'), unit('조운')] } as any, { seed: s }).log);
    let seen = 0;
    for (const log of logs) {
      let ordered = false;
      for (const line of log) {
        if (/행동 순서 판단 완료/.test(line)) ordered = true;
        if (/── \d+번째 턴 ──/.test(line)) ordered = false;
        if (/「연소」 \d스택으로 병력이/.test(line)) { expect(ordered).toBe(true); seen++; }
      }
    }
    expect(seen).toBeGreaterThan(0);
  });
});
