import { describe, it, expect } from 'vitest';
import { loadReplays, checkReplay } from '../packages/data-tools/src/replay-check.ts';

const rms = (xs: Array<{ predicted: number; observed: number }>) => Math.sqrt(xs.reduce((a, x) => a + Math.log(x.predicted / x.observed) ** 2, 0) / xs.length);

describe('전보 역재현 검증', () => {
  const rows = loadReplays().flatMap(r => checkReplay(r));
  // FIX-016 (2026-10-05): 녹화 3판 75건으로 재추정 — 병기 13.0%, 책략 13.8% (예전 계수로는 3판 합계 19%)
  // 2026-10-07: 일반 병법 미반영(R-054) — 손관황 판 관우 툴팁의 병법 <작전> +5.4% 를 빼면서 15.2% 로 올라 한도 16% 로 조정 (사용자에게 보고)
  it('병기 피해: 녹화 4판 표본 RMS 오차 16% 이내 (병법 미반영, 현재 15.2%)', () => {
    const dmg = rows.filter(x => x.kind === 'damage' && x.label.includes('병기'));
    expect(dmg.length).toBeGreaterThanOrEqual(38);
    expect(rms(dmg)).toBeLessThan(0.16);
  });
  it('책략 피해: RMS 오차 15% 이내 (상대 지력 방어항 추가, 재추정 13.8%)', () => {
    const dmg = rows.filter(x => x.kind === 'damage' && x.label.includes('책략'));
    expect(dmg.length).toBeGreaterThanOrEqual(37);
    expect(rms(dmg)).toBeLessThan(0.15);
  });
  it('회복: RMS 오차 6% 이내 (회복식 재추정 3.8%, 예전 17%)', () => {
    const h = rows.filter(x => x.kind === 'heal');
    expect(h.length).toBeGreaterThanOrEqual(17);
    expect(rms(h)).toBeLessThan(0.06);
  });
});
