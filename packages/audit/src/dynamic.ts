// 동적 감사: 실제로 전투를 돌려 구조화 기록(trace)을 모으고, 원문 기대치와 대조한다.
import type { Simulator, TraceEvent, DeckSpec, GameBundle } from '@cheonha/engine';
import type { Expectation } from './expect.ts';
import { RULE_TITLES, type CheckResult, type Level } from './report.ts';

const chk = (rule: string, level: Level, message: string, evidence?: string[]): CheckResult => ({ rule, title: RULE_TITLES[rule] || rule, level, message, evidence });

export interface SkillEvidence {
  battles: number;
  fired: number;
  firedByPhase: Record<string, number>;
  firedByTurn: Record<number, number>;
  slotByPhase: Record<string, number>;
  slotByTurn: Record<number, number>;
  rolls: number;
  rollOk: number;
  rollPSum: number;
  rollPMin: number;
  damage: Record<string, number>;
  heals: number;
  statuses: Record<string, number>;
  targetChecks: { ok: number; bad: number; examples: string[] };
  maxPerTurn: number;
  phaseExamples: string[];
}

function emptyEvidence(): SkillEvidence {
  return { battles: 0, fired: 0, firedByPhase: {}, firedByTurn: {}, slotByPhase: {}, slotByTurn: {}, rolls: 0, rollOk: 0, rollPSum: 0, rollPMin: 1, damage: {}, heals: 0, statuses: {}, targetChecks: { ok: 0, bad: 0, examples: [] }, maxPerTurn: 0, phaseExamples: [] };
}

export interface EngineRuleTally { checked: number; violations: number; examples: string[]; soft?: number; softExamples?: string[] }
export type EngineRules = Record<'E01-silence' | 'E02-disarm' | 'E03-pursuit' | 'E04-one-roll' | 'E05-dead', EngineRuleTally>;

export class EvidenceCollector {
  readonly bySkill = new Map<string, SkillEvidence>();
  readonly engineRules: EngineRules = {
    'E01-silence': { checked: 0, violations: 0, examples: [] },
    'E02-disarm': { checked: 0, violations: 0, examples: [] },
    'E03-pursuit': { checked: 0, violations: 0, examples: [] },
    'E04-one-roll': { checked: 0, violations: 0, examples: [] },
    'E05-dead': { checked: 0, violations: 0, examples: [] },
  };
  battles = 0;

  /**
   * blockBasic / blockActive: 일반 공격·액티브를 막는 상태 — 엔진이 아니라 한국판 용어 시트에서 뽑는다
   * (예: 무장 해제 = "일반 공격 발동 불가")
   */
  constructor(private expectations: Map<string, Expectation>, private rules: { blockBasic: string[]; blockActive: string[] }) {}

  private ev(rawId: string) {
    // "전법id#2" 처럼 딸린 효과는 원래 전법으로 합산한다 (금병법 m-…#n 도 마찬가지)
    const id = rawId.split('#')[0];
    let e = this.bySkill.get(id);
    if (!e) { e = emptyEvidence(); this.bySkill.set(id, e); }
    return e;
  }

  private softViolate(rule: keyof EngineRules, msg: string) {
    const r = this.engineRules[rule];
    r.soft = (r.soft || 0) + 1;
    r.softExamples = r.softExamples || [];
    if (r.softExamples.length < 5) r.softExamples.push(msg);
  }

  private violate(rule: keyof EngineRules, msg: string) {
    const r = this.engineRules[rule];
    r.violations++;
    if (r.examples.length < 5) r.examples.push(msg);
  }

