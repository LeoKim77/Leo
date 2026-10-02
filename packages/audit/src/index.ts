// 감사 실행기. CLI·웹(Web Worker)·MCP 가 같은 함수를 쓴다.
import { Simulator, type GameBundle, type TraceEvent } from '@cheonha/engine';
import { deriveExpectation, type Expectation } from './expect.ts';
import { staticSkillChecks, staticGeneralChecks } from './static.ts';
import { EvidenceCollector, judgeSkill, buildAuditPlan } from './dynamic.ts';
import { RULE_TITLES, worstOf, type AuditReport, type CheckResult, type Level, type SkillAudit } from './report.ts';

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

  const engineRules: CheckResult[] = Object.entries(collector.engineRules).map(([rule, r]) => ({
    rule, title: RULE_TITLES[rule] || rule,
    level: (r.checked === 0 ? 'skip' : r.violations ? 'fail' : r.soft ? 'warn' : 'pass') as Level,
    message: (r.checked === 0 ? '검사 대상 없음' : r.violations ? `위반 ${r.violations}건 / 검사 ${r.checked}건` : `위반 없음 (검사 ${r.checked}건)`)
      + (r.soft ? ` · 규칙 확인 필요 ${r.soft}건` : ''),
    evidence: [...r.examples, ...(r.softExamples || [])],
  }));

  const all = [...skillAudits.flatMap(s => s.checks), ...generals.flatMap(g => g.checks), ...engineRules];
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
  };
}
