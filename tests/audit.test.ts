import { describe, it, expect } from 'vitest';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { runAudit, deriveExpectation } from '../packages/audit/src/index.ts';

const bundle = buildBundle();
const byName = (n: string) => bundle.skills.find(s => s.name.ko === n)!;

describe('감사 — 원문 해석(오라클)', () => {
  it('시점·대상·효과를 원문에서 뽑는다', () => {
    const e = deriveExpectation(byName('보급 차단'));
    expect(e.timing).toBe('turnStart');
    expect(e.damageTypes).toContain('책략');
    expect(e.statuses).toContain('군량 고갈');
    expect(deriveExpectation(byName('칠군수몰')).damageTargets).toBe('all');
    expect(deriveExpectation(byName('칠군수몰')).prepTurns).toBe(1);
    expect(deriveExpectation(byName('기지의 승리')).damageTargets).toBe(2);
    expect(deriveExpectation(byName('퇴로 매복')).damageTargets).toBeUndefined(); // 다단 → 판정 생략
  });
});

describe('감사 — 실행', () => {
  const report = runAudit(bundle, { tierSeeds: 3, extraSeeds: 4 });
  it('엔진 규칙 위반이 없다 (규칙 확인 필요 경고는 허용)', () => {
    for (const r of report.engineRules) expect(r.level, `${r.title}: ${r.message}`).not.toBe('fail');
  });
  it('수정한 전법들의 대상 수가 원문과 맞다', () => {
    for (const n of ['칠군수몰', '문과 무', '방화범']) {
      const s = report.skills.find(x => x.name === n)!;
      const c = s.checks.find(c => c.rule === 'D06-targets');
      if (c) expect(c.level, `${n}: ${c.message}`).toBe('pass');
    }
  });
});
