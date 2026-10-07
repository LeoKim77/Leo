// 시즌3 미리보기 반영 (2026-10-07) — R-058 동일 인물, FEAT-029 성운 대열(진형 보너스·기국 버프)
import { describe, it, expect } from 'vitest';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { Simulator } from '../packages/engine/src/index.ts';
import { Recommender } from '../packages/recommender/src/index.ts';

const bundle: any = buildBundle();
const sim = new Simulator(bundle);
const gen = (n: string) => bundle.generals.find((g: any) => g.name.ko === n);
const U = (n: string, s: string[] = []) => ({ generalId: gen(n).id, skillIds: s, manualId: 'none' });
const foe = { formation: '일자진', units: [U('대교'), U('손책'), U('견희')] } as any;
const prep = (formation: string) => sim.simulate({ formation, units: [U('SP 제갈량'), U('관우'), U('황충')] } as any, foe, { seed: 1 }).log.filter((l: string) => l.startsWith('0턴'));

describe('시즌3 미리보기', () => {
  it('50레벨 환산 = 5레벨 + 45×성장 (SP 제갈량 지력 125+45×3.00 = 260)', () => {
    expect(gen('SP 제갈량').stats.지력).toBeCloseTo(260, 2);
    expect(gen('황보숭').stats.통솔).toBeCloseTo(111 + 45 * 2.36, 2);
  });
  it('R-058 SP 제갈량과 제갈량은 한 부대에 함께 출전할 수 없다', () => {
    expect(() => sim.simulate({ formation: '기형진', units: [U('SP 제갈량'), U('제갈량'), U('황충')] } as any, foe, { seed: 1 })).toThrow(/같은 인물/);
  });
  it('R-058 덱 추천에서도 한 부대에 같이 나오지 않는다', () => {
    const rec = new Recommender(bundle);
    const ids = bundle.generals.map((g: any) => g.id);
    const res: any = rec.recommend({ owned: { generals: ids, skills: bundle.skills.map((s: any) => s.id) }, count: 5 } as any);
    for (const d of res.decks || []) {
      const ps = d.units.map((u: any) => bundle.generals.find((g: any) => g.id === u.generalId)?.samePerson || u.generalId);
      expect(new Set(ps).size).toBe(ps.length);
    }
  });
  it('성운 대열: 진형 보너스 증가 + 단일 전열(기형진) 기국 — 전열 받는 피해 감소·피격률 85%', () => {
    const log = prep('기형진');
    expect(log.some(l => /진형 보너스가 [\d.]+% 증가/.test(l))).toBe(true);
    expect(log.some(l => /기국 버프 — 단일 전열/.test(l))).toBe(true);
    expect(log.some(l => /피격률이 85%로 고정/.test(l))).toBe(true);
    // 기형진 전열 받는 피해 6% 가 강화되어 6% 보다 크게 찍힌다
    const m = log.map(l => l.match(/\[SP 제갈량\]의 【받는피해】이\(가\) ([\d.]+)%/)).find(Boolean);
    expect(+m![1]).toBeGreaterThan(6);
  });
  it('이중 전열(안형진)·삼중 전열(일자진) 기국', () => {
    expect(prep('안형진').some(l => /이중 전열/.test(l))).toBe(true);
    expect(prep('일자진').some(l => /삼중 전열/.test(l))).toBe(true);
    let fired = false;
    for (let s = 1; s <= 5 && !fired; s++) fired = sim.simulate({ formation: '안형진', units: [U('SP 제갈량'), U('관우'), U('황충')] } as any, foe, { seed: s }).log.some((l: string) => /기국\(이중 전열\)】 효과로 병력이/.test(l));
    expect(fired).toBe(true);
  });
});

describe('R-061 한국 미출시 시즌3 데이터', () => {
  it('미출시 표시가 붙고, 덱 추천 대체 후보로 나오지 않는다', () => {
    expect(gen('좌자').krRelease).toBe('미출시');
    expect(gen('SP 제갈량').krRelease).toBeUndefined();
    const rec = new Recommender(bundle);
    const owned = bundle.generals.filter((g: any) => g.season !== 'S3' || g.krRelease).map((g: any) => g.id).filter((id: string) => !['zuo-ci', 'jiang-wei'].includes(id));
    const res: any = rec.recommend({ owned: { generals: owned, skills: bundle.skills.map((s: any) => s.id) }, count: 5 } as any);
    for (const d of res.decks) for (const u of d.units) for (const s of u.subs) {
      const to = bundle.generals.find((g: any) => g.name.ko === s.to) || bundle.skills.find((x: any) => x.name.ko === s.to);
      expect(to?.krRelease).toBeUndefined();
    }
  });
  it('시뮬 결과 안내에 한국 미출시가 표시된다', () => {
    const ap = (sim as any).approxIn({ formation: '기형진', units: [U('좌자'), U('관우'), U('황충')] });
    expect(ap.some((x: any) => x.kind === '한국 미출시')).toBe(true);
  });
});