  /** 전투 한 판의 trace 를 소화한다 */
  ingest(trace: TraceEvent[], label = '') {
    this.battles++;
    const battle = trace.find(t => t.e === 'battle') as any;
    if (!battle) return;
    const units: Array<{ id: string; side: string; name: string; skills: string[] }> = battle.units;
    const nameOf = (id: string) => units.find(u => u.id === id)?.name || id;
    const sideOf = (id: string) => units.find(u => u.id === id)?.side;
    const present = new Set(units.flatMap(u => u.skills.map(s => s.split('#')[0])));
    present.forEach(id => { this.ev(id).battles++; });

    const dead = new Set<string>();
    const curStatuses = new Map<string, string[]>(); // 행동 시작 시점의 상태
    const basicThisTurn = new Set<string>(); // `${turn}:${unit}`
    const basicDamageThisTurn = new Set<string>(); // 일반 공격 판정 피해(전법 속 일반 공격 포함)
    const firesPerTurn = new Map<string, number>(); // `${skill}:${unit}:${turn}`
    const rollsPerTurn = new Map<string, number>();
    const invInfo = new Map<number, { skill: string; unit: string; turn: number; aliveEnemies: number; dsts: Set<string> }>();

    for (const t of trace) {
      const turnKey = (u: string) => `${t.turn}:${u}`;
      switch (t.e) {
        case 'action': {
          const u = t.unit as string;
          curStatuses.set(u, (t.statuses as string[]) || []);
          this.engineRules['E05-dead'].checked++;
          if (dead.has(u)) this.violate('E05-dead', `${label} ${t.turn}턴: 전사한 [${nameOf(u)}]이(가) 행동`);
          break;
        }
        case 'basic': {
          const u = t.unit as string;
          basicThisTurn.add(turnKey(u));
          // 공격 시점의 상태 (행동 중 해제된 디버프는 반영) — 없으면 행동 시작 시점 상태
          const st = (t.statuses as string[] | undefined) || curStatuses.get(u) || [];
          this.engineRules['E02-disarm'].checked++;
          if (!st.includes('정신 회복') && st.some(s => this.rules.blockBasic.includes(s)) && t.phase === 'basic') {
            // 상태가 행동 중에 풀렸을 수 있어 action 시점 상태만으로 판단 — 같은 행동 안에서만 본다
            this.violate('E02-disarm', `${label} ${t.turn}턴: [${nameOf(u)}] ${st.join('/')} 상태에서 일반 공격`);
          }
          break;
        }
        case 'roll': {
          const id = t.skill as string;
          const e = this.ev(id);
          if (t.kind === '액티브' || t.kind === '추격') {
            e.rolls++; if (t.ok) e.rollOk++;
            e.rollPSum += t.p as number;
            e.rollPMin = Math.min(e.rollPMin, t.p as number);
          }
          if (t.kind === '액티브') {
            const k = `${id}:${t.unit}:${t.turn}`;
            const n = (rollsPerTurn.get(k) || 0) + 1;
            rollsPerTurn.set(k, n);
            this.engineRules['E04-one-roll'].checked++;
            if (n > 1) this.violate('E04-one-roll', `${label} ${t.turn}턴: [${nameOf(t.unit as string)}] 【${id}】 한 턴에 ${n}번 판정`);
          }
          break;
        }
        case 'skill': {
          const id = t.skill as string;
          const u = t.unit as string;
          const e = this.ev(id);
          e.fired++;
          e.firedByPhase[t.phase] = (e.firedByPhase[t.phase] || 0) + 1;
          e.firedByTurn[t.turn] = (e.firedByTurn[t.turn] || 0) + 1;
          if (t.via === 'slot') {
            e.slotByPhase[t.phase] = (e.slotByPhase[t.phase] || 0) + 1;
            e.slotByTurn[t.turn] = (e.slotByTurn[t.turn] || 0) + 1;
          }
          const k = `${id}:${u}:${t.turn}`;
          const n = (firesPerTurn.get(k) || 0) + 1;
          firesPerTurn.set(k, n);
          if (t.turn > 0) e.maxPerTurn = Math.max(e.maxPerTurn, n);
          const exp = this.expectations.get(id);
          const st = curStatuses.get(u) || [];
          if (t.kind === '액티브' && t.via === 'slot' && t.phase === 'action') {
            this.engineRules['E01-silence'].checked++;
            if (!st.includes('정신 회복') && st.some(s => this.rules.blockActive.includes(s))) this.violate('E01-silence', `${label} ${t.turn}턴: [${nameOf(u)}] ${st.join('/')} 상태에서 액티브 【${id}】 발동`);
          }
          if (t.kind === '추격') {
            this.engineRules['E03-pursuit'].checked++;
            // 확인된 규칙 R-001: 액티브 전법 속 '일반 공격'(무쌍의 용사 등) 뒤 추격도 정상
            if (!basicThisTurn.has(turnKey(u)) && !basicDamageThisTurn.has(turnKey(u))) {
              this.violate('E03-pursuit', `${label} ${t.turn}턴: [${nameOf(u)}] 일반 공격 없이 추격 【${id}】 발동`);
            }
          }
          if (exp && e.phaseExamples.length < 3 && t.via === 'slot') e.phaseExamples.push(`${t.turn}턴 ${t.phase} — [${nameOf(u)}]`);
          const enemySide = sideOf(u) === 'A' ? 'B' : 'A';
          const aliveEnemies = units.filter(x => x.side === enemySide && !dead.has(x.id)).length;
          invInfo.set(t.inv as number, { skill: id, unit: u, turn: t.turn, aliveEnemies, dsts: new Set() });
          break;
        }
        case 'damage': {
          const dst = t.dst as string;
          if (t.tag === 'basic') basicDamageThisTurn.add(turnKey(t.src as string));
          if (t.skill) {
            const e = this.ev(t.skill as string);
            e.damage[t.dmgType as string] = (e.damage[t.dmgType as string] || 0) + 1;
            const inv = invInfo.get(t.inv as number);
            if (inv && inv.skill === t.skill && sideOf(dst) !== sideOf(inv.unit)) inv.dsts.add(dst);
          }
          if ((t.after as number) <= 0) dead.add(dst);
          break;
        }
        case 'evade': {
          // 피신으로 무효화된 타격도 '대상이 된 것'으로 센다
          const inv = invInfo.get(t.inv as number);
          if (inv && inv.skill === t.skill && sideOf(t.dst as string) !== sideOf(inv.unit)) inv.dsts.add(t.dst as string);
          break;
        }
        case 'heal':
          if (t.skill) this.ev(t.skill as string).heals++;
          break;
        case 'status':
          if (t.skill) {
            const e = this.ev(t.skill as string);
            e.statuses[t.status as string] = (e.statuses[t.status as string] || 0) + 1;
          }
          break;
      }
    }
    // 대상 수 판정
    for (const inv of invInfo.values()) {
      const exp = this.expectations.get(inv.skill);
      if (!exp || exp.damageTargets == null || !inv.dsts.size) continue;
      const want = exp.damageTargets === 'all' ? inv.aliveEnemies : Math.min(exp.damageTargets, inv.aliveEnemies);
      const e = this.ev(inv.skill);
      if (inv.dsts.size === want) e.targetChecks.ok++;
      else {
        e.targetChecks.bad++;
        if (e.targetChecks.examples.length < 3) e.targetChecks.examples.push(`${label} ${inv.turn}턴: 기대 ${want}명, 실제 ${inv.dsts.size}명`);
      }
    }
  }
}

