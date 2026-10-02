// 감사 실행기. CLI·웹(Web Worker)·MCP 가 같은 함수를 쓴다.
import { Simulator, type GameBundle, type TraceEvent } from '@cheonha/engine';
import { deriveExpectation, type Expectation } from './expect.ts';
import { staticSkillChecks, staticGeneralChecks } from './static.ts';
import { EvidenceCollector, judgeSkill, buildAuditPlan } from './dynamic.ts';
import { RULE_TITLES, worstOf, type AuditReport, type CheckResult, type Level, type SkillAudit, type ManualAudit } from './report.ts';

export * from './report.ts';
export { deriveExpectation } from './expect.ts';
export { percentNumbers } from './static.ts';

/** 한국판 용어 시트에서 "일반 공격 … 불가", "액티브 전법 … 불가" 상태를 뽑는다 */
export function blockingRulesFromGlossary(bundle: GameBundle) {
  const blockBasic: string[] = [], blockActive: string[] = [];
  for (const t of bundle.glossary) {
    if (!/불가/.test(t.desc)) continue;
    if (/일반 공격/.test(t.desc)) blockBasic.push(t.term);
    if (/액티브 전법/.test(t.desc)) blockActive.push(t.term);
  }
  return { blockBasic, blockActive };
}

export interface AuditOptions {
  tierSeeds?: number;
  extraSeeds?: number;
  onProgress?: (done: number, total: number, label: string) => void;
  /** 특정 전법만 감사 (웹에서 단건 감사) */
  onlySkillIds?: string[];
}

