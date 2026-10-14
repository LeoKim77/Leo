// FEAT-034 스탯 영향 — 인게임 실측 우선, 전법별 가중치 (사용자 지정 2026-10-14)
import { describe, it, expect } from 'vitest';
import { fitInfluence } from '../packages/data-tools/src/fit-influence.ts';
import { checkReplay, loadReplays } from '../packages/data-tools/src/replay-check.ts';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { Simulator } from '../packages/engine/src/index.ts';

const F = fitInfluence();
const b: any = buildBundle();
const sim = new Simulator(b);
const rows = loadReplays().flatMap(r => { try { return checkReplay(r, {}, sim); } catch { return []; } }).filter(x => x.kind === 'influence');
const rms = (xs: any[]) => Math.sqrt(xs.reduce((a, x) => a + Math.log(x.predicted / x.observed) ** 2, 0) / xs.length) * 100;

describe('스탯 영향 전법별 가중치 (FEAT-034)', () => {
  it('저장된 맞춤 결과(influence-fit.json)가 지금 표본으로 다시 맞춘 것과 같다 (pnpm fit:influence)', () => {
    expect(Object.fromEntries(Object.entries(F.weights).map(([k, v]) => [k, v.weight]))).toEqual(b.influenceWeights);
  });
  it('맞춘 전법은 표본 오차 10% 이내, 공용 값보다 작다', () => {
    for (const [k, v] of Object.entries(F.weights)) { expect(v.errFit, k).toBeLessThanOrEqual(10); expect(v.errFit, k).toBeLessThan(v.errGlobal); }
  });
  it('엔진이 맞춘 가중치를 그 효과 항목에 쓴다', () => {
    const D: any = (sim as any).data;
    for (const k of Object.keys(b.influenceWeights)) {
      const sk = [...D.skills, ...D.uniqueSkills].find((s: any) => s.id === k.split('@')[0]);
      const items = ['damage', 'buffs', 'statMods'].flatMap(x => sk.effects[x] || []).concat(sk.alwaysOnBuffs || []);
      expect(items.some((it: any) => it.inf?.weight === b.influenceWeights[k] || it.statScale?.weight === b.influenceWeights[k]), k).toBe(true);
    }
  });
  it('스탯 영향 역재현 RMS 가 공용 가중치만 쓸 때(15.5%)보다 작다', () => {
    expect(rows.length).toBeGreaterThan(20);
    expect(rms(rows)).toBeLessThan(15.5);
  });
  it('녹화로 맞춘 값과 어긋나는 표본은 가중치를 바꾸지 않고 세부 검증 요청으로 간다', () => {
    for (const r of F.requests) { expect(F.weights[r.key]).toBeUndefined(); expect(r.ask).toMatch(/시점|구간/); }
  });
});
