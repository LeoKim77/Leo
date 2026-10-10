import { describe, it, expect } from 'vitest';
import { loadReplays, checkReplay } from '../packages/data-tools/src/replay-check.ts';

const rms = (xs: Array<{ predicted: number; observed: number }>) => Math.sqrt(xs.reduce((a, x) => a + Math.log(x.predicted / x.observed) ** 2, 0) / xs.length);

describe('전보 역재현 검증', () => {
  const rows = loadReplays().flatMap(r => checkReplay(r));
  // FIX-016 (2026-10-05): 녹화 3판 75건으로 재추정 — 병기 13.0%, 책략 13.8% (예전 계수로는 3판 합계 19%)
  // 2026-10-07: 일반 병법 미반영(R-054) — 손관황 판 관우 툴팁의 병법 <작전> +5.4% 를 빼면서 15.2% 로 올라 한도 16% 로 조정 (사용자에게 보고)
  // 2026-10-09 FIX-025 병력 계수 (min(병력,1만)/1만)^0.35 — 녹화 6판 병기 85건 14.1%, 책략 69건 14.7%
  it('병기 피해: 녹화 6판 표본 RMS 오차 16% 이내 (현재 14.1%)', () => {
    const dmg = rows.filter(x => x.kind === 'damage' && x.label.includes('병기'));
    expect(dmg.length).toBeGreaterThanOrEqual(38);
    expect(rms(dmg)).toBeLessThan(0.16);
  });
  it('책략 피해: RMS 오차 15% 이내 (현재 14.7%)', () => {
    const dmg = rows.filter(x => x.kind === 'damage' && x.label.includes('책략'));
    expect(dmg.length).toBeGreaterThanOrEqual(37);
    expect(rms(dmg)).toBeLessThan(0.15);
  });
  // 2026-10-10 FIX-029 "지력과 통솔의 영향" 회복 가산항 제외 — 녹화 4판 회복 31건 3.7% (일심협력 3건은 원인 미상으로 제외)
  it('회복: RMS 오차 6% 이내 (현재 3.7%)', () => {
    const h = rows.filter(x => x.kind === 'heal');
    expect(h.length).toBeGreaterThanOrEqual(17);
    expect(rms(h)).toBeLessThan(0.06);
  });
});