export function runAudit(bundle: GameBundle, opts: AuditOptions = {}): AuditReport {
  const sim = new Simulator(bundle);
  const engineTiming = (sim as any).engine.skillTiming as (s: any) => string;
  const expectations = new Map<string, Expectation>();
  const statics = new Map<string, CheckResult[]>();
  const skills = opts.onlySkillIds ? bundle.skills.filter(s => opts.onlySkillIds!.includes(s.id)) : bundle.skills;
  for (const s of skills) {
    const legacy = sim.data.skills.find(x => x.id === s.id) || sim.data.uniqueSkills.find(x => x.id === s.id);
    const { checks, exp } = staticSkillChecks(s, bundle, legacy ? () => engineTiming(legacy) : undefined);
    expectations.set(s.id, exp);
    statics.set(s.id, checks);
  }
  // 전 전법 기대치는 대상 수 판정 등에 쓰이므로 대상 밖 전법도 등록한다
  for (const s of bundle.skills) if (!expectations.has(s.id)) expectations.set(s.id, deriveExpectation(s));

  const collector = new EvidenceCollector(expectations, blockingRulesFromGlossary(bundle));
  let plan = buildAuditPlan(sim, bundle, opts);
  if (opts.onlySkillIds) {
    const want = new Set(opts.onlySkillIds);
    plan = plan.filter(p => [p.a, p.b].some(d => d.units.some(u => u.skillIds.some(s => want.has(s)) || want.has(`u-${u.generalId}`))));
  }
  const total = plan.reduce((a, p) => a + p.seeds, 0);
  let done = 0;
  for (const item of plan) {
    for (let k = 0; k < item.seeds; k++) {
      const res = sim.simulate(item.a, item.b, { seed: `audit:${item.label}:${k}`, trace: true });
      collector.ingest(res.trace as TraceEvent[], item.label);
      done++;
    }
    opts.onProgress?.(done, total, item.label);
  }

  const genName = new Map(bundle.generals.map(g => [g.id, g.name.ko]));
  const skillAudits: SkillAudit[] = skills.map(s => {
    const exp = expectations.get(s.id)!;
    const ev = collector.bySkill.get(s.id);
    const checks = [...statics.get(s.id)!, ...judgeSkill(exp, ev, !!s.engine, s.text)];
    return {
      id: s.id, name: s.name.ko, kind: String(s.kind), isUnique: s.isUnique,
      owner: s.ownerGeneralId ? genName.get(s.ownerGeneralId) : undefined, season: s.season,
      checks,
      sample: ev ? { battles: ev.battles, fired: ev.fired, rolls: ev.rolls, rollOk: ev.rollOk } : undefined,
      worst: worstOf(checks.map(c => c.level)),
    };
  });

  const generals = (opts.onlySkillIds ? [] : bundle.generals).map(g => {
    const checks = staticGeneralChecks(g, bundle);
    return { id: g.id, name: g.name.ko, season: g.season, checks, worst: worstOf(checks.map(c => c.level)) };
  });

  const manuals: ManualAudit[] = opts.onlySkillIds ? [] : bundle.generals.flatMap(g => (g.manuals || []).map(m => auditManual(g, m, collector)));

  const engineRules: CheckResult[] = Object.entries(collector.engineRules).map(([rule, r]) => ({
    rule, title: RULE_TITLES[rule] || rule,
    level: (r.checked === 0 ? 'skip' : r.violations ? 'fail' : r.soft ? 'warn' : 'pass') as Level,
    message: (r.checked === 0 ? '검사 대상 없음' : r.violations ? `위반 ${r.violations}건 / 검사 ${r.checked}건` : `위반 없음 (검사 ${r.checked}건)`)
      + (r.soft ? ` · 규칙 확인 필요 ${r.soft}건` : ''),
    evidence: [...r.examples, ...(r.softExamples || [])],
  }));

  const all = [...skillAudits.flatMap(s => s.checks), ...generals.flatMap(g => g.checks), ...manuals.flatMap(m => m.checks), ...engineRules];
  const summary: Record<Level, number> = { pass: 0, warn: 0, fail: 0, skip: 0 };
  all.forEach(c => { summary[c.level]++; });
  const byRule = new Map<string, { rule: string; title: string; pass: number; warn: number; fail: number; skip: number }>();
  all.forEach(c => {
    const r = byRule.get(c.rule) || { rule: c.rule, title: c.title, pass: 0, warn: 0, fail: 0, skip: 0 };
    r[c.level]++;
    byRule.set(c.rule, r);
  });

  return {
    generatedAt: new Date().toISOString(),
    dataVersion: bundle.dataVersion,
    engine: 'v1.12b-port',
    battles: collector.battles,
    summary,
    ruleSummary: [...byRule.values()].sort((a, b) => a.rule.localeCompare(b.rule)),
    engineRules,
    skills: skillAudits,
    generals,
    manuals,
  };
}

const mchk = (rule: string, level: Level, message: string, evidence?: string[]): CheckResult => ({ rule, title: RULE_TITLES[rule] || rule, level, message, evidence });