/** 전법 하나의 증거 → 판정 */
export function judgeSkill(exp: Expectation, e: SkillEvidence | undefined, hasEngine: boolean, text: string): CheckResult[] {
  const out: CheckResult[] = [];
  if (!e || e.battles === 0) {
    out.push(chk('D01-fires', 'skip', '감사 전투에 이 전법이 들어가지 않았습니다.'));
    return out;
  }
  const n = e.battles;
  // D01
  if (e.fired === 0) {
    const lvl: Level = !hasEngine ? 'fail' : (exp.conditional || exp.kind === '액티브' || exp.kind === '추격') ? 'warn' : 'fail';
    out.push(chk('D01-fires', lvl, `${n}판 동안 한 번도 발동하지 않았습니다.` + (exp.conditional ? ' (조건부 전법)' : '')));
  } else out.push(chk('D01-fires', 'pass', `${n}판 · 발동 ${e.fired}회 (판당 ${(e.fired / n).toFixed(2)})`));

  // D02 발동 시점
  const slotTotal = Object.values(e.slotByPhase).reduce((a, b) => a + b, 0);
  const allowed: Record<string, string[]> = {
    battleStart: ['battleStart'], turnStart: ['turnStart'], turnEnd: ['turnEnd'],
    action: ['action'], pursuit: ['pursuit', 'basic'],
  };
  const allow = allowed[exp.timing] && [...allowed[exp.timing], ...(exp.alsoTimings || []).flatMap(t => allowed[t] || [])];
  if (exp.timing === 'pursuit') {
    const bad = Object.entries(e.firedByPhase).filter(([p]) => !allow.includes(p));
    const badN = bad.reduce((a, [, v]) => a + v, 0);
    // 확인된 규칙 R-001: 행동 단계(action)의 발동은 액티브 전법 속 '일반 공격' 뒤 추격 — 정상
    //   사건 반응형(via=event) 추격은 엔진이 일반 공격 판정 피해에만 걸어 주므로, 슬롯 발동만 단계를 엄격히 본다
    //   (턴 시작 시 '서로 일반 공격'하는 금병법 — 여포 도발 — 뒤 추격도 정상)
    const hard = Object.entries(e.slotByPhase).filter(([p]) => !allow.includes(p)).reduce((a, [, v]) => a + v, 0);
    out.push(hard ? chk('D02-phase', 'fail', `추격 전법이 일반 공격 단계 밖에서 ${hard}회 발동`, bad.map(([p, v]) => `${p}: ${v}회`))
      : chk('D02-phase', e.fired ? 'pass' : 'skip', badN ? `일반 공격 뒤 발동 (전법 속 일반 공격 뒤 ${badN}회 포함, 규칙 R-001)` : '일반 공격 단계에서만 발동'));
  } else if (allow && slotTotal) {
    const bad = Object.entries(e.slotByPhase).filter(([p]) => !allow.includes(p));
    const badN = bad.reduce((a, [, v]) => a + v, 0);
    const turn0 = e.slotByTurn[0] || 0;
    if (exp.timing === 'battleStart') {
      const later = slotTotal - turn0;
      // "전투 시작 시 …, 매 턴 종료 시 …" 처럼 반복 시점이 함께 있으면 이후 발동은 정상
      const recurring = /매 턴|턴\s*시작\s*시|턴\s*종료\s*시|행동\s*시|행동\s*전|마다|\d+번째 턴|홀수 턴|짝수 턴|후,|후\s/.test(text);
      out.push(!later ? chk('D02-phase', 'pass', '포진(0턴)에서만 발동')
        : recurring ? chk('D02-phase', 'pass', `포진 + 반복 시점 (1턴 이후 ${later}회)`)
        : chk('D02-phase', 'warn', `'전투 시작 시' 전법이 1턴 이후에도 ${later}회 발동`, e.phaseExamples));
    } else {
      out.push(badN ? chk('D02-phase', badN / slotTotal > 0.2 ? 'fail' : 'warn', `원문 시점 '${exp.timingEvidence || exp.timing}'와 다른 단계에서 ${badN}/${slotTotal}회 발동`, bad.map(([p, v]) => `${p}: ${v}회`).concat(e.phaseExamples))
        : chk('D02-phase', 'pass', `${exp.timing} 단계에서 발동`));
    }
  } else out.push(chk('D02-phase', 'skip', exp.timing === 'event' ? '사건 반응형 — 시점 검사 생략' : '시점 판단 불가'));

  // D03 특정 턴
  const exclusive = (text.match(/턴 시작 시|턴 종료 시|매 턴|행동 시|홀수 턴|짝수 턴|번째 턴/g) || []).length <= 1;
  if ((exp.onlyTurns || exp.fromTurn || exp.parity) && exclusive && slotTotal) {
    const turns = Object.entries(e.slotByTurn).map(([k, v]) => [+k, v] as const).filter(([k]) => k > 0);
    const okTurn = (k: number) => (exp.onlyTurns ? exp.onlyTurns.includes(k) : true) && (exp.fromTurn ? k >= exp.fromTurn : true) && (exp.parity ? (exp.parity === 'odd' ? k % 2 === 1 : k % 2 === 0) : true);
    const bad = turns.filter(([k]) => !okTurn(k));
    const desc = exp.onlyTurns ? `${exp.onlyTurns.join('·')}번째 턴` : exp.fromTurn ? `${exp.fromTurn}번째 턴부터` : exp.parity === 'odd' ? '홀수 턴' : '짝수 턴';
    out.push(bad.length ? chk('D03-turns', 'fail', `${desc} 조건인데 ${bad.map(([k, v]) => `${k}턴 ${v}회`).join(', ')} 발동`) : chk('D03-turns', 'pass', desc));
  }

  // D04 발동 확률
  if ((exp.kind === '액티브' || exp.kind === '추격') && e.rolls >= 30) {
    const obs = e.rollOk / e.rolls;
    const pMean = e.rollPSum / e.rolls;
    const pMin = e.rollPMin;
    const sd = Math.sqrt(Math.max(pMean * (1 - pMean), 1e-6) / e.rolls);
    const z = (obs - pMean) / sd;
    const ev = [`판정 ${e.rolls}회 · 성공 ${e.rollOk}회 · 실측 ${(obs * 100).toFixed(1)}%`, `엔진 판정 확률 평균 ${(pMean * 100).toFixed(1)}% (최저 ${(pMin * 100).toFixed(1)}%)`, `원문 ${exp.procRate != null ? (exp.procRate * 100).toFixed(1) + '%' : '-'}`];
    if (Math.abs(z) > 3.5) out.push(chk('D04-proc', 'fail', `실측 발동률이 판정 확률과 통계적으로 다릅니다 (z=${z.toFixed(1)})`, ev));
    else if (exp.procRate != null && pMin + 0.001 < exp.procRate) out.push(chk('D04-proc', 'fail', `엔진이 원문(${(exp.procRate * 100).toFixed(1)}%)보다 낮은 확률(${(pMin * 100).toFixed(1)}%)로 판정합니다.`, ev));
    else out.push(chk('D04-proc', 'pass', `실측 ${(obs * 100).toFixed(1)}% / 기대 ${(pMean * 100).toFixed(1)}%`, ev));
  } else if (exp.kind === '액티브' || exp.kind === '추격') out.push(chk('D04-proc', 'skip', `판정 표본 부족 (${e.rolls}회)`));

  // D05 효과 발생
  if (e.fired > 0) {
    const lacks: string[] = [];
    exp.damageTypes.forEach(dt => { if (!e.damage[dt]) lacks.push(`${dt} 피해`); });
    if (exp.heals && !e.heals) lacks.push('회복');
    exp.statuses.forEach(s => { if (!e.statuses[s]) lacks.push(`「${s}」 부여/획득`); });
    const extra = Object.keys(e.damage).filter(dt => !exp.damageTypes.includes(dt as any) && !/피해/.test(text));
    const evid = [`피해 ${JSON.stringify(e.damage)}`, `회복 ${e.heals}회`, `상태 ${JSON.stringify(e.statuses)}`];
    if (lacks.length) out.push(chk('D05-effects', exp.conditional ? 'warn' : 'fail', `원문에 있는 효과가 전투에서 나오지 않았습니다: ${lacks.join(', ')}`, evid));
    else if (extra.length) out.push(chk('D05-effects', 'warn', `원문에 없는 피해 유형이 발생: ${extra.join(', ')}`, evid));
    else if (exp.damageTypes.length || exp.heals || exp.statuses.length) out.push(chk('D05-effects', 'pass', '원문 효과가 모두 관측됨', evid));
  }

  // D06 대상 수
  const tc = e.targetChecks;
  if (tc.ok + tc.bad >= 5) {
    const r = tc.bad / (tc.ok + tc.bad);
    out.push(r > 0.2 ? chk('D06-targets', 'fail', `피해 대상 수 불일치 ${tc.bad}/${tc.ok + tc.bad}회 (원문: ${exp.damageTargets === 'all' ? '전체' : exp.damageTargets + '명'})`, tc.examples)
      : chk('D06-targets', 'pass', `대상 수 일치 ${tc.ok}/${tc.ok + tc.bad}`));
  }

  // D07 턴당 상한
  if (exp.perTurnLimit != null && e.fired) {
    out.push(e.maxPerTurn > exp.perTurnLimit ? chk('D07-limit', 'fail', `턴당 최대 ${exp.perTurnLimit}회인데 ${e.maxPerTurn}회 발동`) : chk('D07-limit', 'pass', `턴당 최대 ${e.maxPerTurn}회 (상한 ${exp.perTurnLimit})`));
  }
  return out;
}

