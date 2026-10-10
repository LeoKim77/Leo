// 한국판 원문(엑셀)만 보고 "이 전법은 이렇게 동작해야 한다"를 뽑는다.
// 엔진이 쓰는 v1.12b 해석과 독립된 기준(오라클)이라서, 둘이 다르면 감사에서 드러난다.
// 확신이 없는 항목은 비워 둔다(= 검사 생략). 잘못된 경고보다 생략이 낫다.
import type { Skill } from '@cheonha/engine';

export type Timing = 'battleStart' | 'turnStart' | 'turnEnd' | 'action' | 'pursuit' | 'event' | 'unknown';

export interface Expectation {
  skillId: string;
  kind: string;
  procRate: number | null;
  timing: Timing;
  timingEvidence?: string;
  /** 원문에 함께 적힌 다른 반복 시점 ("턴 시작 시 … 턴 종료 시 …") */
  alsoTimings?: Timing[];
  /** 특정 턴에만 발동 (예: 2번째와 4번째 턴) */
  onlyTurns?: number[];
  fromTurn?: number;
  parity?: 'odd' | 'even';
  prepTurns?: number;
  damageTypes: Array<'병기' | '책략'>;
  heals: boolean;
  statuses: string[];
  /** 피해 대상 수 (전법에 피해 절이 하나뿐일 때만) */
  damageTargets?: number | 'all';
  perTurnLimit?: number;
  /** "이 효과는 매 턴 최대 N회" — 상한이 앞 절에만 걸림 */
  perTurnLimitScoped?: boolean;
  conditional: boolean;
}

export const KNOWN_STATUSES = ['공포', '무장 해제', '침묵', '혼란', '조롱', '허약', '군량 고갈', '홍수', '화공', '폭풍', '짐독', '방어', '정신 회복', '백발백중', '시해', '위협', '요술'];
const normStatus = (s: string) => (s === '무장해제' ? '무장 해제' : s);

function firstMatch(text: string, pats: Array<[Timing, RegExp]>): [Timing, string] | null {
  let best: [Timing, string, number] | null = null;
  for (const [t, re] of pats) {
    const m = text.match(re);
    if (m && m.index != null && (!best || m.index < best[2])) best = [t, m[0], m.index];
  }
  return best ? [best[0], best[1]] : null;
}

