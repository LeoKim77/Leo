import { describe, it, expect } from 'vitest';
import { loadReplays, checkReplay } from '../packages/data-tools/src/replay-check.ts';

const rms = (xs: Array<{ predicted: number; observed: number }>) => Math.sqrt(xs.reduce((a, x) => a + Math.log(x.predicted / x.observed) ** 2, 0) / xs.length);

describe('전보 역재현 검증', () => {
  const rows = loadReplays().flatMap(r => checkReplay(r));
  it('병기 피해: 녹화 표본 전체 RMS 오차 15% 이내 (2026-10-03 재추정 13.6%)', () => {
    const dmg = rows.filter(x => x.kind === 'damage' && x.label.includes('병기'));
    expect(dmg.length).toBeGreaterThanOrEqual(25);
    expect(rms(dmg)).toBeLessThan(0.15);
  });
  it('책략 피해: RMS 오차 10% 이내 (재추정 7.3%)', () => {
    const dmg = rows.filter(x => x.kind === 'damage' && x.label.includes('책략'));
    expect(dmg.length).toBeGreaterThanOrEqual(5);
    expect(rms(dmg)).toBeLessThan(0.1);
  });
});