/** 금병법 하나: 정의 상태 + 실전 발동 + 원문 효과 */
function auditManual(g: GameBundle['generals'][number], m: NonNullable<GameBundle['generals'][number]['manuals']>[number], collector: EvidenceCollector): ManualAudit {
  const checks: CheckResult[] = [];
  const st = m.status || 'missing';
  checks.push(st === 'ok' ? mchk('M01-def', 'pass', '원문대로 정의')
    : st === 'approx' ? mchk('M01-def', 'warn', `근사 반영 — ${m.note || ''}`)
    : st === 'unsupported' ? mchk('M01-def', 'warn', `미지원 — 시뮬에서 제외. ${m.note || ''}`)
    : mchk('M01-def', 'fail', '엔진 정의 없음'));
  const parts = m.engine?.parts || [];
  const evs = [collector.bySkill.get(m.id!)].filter(Boolean) as NonNullable<ReturnType<typeof collector.bySkill.get>>[];
  const battles = evs.length ? Math.max(...evs.map(e => e.battles)) : 0;
  const fired = evs.reduce((a, e) => a + e.fired, 0);
  if (st === 'ok' || st === 'approx') {
    if (!parts.length) checks.push(mchk('M02-fires', 'pass', '편성 시 고정 증감 (발동 기록 없음)'));
    else if (!battles) checks.push(mchk('M02-fires', 'skip', '감사 전투에 장착되지 않음'));
    else checks.push(fired ? mchk('M02-fires', 'pass', `${battles}판 · 발동 ${fired}회`) : mchk('M02-fires', 'warn', `${battles}판 동안 발동하지 않음`));
    if (parts.length && fired) {
      const exp = deriveExpectation({ id: m.id!, name: { ko: m.name }, isUnique: false, season: g.season, kind: '패시브', procRate: 1, text: m.text, clauses: [], sources: [] } as any);
      const dmg: Record<string, number> = {}, sts: Record<string, number> = {};
      let heals = 0;
      evs.forEach(e => { Object.entries(e.damage).forEach(([k, v]) => { dmg[k] = (dmg[k] || 0) + v; }); Object.entries(e.statuses).forEach(([k, v]) => { sts[k] = (sts[k] || 0) + v; }); heals += e.heals; });
      const lacks = [...exp.damageTypes.filter(t => !dmg[t]).map(t => `${t} 피해`), ...exp.statuses.filter(x => !sts[x]).map(x => `「${x}」`), ...(exp.heals && !heals ? ['회복'] : [])];
      if (exp.damageTypes.length || exp.statuses.length || exp.heals) {
        checks.push(lacks.length ? mchk('M03-effects', 'warn', `원문 효과가 나오지 않음: ${lacks.join(', ')}`, [`피해 ${JSON.stringify(dmg)}`, `상태 ${JSON.stringify(sts)}`, `회복 ${heals}회`])
          : mchk('M03-effects', 'pass', '원문 효과 관측됨', [`피해 ${JSON.stringify(dmg)}`, `상태 ${JSON.stringify(sts)}`, `회복 ${heals}회`]));
      }
    }
  }
  return { id: m.id!, generalId: g.id, general: g.name.ko, name: m.name, status: st, note: m.note, checks, sample: { battles, fired }, worst: worstOf(checks.map(c => c.level)) };
}

/** 전투 한 판의 trace 를 감사한다 (웹 시뮬 화면의 "이 전투 감사") */
export function auditSingleBattle(bundle: GameBundle, trace: TraceEvent[]) {
  const expectations = new Map<string, Expectation>(bundle.skills.map(s => [s.id, deriveExpectation(s)]));
  const collector = new EvidenceCollector(expectations, blockingRulesFromGlossary(bundle));
  collector.ingest(trace, '');
  const engineRules: CheckResult[] = Object.entries(collector.engineRules).map(([rule, r]) => ({
    rule, title: RULE_TITLES[rule] || rule,
    level: (r.checked === 0 ? 'skip' : r.violations ? 'fail' : r.soft ? 'warn' : 'pass') as Level,
    message: r.checked === 0 ? '해당 없음' : r.violations ? `위반 ${r.violations}건` : r.soft ? `규칙 확인 필요 ${r.soft}건` : `위반 없음 (${r.checked}건 검사)`,
    evidence: [...r.examples, ...(r.softExamples || [])],
  }));
  // 이 판에서 발동한 전법별: 원문 시점과 다른 단계에서 발동한 횟수
  const skills = [...collector.bySkill.entries()].filter(([, e]) => e.fired > 0).map(([id, e]) => {
    const s = bundle.skills.find(x => x.id === id);
    const checks = judgeSkill(expectations.get(id)!, e, !!s?.engine, s?.text || '').filter(c => ['D02-phase', 'D03-turns', 'D05-effects', 'D06-targets', 'D07-limit'].includes(c.rule));
    return { id, name: s?.name.ko || id, fired: e.fired, checks, worst: worstOf(checks.map(c => c.level)) };
  });
  return { engineRules, skills };
}
