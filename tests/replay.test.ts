import { describe, it, expect } from 'vitest';
import { loadReplays, checkReplay } from '../packages/data-tools/src/replay-check.ts';

const rms = (xs: Array<{ predicted: number; observed: number }>) => Math.sqrt(xs.reduce((a, x) => a + Math.log(x.predicted / x.observed) ** 2, 0) / xs.length);

describe('전보 역재현 검증', () => {
  const rows = loadReplays().flatMap(r => checkReplay(r));
  it('병기 피해: 녹화 표본 전체 RMS 오차 12% 이내 (2026-10-03 재추정·레벨·승품 보정 8.4%)', () => {
    const dmg = rows.filter(x => x.kind === 'damage' && x.label.includes('병기'));
    expect(dmg.length).toBeGreaterThanOrEqual(23);
    expect(rms(dmg)).toBeLessThan(0.12);
  });
  it('책략 피해: RMS 오차 12% 이내 (재추정 9.4%)', () => {
    const dmg = rows.filter(x => x.kind === 'damage' && x.label.includes('책략'));
    expect(dmg.length).toBeGreaterThanOrEqual(8);
    expect(rms(dmg)).toBeLessThan(0.12);
  });
});
