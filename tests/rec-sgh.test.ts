// 녹화 '손견·관우·황충 vs 대교·손책·견희' (2026-10-06) — FIX-022
import { describe, it, expect } from 'vitest';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { Simulator } from '../packages/engine/src/index.ts';

const bundle: any = buildBundle();
const sim = new Simulator(bundle);
const gen = (n: string) => bundle.generals.find((g: any) => g.name.ko === n);
const unit = (n: string, skillIds: string[] = []) => ({ generalId: gen(n).id, skillIds, manualId: 'none' });
const ally = { formation: '기형진', units: [unit('손견', ['gate-halberd', 'pursue-remnants']), unit('관우', ['charge-change', 'ambushes']), unit('황충', ['ready', 'sweep-army'])] } as any;
const foe = { formation: '일자진', units: [unit('대교'), unit('손책'), unit('견희')] } as any;
const runs = (n: number) => Array.from({ length: n }, (_, i) => sim.simulate(ally, foe, { seed: i + 1, trace: true }).trace as any[]);

describe('녹화 2026-10-06 (손견·관우·황충)', () => {
  it('탈주병 = 1.49 × 관우 무력 (녹화 334.72 → 500, 324.72 → 479)', () => {
    let seen = 0;
    for (let seed = 1; seed <= 30; seed++) {
      for (const line of sim.simulate(ally, foe, { seed }).log) {
        const m = line.match(/탈주병」을\(를\) 생성해 병력이 (\d+)\(\d+\) 손실됐습니다\. \(관우의 무력 ([\d.]+) 기준/);
        if (!m) continue;
        expect(Math.abs(+m[1] - 1.49 * +m[2])).toBeLessThanOrEqual(1);
        seen++;
      }
    }
    expect(seen).toBeGreaterThan(0);
  });
  it('전장 평정: 디버프를 가진 적이 여럿이면 180% 피해가 여럿에게 (한 번 발동에 2명 이상 피격이 나온다)', () => {
    let multi = false;
    for (const ev of runs(30)) {
      const hits = ev.filter(e => e.e === 'damage' && e.skill === 'u-huang-zhong');
      const byTurn: Record<string, Set<string>> = {};
      for (const h of hits) (byTurn[h.turn ?? 0] = byTurn[h.turn ?? 0] || new Set()).add(h.dst);
      if (Object.values(byTurn).some(s => s.size >= 2)) multi = true;
    }
    expect(multi).toBe(true);
  });
  it('강동 제패: "자신과 랜덤 아군" 회복이 손책 자신에게 두 번 들어갈 수 있다', () => {
    const own = { formation: '기형진', units: [unit('손책'), unit('대교'), unit('견희')] } as any;
    let twice = false;
    for (let s = 1; s <= 40 && !twice; s++) {
      const ev = sim.simulate(own, ally, { seed: s, trace: true }).trace as any[];
      for (let i = 1; i < ev.length; i++) if (ev[i].e === 'heal' && ev[i - 1].e === 'heal' && ev[i].skill === 'u-sun-ce' && ev[i - 1].skill === 'u-sun-ce' && ev[i].dst === ev[i - 1].dst && ev[i].dst === ev[i].src) twice = true;
    }
    expect(twice).toBe(true);
  });
});
