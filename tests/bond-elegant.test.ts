// 인연 우아한 자태 (FEAT-028) — 사용자 캡처 2026-10-07 + 녹화 2026-10-06
import { describe, it, expect } from 'vitest';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { Simulator } from '../packages/engine/src/index.ts';

const bundle: any = buildBundle();
const sim = new Simulator(bundle);
const gen = (n: string) => bundle.generals.find((g: any) => g.name.ko === n);
const unit = (n: string, skillIds: string[] = []) => ({ generalId: gen(n).id, skillIds, manualId: 'none' });
const ally = { formation: '기형진', units: [unit('손견', ['gate-halberd', 'pursue-remnants']), unit('관우', ['charge-change', 'ambushes']), unit('황충', ['ready', 'sweep-army'])] } as any;
const stackRe = /【인연-우아한 자태】 \[(.+?)\]의 「우아한 자태」이\(가\) (\d+)스택/;

describe('인연 우아한 자태', () => {
  it('멤버에 오국태 포함', () => {
    expect(bundle.bonds.find((b: any) => b.name === '우아한 자태').memberNames).toContain('오국태');
  });
  it('대교·견희가 같은 부대면 피해를 준 적의 최고 속성 −5, 공격자별 5스택까지', () => {
    const foe = { formation: '일자진', units: [unit('대교'), unit('손책'), unit('견희')] } as any;
    let seen = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const log = sim.simulate(ally, foe, { seed }).log;
      log.forEach((line, i) => {
        const m = line.match(stackRe);
        if (!m) return;
        seen++;
        expect(+m[2]).toBeLessThanOrEqual(5);
        expect(log[i + 1]).toMatch(new RegExp(`\\[${m[1]}\\]의 【(무력|지력|통솔|선공)】이\\(가\\) 5\\.00\\(`));
      });
    }
    expect(seen).toBeGreaterThan(0);
  });
  it('멤버가 1명뿐이면 발동하지 않는다', () => {
    const foe = { formation: '일자진', units: [unit('대교'), unit('손책'), unit('손견')] } as any;
    for (let seed = 1; seed <= 10; seed++) expect(sim.simulate(ally, foe, { seed }).log.some(l => stackRe.test(l))).toBe(false);
  });
});