export function deriveExpectation(skill: Skill): Expectation {
  const text = skill.text || '';
  const kind = String(skill.kind);
  const exp: Expectation = {
    skillId: skill.id, kind, procRate: skill.procRate, timing: 'unknown',
    damageTypes: [], heals: false, statuses: [], conditional: /경우|면,|이면|확률로|보유한|받으면|받은 후|준 후/.test(text),
  };

  // ---- 발동 시점 ----
  if (kind === '액티브') exp.timing = 'action';
  else if (kind === '추격') exp.timing = 'pursuit';
  else {
    const hit = firstMatch(text, [
      ['battleStart', /전투 시작\s*(?:시|후)/],
      ['turnStart', /턴\s*시작\s*시/],
      ['turnEnd', /턴\s*종료\s*시/],
      ['action', /행동\s*(?:시|전|후)|일반 공격\s*(?:전|후)/],
      ['event', /피해를\s*(?:받으면|받은\s*후|받을\s*때|준\s*후)|부여\s*후|획득\s*후|발동\s*(?:성공\s*)?후/],
    ]);
    if (hit) { exp.timing = hit[0]; exp.timingEvidence = hit[1]; }
    const also: Timing[] = [];
    if (/턴\s*시작\s*시/.test(text)) also.push('turnStart');
    if (/턴\s*종료\s*시/.test(text)) also.push('turnEnd');
    if (/행동\s*(?:시|전|후)|행동 종료 시/.test(text)) also.push('action');
    exp.alsoTimings = also.filter(t => t !== exp.timing);
    // 첫 절에 시점 문구가 없으면 "상시 효과"(포진 때 적용) — 예: "자신의 회유가 30% 증가하며, 일반 공격 후 …"
    const firstClause = text.split(/[,.]/)[0];
    if (hit && !/시\b|시,|후|전|때|마다|턴/.test(firstClause) && text.indexOf(hit[1]) > firstClause.length) {
      exp.timing = 'battleStart'; exp.timingEvidence = `상시 효과: ${firstClause.slice(0, 20)}`;
    }
  }

  // ---- 특정 턴 ----
  const turnList = text.match(/^(\d+)번째(?:와|,)?\s*(?:(\d+)번째)?\s*턴/);
  if (turnList) exp.onlyTurns = [turnList[1], turnList[2]].filter(Boolean).map(Number);
  const from = text.match(/^(\d+)번째 턴부터/);
  if (from) { exp.fromTurn = +from[1]; exp.onlyTurns = undefined; }
  if (/^홀수 턴/.test(text)) exp.parity = 'odd';
  if (/^짝수 턴/.test(text)) exp.parity = 'even';
  const prep = text.match(/(\d+)턴 동안 준비/);
  if (prep && !/첫 턴 발동 시 준비할 필요 없/.test(text)) exp.prepTurns = +prep[1];

  // ---- 효과 ----
  // "피해를 주면 / 준 후" 는 발동 조건이지 효과가 아니다
  const GIVE = '피해를\\s*(?:준(?!\\s*(?:후|뒤|경우))|주(?:며|고|는다)|줍니다|입힌다|입히며|가한다)';
  if (new RegExp(`병기(?:와 책략)? ${GIVE}`).test(text) || /병기 피해를 (?:\d|각)/.test(text)) exp.damageTypes.push('병기');
  if (new RegExp(`(?:병기와 )?책략 ${GIVE}`).test(text) || new RegExp(`책략과 병기 ${GIVE}`).test(text)) exp.damageTypes.push('책략');
  if (new RegExp(`책략과 병기 ${GIVE}`).test(text) && !exp.damageTypes.includes('병기')) exp.damageTypes.push('병기');
  exp.heals = /회복(?:한다|하며|하고|시킨다|시키며|합니다)|치유율/.test(text) && !/받는 (?:회복|치유)/.test(text.replace(/치유율[^)]*\)/g, ''));
  const st = new Set<string>();
  for (const s of [...KNOWN_STATUSES, '무장해제']) {
    const re = new RegExp(`${s}(?:을|를|이|가)?(?:\\(를\\)|\\(가\\))?\\s*(?:부여|획득|상태가 된다|1스택|\\d스택)(?!\\s*(?:후|하면|할 때))`);
    if (re.test(text) || new RegExp(`지속되는\\s*${s}`).test(text)) st.add(normStatus(s));
  }
  exp.statuses = [...st];

  // ---- 피해 대상 수 ----
  // 원문 전체에 '피해를 준다'가 한 번뿐이고, 다단·개수 비례 표현이 없을 때만 판정한다.
  const dmgPhrases = text.match(/피해를\s*(?:준|주)/g) || [];
  // 다단 타격("4회 발동된다", "총 5회 시전")·개수 비례만 생략. "매 턴 최대 4회 발동" 같은 상한은 다단이 아니다
  const multiHit = /(?<!최대\s?)(?<!총\s?)\d+회\s*(?:발동된다|발동한다|시전)|총\s*\d+회\s*시전|1명\s*당|명당|각각/.test(text);
  if (dmgPhrases.length === 1 && !multiHit) {
    const full = text.slice(0, text.search(/피해를\s*(?:준|주)/));
    // 대상 표현은 같은 절(쉼표·마침표 뒤)에서만 찾는다 — 앞 절의 "우군 단일 목표" 를 피해 대상으로 잘못 읽지 않게 (폐월)
    //   단, 그 절에 '~에게' 대상이 없으면 앞 절의 대상을 이어받는다 ("적군 전체에게 홍수를 부여하고, 260% 피해" — 칠군수몰)
    const cut = Math.max(full.lastIndexOf(', '), full.lastIndexOf('. '), full.lastIndexOf('며 '));
    const clause = cut >= 0 ? full.slice(cut + 1) : full;
    const before = /에게/.test(clause) ? clause : full;
    // 피해 문구 바로 앞에서 가장 가까운 대상 표현을 쓴다 ("전체 적군과 우군이 … 랜덤 적군 2명에게 … 피해" → 2명)
    const cands: Array<[number, number | 'all']> = [];
    for (const m of before.matchAll(/전체 적군|적군 전체/g)) cands.push([m.index!, 'all']);
    for (const m of before.matchAll(/단일 목표|적군\s*1명/g)) cands.push([m.index!, 1]);
    for (const m of before.matchAll(/적군\s*(\d)명/g)) cands.push([m.index!, +m[1]]);
    cands.sort((a, b) => b[0] - a[0]);
    if (cands.length && before.length - cands[0][0] < 60) exp.damageTargets = cands[0][1];
  }

  const lim = text.match(/(?:매 턴|턴마다)\s*최대\s*(\d+)회|매 턴\s*(\d+)회\s*발동될 수/);
  if (lim) exp.perTurnLimit = +(lim[1] || lim[2]);
  if (lim && /이 효과는\s*(?:매 턴|턴마다)\s*최대/.test(text)) exp.perTurnLimitScoped = true;
  return exp;
}