// ---------- 감사용 전투 편성 ----------
export interface AuditPlanItem { label: string; a: DeckSpec; b: DeckSpec; seeds: number }

export function buildAuditPlan(sim: Simulator, bundle: GameBundle, opts: { tierSeeds?: number; extraSeeds?: number } = {}): AuditPlanItem[] {
  const tierSeeds = opts.tierSeeds ?? 16, extraSeeds = opts.extraSeeds ?? 30;
  const decks = bundle.tierDecks.map(td => ({ td, spec: sim.tierDeckSpec(td.id) }));
  const plan: AuditPlanItem[] = [];
  const n = decks.length;
  decks.forEach((d, i) => {
    [1, 5, 11].forEach(off => {
      const o = decks[(i + off) % n];
      plan.push({ label: `${d.td.tier} ${d.td.name} vs ${o.td.tier} ${o.td.name}`, a: d.spec, b: o.spec, seeds: tierSeeds });
    });
  });
  const covered = new Set<string>();
  decks.forEach(d => d.spec.units.forEach(u => {
    u.skillIds.forEach(s => covered.add(s));
    const g = bundle.generals.find(x => x.id === u.generalId);
    if (g) covered.add(g.uniqueSkillId);
  }));
  const opponent = (i: number) => decks[(i + 3) % n].spec;
  let k = 0;
  // 티어덱에 없는 무장(고유 전법) — 티어덱의 한 자리를 그 무장으로 바꾼다
  for (const g of bundle.generals) {
    if (covered.has(g.uniqueSkillId)) continue;
    const host = decks[k % n].spec;
    const slot = host.units.findIndex(u => bundle.generals.find(x => x.id === u.generalId)?.row === g.row);
    const idx = slot >= 0 ? slot : 0;
    const units = host.units.map((u, j) => (j === idx ? { generalId: g.id, skillIds: u.skillIds } : u));
    if (new Set(units.map(u => u.generalId)).size !== units.length) continue;
    plan.push({ label: `[고유] ${g.name.ko} 투입`, a: { ...host, units }, b: opponent(k), seeds: extraSeeds });
    covered.add(g.uniqueSkillId);
    k++;
  }
  // 티어덱에 없는 일반 전법 — 성격이 맞는 무장의 두 번째 전법 칸에 넣는다
  for (const s of bundle.skills) {
    if (s.isUnique || covered.has(s.id)) continue;
    const host = decks[k % n].spec;
    const statKey = s.trait === '책략' || s.trait === '모략' ? '지력' : s.trait === '병기' ? '무력' : '통솔';
    let best = 0, bestV = -1;
    host.units.forEach((u, j) => {
      const v = (bundle.generals.find(x => x.id === u.generalId)?.stats as any)?.[statKey] ?? 0;
      if (v > bestV && !u.skillIds.includes(s.id)) { bestV = v; best = j; }
    });
    const units = host.units.map((u, j) => (j === best ? { ...u, skillIds: [u.skillIds[0], s.id].filter(Boolean) } : u));
    plan.push({ label: `[전법] ${s.name.ko} 장착`, a: { ...host, units }, b: opponent(k), seeds: extraSeeds });
    covered.add(s.id);
    k++;
  }
  // 금병법: 티어덱에서 쓰이지 않은 금병법도 한 번씩 장착해 본다 (R-003)
  const usedManuals = new Set(decks.flatMap(d => d.spec.units.map(u => u.manualId).filter(Boolean)) as string[]);
  for (const g of bundle.generals) {
    for (const m of g.manuals || []) {
      if (!m.id || usedManuals.has(m.id) || !(m.status === 'ok' || m.status === 'approx')) continue;
      const withG = decks.find(d => d.spec.units.some(u => u.generalId === g.id));
      let a: DeckSpec;
      if (withG) a = { ...withG.spec, units: withG.spec.units.map(u => (u.generalId === g.id ? { ...u, manualId: m.id } : u)) };
      else {
        const host = decks[k % n].spec;
        const units = host.units.map((u, j) => (j === 0 ? { generalId: g.id, skillIds: u.skillIds, manualId: m.id } : u));
        if (new Set(units.map(u => u.generalId)).size !== units.length) continue;
        a = { ...host, units };
      }
      plan.push({ label: `[금병법] ${g.name.ko}〈${m.name}〉`, a, b: opponent(k), seeds: extraSeeds });
      usedManuals.add(m.id);
      k++;
    }
  }
  return plan;
}
