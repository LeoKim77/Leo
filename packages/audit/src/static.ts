// 정적 감사: 전투를 돌리지 않고 데이터만 비교한다.
import type { GameBundle, Skill, General } from '@cheonha/engine';
import { deriveExpectation, type Expectation } from './expect.ts';
import { RULE_TITLES, type CheckResult, type Level } from './report.ts';

const chk = (rule: string, level: Level, message: string, evidence?: string[]): CheckResult => ({ rule, title: RULE_TITLES[rule] || rule, level, message, evidence });

/** 원문의 % 수치 집합. "9→18" 같은 범위는 최고 레벨(오른쪽) 값만 쓴다 */
export function percentNumbers(text: string): number[] {
  const out: number[] = [];
  const cleaned = text.replace(/([\d.]+)%?\s*→\s*([\d.]+)%/g, '$2%');
  for (const m of cleaned.matchAll(/([\d.]+)\s*%/g)) out.push(+parseFloat(m[1]).toFixed(2));
  return out;
}

export function staticSkillChecks(skill: Skill, bundle: GameBundle, engineTiming?: (s: any) => string): { checks: CheckResult[]; exp: Expectation } {
  const exp = deriveExpectation(skill);
  const eng = skill.engine as any;
  const checks: CheckResult[] = [];

  // S01
  if (!eng) checks.push(chk('S01-engine-def', 'fail', '엔진 효과 정의가 없습니다. 전투에서 이 전법은 아무 효과도 내지 않습니다.'));
  else checks.push(chk('S01-engine-def', 'pass', 'v1.12b 효과 정의 연결됨'));

  // S02
  if (eng?.legacyType) {
    checks.push(eng.legacyType === skill.kind
      ? chk('S02-kind', 'pass', `${skill.kind}`)
      : chk('S02-kind', 'fail', `원문 유형 ${skill.kind} ↔ 엔진 ${eng.legacyType}`));
  }

  // S03
  if (eng?.legacyProcRate && skill.procRate != null) {
    const nums = String(eng.legacyProcRate).match(/[\d.]+(?=%)/g)?.map(Number) || [];
    const legacyMax = nums.length ? nums[nums.length - 1] / 100 : null;
    if (legacyMax != null) {
      const same = Math.abs(legacyMax - skill.procRate) < 0.001;
      checks.push(same ? chk('S03-proc-rate', 'pass', `${(skill.procRate * 100).toFixed(1)}%`)
        : chk('S03-proc-rate', 'warn', `원문 ${(skill.procRate * 100).toFixed(1)}% ↔ v1.12b ${(legacyMax * 100).toFixed(1)}% — 한국판 값으로 시뮬합니다.`));
    }
  }

  // S04 — 원문 수치가 바뀌었는지 (밸런스 조정·번역 차이 감지)
  if (eng?.raw) {
    const a = percentNumbers(skill.text), b = percentNumbers(String(eng.raw));
    const onlyKr = a.filter(x => !b.includes(x));
    const onlyLegacy = b.filter(x => !a.includes(x));
    if (!onlyKr.length && !onlyLegacy.length) checks.push(chk('S04-numbers', 'pass', '원문 % 수치 일치'));
    else checks.push(chk('S04-numbers', 'warn', '한국판 원문과 엔진이 쓰는 원문의 수치가 다릅니다. 엔진 효과값 재확인 필요.', [
      `한국판에만: ${onlyKr.join(', ') || '-'}`, `엔진 원문에만: ${onlyLegacy.join(', ') || '-'}`,
      `한국판: ${skill.text}`, `엔진 원문: ${eng.raw}`,
    ]));
  }

  // S05
  const total = skill.clauses.length || 1;
  const missing = skill.clauses.filter(c => c.status === 'missing');
  const ok = skill.clauses.filter(c => c.status === 'ok').length;
  const ratio = ok / total;
  checks.push(chk('S05-coverage', missing.length === 0 ? 'pass' : ratio >= 0.5 ? 'warn' : 'fail',
    `반영 ${ok}/${skill.clauses.length}절 · 미반영 ${missing.length}절`, missing.map(c => `미반영: ${c.text}`)));

  // S06 — 지휘·패시브의 시점 해석을 엔진과 비교
  if (eng && engineTiming && (skill.kind === '지휘' || skill.kind === '패시브') && exp.timing !== 'unknown') {
    const et = engineTiming(eng);
    const map: Record<string, string> = { battleStart: 'battleStart', turnStart: 'turnStart', turnEnd: 'turnEnd', action: 'action', event: 'trigger' };
    const want = map[exp.timing];
    if (et === want) checks.push(chk('S06-timing', 'pass', `${exp.timing} (${exp.timingEvidence})`));
    else checks.push(chk('S06-timing', 'warn', `원문 기준 '${exp.timingEvidence}' → ${exp.timing}, 엔진 해석 → ${et}`));
  }

  // S07 — 해외 표기 사용 여부
  const bad = bundle.termMap.filter(t => t.from !== t.to && (t as any).autoReplace !== false && (skill.text.includes(t.from) || (skill.trait || '') === t.from));
  checks.push(bad.length ? chk('S07-terms', 'warn', `해외 표기 발견: ${bad.map(t => `${t.from}→${t.to}`).join(', ')}`)
    : chk('S07-terms', 'pass', '한국판 용어'));

  // S08
  if (skill.isUnique) {
    const owner = bundle.generals.find(g => g.id === skill.ownerGeneralId);
    checks.push(owner && owner.uniqueSkillId === skill.id ? chk('S08-owner', 'pass', owner.name.ko) : chk('S08-owner', 'fail', '소유 무장 연결이 끊겼습니다.'));
  }
  return { checks, exp };
}

export function staticGeneralChecks(g: General, bundle: GameBundle): CheckResult[] {
  const out: CheckResult[] = [];
  const keys = ['무력', '지력', '통솔', '선공'] as const;
  const miss = keys.filter(k => g.stats[k] == null);
  out.push(miss.length ? chk('G01-stats', 'fail', `스탯 없음: ${miss.join(', ')}`) : chk('G01-stats', 'pass', keys.map(k => `${k} ${g.stats[k]}`).join(' · ')));
  const u = bundle.skills.find(s => s.id === g.uniqueSkillId);
  out.push(!u ? chk('G02-unique', 'fail', '고유 전법 없음') : (u.engine ? chk('G02-unique', 'pass', u.name.ko) : chk('G02-unique', 'fail', `${u.name.ko} — 엔진 정의 없음`)));
  return out;
}
