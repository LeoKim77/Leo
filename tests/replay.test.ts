import { describe, it, expect } from 'vitest';
import { loadReplays, checkReplay } from '../packages/data-tools/src/replay-check.ts';

describe('전보 역재현 검증', () => {
  it('녹화 표본의 피해를 툴팁 스탯 그대로 다시 계산한다 (병기 공식 오차 ±8% 이내)', () => {
    const rows = loadReplays().flatMap(r => checkReplay(r));
    const dmg = rows.filter(x => x.kind === 'damage');
    expect(dmg.length).toBeGreaterThan(0);
    for (const x of dmg) expect(Math.abs(x.errPct)).toBeLessThan(0.08);
  });
});
