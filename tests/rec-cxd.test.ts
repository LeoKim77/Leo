// 녹화 2026-10-10 조조·소교·등애 vs 등애·이유·우금 (녹화 계획 3판, 회복·회유 판)
//   FIX-027 회유 받는 치유 제외·올림·회복 계기 · FIX-028 받는 피해 증가 체감 · FIX-029 "지력과 통솔" 회복 · FEAT-032 맹덕신서 조조 지력
import { describe, it, expect } from 'vitest';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { Simulator } from '../packages/engine/src/index.ts';
import { loadReplays, checkReplay } from '../packages/data-tools/src/replay-check.ts';

const bundle: any = buildBundle();
const sim = new Simulator(bundle);
const E: any = (sim as any).engine;
const gid = (n: string) => bundle.generals.find((g: any) => g.name.ko === n).id;
const U = (n: string, s: string[] = [], m = 'none') => ({ generalId: gid(n), skillIds: s, manualId: m });
const mk = (n: string, side = 'A') => (sim.buildArmy({ formation: '기형진', units: [{ generalId: gid(n), skillIds: [] }] } as any, side)[0]) as any;

describe('녹화 3판(조조·소교·등애)', () => {
  const rows = checkReplay(loadReplays().find(r => r.id === '2026-10-10-caocao-xiaoqiao-dengai')!);
  it('FIX-029 난세의 간웅-호·전력 지원 회복이 실측과 5% 안 (예전 +8~14%)', () => {
    const h = rows.filter(x => x.kind === 'heal' && /난세|전력 지원/.test(x.label));
    expect(h.length).toBe(9);
    for (const x of h) expect(Math.abs(x.errPct)).toBeLessThan(0.05);
  });
  it('둔전령(지력의 영향) 회복은 그대로 7% 안', () => {
    for (const x of rows.filter(x => x.kind === 'heal' && /둔전령/.test(x.label))) expect(Math.abs(x.errPct)).toBeLessThan(0.07);
  });
  it('FIX-027 회유: 받는 치유 효과 제외, 군량 고갈 ×0.3, 올림', () => {
    const a = mk('등애'), d = mk('이유', 'B');
    a.mods.회유 = 0.1087; a.mods.받는회복량 = 0.2; a.troops = 9000;
    const log: string[] = [];
    E.setRng(() => 0.999);
    const { dmg } = E.dealDamage(a, d, 1, '병기', (sim as any).coeffs, log, [a, d], 2, null, true);
    E.setRng(Math.random);
    const healed = +log.find(l => /병력을 \d+\(/.test(l) && l.includes('[등애]'))!.match(/병력을 (\d+)/)![1];
    expect(healed).toBe(Math.ceil(dmg * 0.1087 - 1e-9));   // 받는 치유 +20% 는 곱하지 않음
  });
  it('FIX-027 관문은 회복이 0 이어도(만병력) 회유·회복 효과 뒤에 발동', () => {
    let hit = false;
    for (let seed = 1; seed < 40 && !hit; seed++) {
      const r = sim.simulate({ formation: '기형진', units: [U('조조', ['same-boat']), U('소교', [], 'm-xiao-qiao-1'), U('등애')] } as any,
        { formation: '일자진', units: [U('이유'), U('우금'), U('견희')] } as any, { seed });
      hit = r.log.some((l: string) => /관문/.test(l) && /손실/.test(l));
    }
    expect(hit).toBe(true);
  });
  it('FIX-028 받는 피해 증가는 기존 증가분만큼 체감 (15.23% 위 위협 10% → 8.48%)', () => {
    const caster = mk('우금', 'B'), t = mk('조조');
    const all = [caster, t];
    const sk = (eff: any) => ({ id: 't-' + Math.random(), name: '시험', type: '액티브', effects: { damage: [], heal: [], buffs: [], statMods: [], statusEffects: [], targets: [], ...eff } });
    E.applySkillEffects(caster, sk({ buffs: [{ stat: '받는피해', min: 0.1523, max: 0.1523, target: 'all_enemy', duration: 2 }] }), all, (sim as any).coeffs, [], 1, {});
    E.applySkillEffects(caster, sk({ statusEffects: [{ name: '위협', target: 'all_enemy', duration: 2 }] }), all, (sim as any).coeffs, [], 1, {});
    expect(E.accumStatus(t, 'inDamageAdd', 'add')).toBeCloseTo(0.10 * (1 - 0.1523), 3);
  });
});
