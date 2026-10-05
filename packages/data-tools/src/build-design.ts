// 기획·설계 플랫폼 빌드: data/design(카테고리·규정·게시글) + 게임 데이터 + 검증 자료 → 단일 HTML
//   pnpm build:design → apps/design/dist/design.html (아티팩트로 게시)
// 기획 플랫폼의 규정(data/design/spec.json)이 정본이다. docs/COMMON_RULES.md 는 여기서 다시 만든다.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { DATA, ROOT, readJson } from './paths.ts';
import { buildBundle } from './bundle.ts';
import { checkReplay, loadReplays } from './replay-check.ts';
import { Simulator } from '../../engine/src/index.ts';
import { ENGINE_FIXES } from '../../engine/src/legacy/core.js';
import { SKILL_MODULES } from '../../engine/src/skills/index.ts';
import { MANUAL_MODULES } from '../../engine/src/manuals/index.ts';
import { describe } from './gen-skill-funcs.ts';

const TIMING: Record<string, string> = { battleStart: '전투 시작(포진)', turnStart: '턴 시작', turnEnd: '턴 종료', action: '행동 시', beforeBasic: '일반 공격 직전', afterBasic: '일반 공격 후' };
const EVENT: Record<string, string> = { damage: '피해 사건', debuff: '디버프 부여 사건', cast: '전법 발동 사건', evade: '피신 사건', pre_damage: '피해 직전', heal: '회복 사건' };
const KEY_LABEL: Record<string, string> = { damage: '피해', heal: '회복', buffs: '증감', statMods: '능력치', statusEffects: '상태', dispel: '제거', grants: '부여' };
/** 엔진 정의 → 사람이 읽는 처리 요약 (시점·계기 + 효과 항목) */
function engineSummary(def: any): string[] {
  if (!def) return ['엔진 정의 없음'];
  const out: string[] = [];
  const when = (d: any) => d.trigger ? `계기: ${EVENT[d.trigger.event] || d.trigger.event}${d.trigger.role ? ` (${d.trigger.role})` : ''}${d.trigger.chance != null && d.trigger.chance < 1 ? ` · 확률 ${Math.round(d.trigger.chance * 100)}%` : ''}${d.trigger.maxPerTurn && d.trigger.maxPerTurn < 9 ? ` · 턴당 ${d.trigger.maxPerTurn}회` : ''}` : d._timing ? `시점: ${TIMING[d._timing] || d._timing}` : '';
  const eff = (d: any, pre = '') => {
    const w = when(d); if (w) out.push(pre + w);
    if (d.onlyTurns) out.push(`${pre}턴: ${d.onlyTurns.join('·')}번째`);
    for (const [k, label] of Object.entries(KEY_LABEL)) (d.effects?.[k] || []).forEach((x: any) => out.push(`${pre}${label}: ${describe(k, x)}`));
    if (d.effects?.guardAllies) out.push(`${pre}보호(대신 받기)`);
  };
  eff(def);
  (def.parts || []).forEach((p: any, i: number) => eff(p, `부속 ${i + 1} · `));
  return out.length ? out : ['상시·특수 처리'];
}

const DESIGN = join(DATA, 'design');

export function loadDesign() {
  const categories = readJson<any>(join(DESIGN, 'categories.json')).categories;
  const spec = readJson<any>(join(DESIGN, 'spec.json')).items;
  const posts = readdirSync(join(DESIGN, 'posts')).filter(f => f.endsWith('.json')).sort()
    .map(f => readJson<any>(join(DESIGN, 'posts', f)));
  return { categories, spec, posts };
}

/** 전법·금병법·진형·인연 정의에서 쓰는 증감 종류와 상태 이름을 센다 */
function catalog(bundle: any) {
  const mods = new Map<string, { n: number; where: Set<string> }>();
  const statuses = new Map<string, { n: number; where: Set<string> }>();
  const add = (m: Map<string, any>, k: string, where: string) => {
    if (!k) return;
    const e = m.get(k) || { n: 0, where: new Set() };
    e.n++; e.where.add(where); m.set(k, e);
  };
  const walk = (eff: any, where: string) => {
    if (!eff) return;
    for (const b of eff.buffs || []) add(mods, String(b.stat).replace(/이|가|을|를/g, ''), where);
    for (const s of eff.statMods || []) add(mods, `능력치:${s.stat}`, where);
    for (const s of eff.statusEffects || []) {
      const names = typeof s === 'string' ? [s] : s.oneOf || [s.name];
      for (const n of names) add(statuses, n, where);
    }
  };
  const walkDef = (d: any, where: string) => {
    if (!d) return;
    walk(d.effects, where);
    for (const p of d.parts || []) walkDef(p, where);
    for (const b of d.alwaysOnBuffs || []) add(mods, b.stat, where);
    for (const g of d.effects?.grants || []) walkDef(g.skill, where);
    for (const [k] of Object.entries(d.static?.mods || {})) add(mods, k, where);
  };
  for (const m of Object.values(SKILL_MODULES)) walkDef(m.def, m.name);
  for (const m of Object.values(MANUAL_MODULES)) { walkDef(m.def, `금병법〈${m.name}〉`); for (const k of Object.keys(m.def.static?.mods || {})) add(mods, k, `금병법〈${m.name}〉`); }
  for (const f of bundle.formations) for (const e of f.engine?.effects || []) add(mods, e.mod || (e.stat ? `능력치:${e.stat}` : ''), `진형 ${f.name}`);
  const out = (m: Map<string, any>) => [...m.entries()].map(([k, v]) => ({ key: k, n: v.n, where: [...v.where] })).sort((a, b) => b.n - a.n);
  return { mods: out(mods), statuses: out(statuses) };
}

export function collectDesignData() {
  const { categories, spec, posts } = loadDesign();
  const bundle: any = buildBundle();
  const sim = new Simulator(bundle);
  const skillName = (id: string) => bundle.skills.find((s: any) => s.id === id)?.name.ko || id;
  const generals = bundle.generals.map((g: any) => ({
    id: g.id, name: g.name.ko, faction: g.faction, row: g.row, unitType: g.unitType, role: g.role, season: g.season, gender: bundle.engineGenerals?.[g.id]?.gender || g.gender,
    stats: g.stats, unique: skillName(g.uniqueSkillId), uniqueId: g.uniqueSkillId,
    uniqueText: bundle.skills.find((s: any) => s.id === g.uniqueSkillId)?.text || '',
    uniqueKind: bundle.skills.find((s: any) => s.id === g.uniqueSkillId)?.kind || '',
    manuals: (g.manuals || []).map((m: any) => ({ name: m.name, status: m.status, text: m.text })),
    bonds: (bundle.bonds || []).filter((b: any) => (b.memberIds || []).includes(g.id)).map((b: any) => b.name),
    dataStatus: g.dataStatus || null,
  }));
  const skills = bundle.skills.map((s: any) => {
    const mod = SKILL_MODULES[s.id];
    const owner = bundle.generals.find((g: any) => g.uniqueSkillId === s.id);
    return {
      id: s.id, name: s.name.ko, kind: s.kind, isUnique: s.isUnique, owner: owner?.name.ko || null, season: s.season, grade: s.grade, trait: s.trait,
      proc: s.procRateText || '', text: s.text,
      clauses: (s.clauses || []).map((c: any) => ({ text: c.text, status: c.status, reviewed: c.reviewed })),
      engineStatus: (s as any).engineStatus?.status || null, engineNote: (s as any).engineStatus?.note || null,
      revised: (mod?.revised || []).map(r => `${r.date} ${r.note}`),
      engine: engineSummary(mod?.def),
    };
  });
  const manuals = bundle.generals.flatMap((g: any) => (g.manuals || []).map((m: any) => {
    const mod = m.engine?.fn ? MANUAL_MODULES[m.engine.fn] : null;
    return { id: m.id, general: g.name.ko, generalId: g.id, name: m.name, text: m.text, status: m.status, note: m.note || null,
      clauses: (m.clauses || []).map((c: any) => ({ text: c.text, status: c.status })), revised: (mod?.revised || []).map(r => `${r.date} ${r.note}`) };
  }));
  const formations = bundle.formations.map((f: any) => ({ name: f.name, hitRate: f.hitRate, traits: f.traits, confirmed: f.confirmed || null }));
  const bonds = (bundle.bonds || []).map((b: any) => ({ name: b.name, required: b.required, members: b.memberNames, text: b.text, season: b.season || null }));
  const glossary = readJson<any[]>(join(DATA, 'kr', 'glossary.json'), []).filter(x => x.category !== '성지건설');
  const cat = catalog(bundle);
  const terms = readJson<any>(join(DESIGN, 'terms.json')).terms.map((t: any) => {
    const hits = [...cat.mods, ...cat.statuses].filter(m => (t.keys || []).includes(m.key));
    const users = [...new Set(hits.flatMap(h => h.where))];
    return { ...t, uses: hits.reduce((a, h) => a + h.n, 0), users: users.slice(0, 40) };
  });
  const rules = readJson<any>(join(DATA, 'common', 'confirmed-rules.json')).rules;
  const assumptions = readJson<any>(join(DATA, 'verification', 'engine-assumptions.json')).items;
  const queue = readJson<any>(join(DATA, 'verification', 'queue.json'), { items: [] }).items;
  const plan = readJson<any>(join(DATA, 'verification', 'recording-plan.json'));
  const audit = readJson<any>(join(DATA, 'audit', 'latest.json'), null);
  const replays = loadReplays().map(r => {
    let rows: any[] = [];
    try { rows = checkReplay(r, {}, sim); } catch { rows = []; }
    const errs = rows.filter(x => x.kind !== 'group').map(x => Math.abs(x.errPct));
    const rms = errs.length ? Math.sqrt(errs.reduce((a, b) => a + b * b, 0) / errs.length) : null;
    return { id: r.id, date: (r as any).date, battle: (r as any).battle?.title || (r as any).battle?.note || '', samples: rows.length,
      rms: rms != null ? Math.round(rms * 10) / 10 : null,
      rows: rows.filter(x => x.kind !== 'group').map(x => ({ kind: x.kind, turn: x.turn, label: x.label, observed: x.observed, predicted: Math.round(x.predicted * 100) / 100, errPct: Math.round(x.errPct * 10) / 10 })) };
  });
  const coeffs = sim.coeffs;
  const dashboard = buildDashboard({ bundle, sim, spec, posts, plan, queue, audit, replays, skills, manuals, generals });
  return {
    dashboard,
    builtAt: new Date().toISOString(), dataVersion: bundle.dataVersion, season: bundle.season,
    categories, spec, posts,
    game: { generals, skills, manuals, formations, bonds, glossary },
    terms,
    catalog: cat,
    rules, changelog: bundle.changelog.map((c: any) => ({ id: c.id, date: c.date, season: c.season, category: c.category, title: c.title, body: c.body, commit: c.commit, files: c.files })),
    engineFixes: ENGINE_FIXES,
    verification: {
      coeffs, assumptions,
      queue: queue.map((q: any) => ({ id: q.id, kind: q.kind, title: q.title, status: q.status || 'open', priority: q.priority })),
      plan, replays,
      audit: audit ? { generatedAt: audit.generatedAt, summary: audit.summary } : null,
    },
  };
}

/**
 * 점검 대시보드(설계서 첫 화면) — 무엇이 아직 결정·구현·검증이 안 됐는지와 녹화할 덱.
 *   카드 4장: 전투엔진 검증(녹화할 덱) · 원문 미반영/근사 · 답변 필요/잠정 규정 · 계수 오차/감사/데이터 빈칸
 */
function buildDashboard(x: any) {
  const { bundle, sim, spec, posts, plan, queue, audit, replays, skills, manuals, generals } = x;
  const byName = (n: string) => bundle.generals.find((g: any) => g.name.ko === n);
  const skillByName = (n: string) => bundle.skills.find((s: any) => s.name.ko === n);
  const postById = Object.fromEntries(posts.map((p: any) => [p.id, p]));
  // 녹화할 덱: 판마다 무장 배치(진형 칸 → 전열/후열)·능력치·전법, 확인 항목 완료 여부
  const decks = plan.battles.map((b: any) => {
    const gs = b.units.map((u: any) => byName(u[0]));
    // 진형 칸 배치(전열 성향 무장이 전열 칸 먼저 — FEAT-006)를 엔진으로 정한다
    const pos: Record<string, string> = {};
    try {
      const army: any[] = sim.buildArmy({ formation: b.formation, units: gs.filter(Boolean).map((g: any) => ({ generalId: g.id, skillIds: [], manualId: 'none' })) } as any, 'A');
      for (const a of army) pos[a.generalId] = a.position === 'back' ? '후열' : '전열';
    } catch { /* 배치 계산 실패 시 표기만 생략 */ }
    const units = b.units.map((u: any, i: number) => {
      const g = gs[i];
      const uniq = g ? bundle.skills.find((s: any) => s.id === g.uniqueSkillId) : null;
      return { name: u[0], known: !!g, position: (g && pos[g.id]) || '—', unitType: g?.unitType || '', faction: g?.faction || '', stats: g?.stats || null,
        unique: uniq ? { name: uniq.name.ko, kind: uniq.kind, text: uniq.text } : null,
        skills: (u[1] || []).map((n: string) => { const s = skillByName(n); return { name: n, kind: s?.kind || '', text: s?.text || '', known: !!s }; }),
        manual: u[2] ? { name: u[2], text: (g?.manuals || []).find((m: any) => m.name === u[2])?.text || '' } : null };
    });
    const checks = b.checks.map((c: any) => {
      const t = typeof c === 'string' ? { text: c, refs: [] } : c;
      const post = t.done?.post ? postById[t.done.post] : null;
      return { text: t.text, refs: t.refs || [], done: !!t.done, doneDate: t.done?.date || null, donePost: t.done?.post || null, links: post?.links || [] };
    });
    const open = checks.filter((c: any) => !c.done).length;
    return { no: b.no, title: b.title, formation: b.formation, optional: !!b.optional, opponent: b.opponent || plan.opponent || '훈련소 NPC', units, checks, open, total: checks.length };
  }).sort((a: any, b: any) => (a.optional ? 1 : 0) - (b.optional ? 1 : 0) || b.open - a.open || a.no - b.no);
  const engineQueue = queue.filter((q: any) => q.kind === 'engine' && !['verified', 'resolved', 'done', 'rejected'].includes(q.status || 'open'))
    .map((q: any) => ({ id: q.id, title: q.title, priority: q.priority || 0 })).sort((a: any, b: any) => b.priority - a.priority);
  const openChecks = decks.reduce((a: number, d: any) => a + d.open, 0);
  // 원문 미반영·근사 절
  const clauseRows: any[] = [];
  for (const s of skills) for (const c of s.clauses) if (c.status === 'approx' || c.status === 'missing') clauseRows.push({ kind: s.isUnique ? '고유 전법' : '전법', name: s.name, owner: s.owner, status: c.status, text: c.text });
  for (const m of manuals) for (const c of m.clauses) if (c.status === 'approx' || c.status === 'missing') clauseRows.push({ kind: '금병법', name: `〈${m.name}〉`, owner: m.general, status: c.status, text: c.text });
  const allClauses = [...skills.flatMap((s: any) => s.clauses), ...manuals.flatMap((m: any) => m.clauses)];
  const okClauses = allClauses.filter((c: any) => c.status === 'ok' || c.status === 'note').length;
  // 답변 필요·잠정 규정
  const openPosts = posts.filter((p: any) => p.status === '열림');
  const weakSpec = spec.filter((s: any) => s.status === '잠정' || s.status === '결정필요').map((s: any) => ({ id: s.id, cat: s.cat, title: s.title, status: s.status, rule: s.rule }));
  // 계수 오차·감사·데이터 빈칸
  const rmsOf = (kind: string, filter?: (r: any) => boolean) => {
    const rows = replays.flatMap((r: any) => r.rows).filter((r: any) => r.kind === kind && (!filter || filter(r)));
    if (!rows.length) return null;
    return { n: rows.length, rms: Math.round(Math.sqrt(rows.reduce((a: number, r: any) => a + Math.log(Math.max(r.predicted, 0.01) / r.observed) ** 2, 0) / rows.length) * 1000) / 10 };
  };
  const coefs = [
    { key: 'phys', label: '병기 피해', ...rmsOf('damage', r => r.label.includes('병기')) },
    { key: 'magic', label: '책략 피해', ...rmsOf('damage', r => r.label.includes('책략')) },
    { key: 'heal', label: '회복', ...rmsOf('heal') },
    { key: 'infl', label: '스탯 영향', ...rmsOf('influence') },
  ];
  const gaps = generals.filter((g: any) => g.unitType === '미확인' || g.row === '미확인' || g.dataStatus).map((g: any) => g.name);
  const auditS = audit?.summary || null;
  const sev = (bad: boolean, warn: boolean) => bad ? 'bad' : warn ? 'warn' : 'good';
  const specOk = spec.filter((s: any) => s.status === '확정' || s.status === '녹화확인').length;
  return {
    totals: { spec: spec.length, specOk, clauses: allClauses.length, clausesOk: okClauses, openChecks, decks: decks.filter((d: any) => d.open).length },
    cards: {
      engine: { sev: sev(false, openChecks > 0 || engineQueue.length > 0), count: openChecks, sub: `녹화 ${decks.filter((d: any) => d.open && !d.optional).length}판 · 덱 미배정 ${engineQueue.length}건` },
      clauses: { sev: sev(clauseRows.some(r => r.status === 'missing'), clauseRows.length > 0), count: clauseRows.length, sub: `미반영 ${clauseRows.filter(r => r.status === 'missing').length} · 근사 ${clauseRows.filter(r => r.status === 'approx').length}` },
      questions: { sev: sev(openPosts.some((p: any) => p.type === '질문'), openPosts.length + weakSpec.length > 0), count: openPosts.length + weakSpec.length, sub: `열린 글 ${openPosts.length} · 잠정·결정 필요 규정 ${weakSpec.length}` },
      quality: { sev: sev(!!auditS?.fail, coefs.some(c => (c as any).rms > 10) || !!auditS?.warn || gaps.length > 0), count: (auditS?.fail || 0) + (auditS?.warn || 0) + gaps.length, sub: `감사 실패 ${auditS?.fail ?? '—'} · 경고 ${auditS?.warn ?? '—'} · 데이터 빈칸 ${gaps.length}` },
    },
    decks, engineQueue, clauseRows, weakSpec, openPostIds: openPosts.map((p: any) => p.id), coefs, audit: auditS, gaps,
  };
}

/** 규정(spec.json) → docs/COMMON_RULES.md (사람이 읽는 사본) */
export function renderRulesMarkdown(categories: any[], spec: any[]) {
  const mark: Record<string, string> = { 확정: '✅', 녹화확인: '🎥', 잠정: '⚠', 결정필요: '❓', 참고: '·' };
  const lines = ['# 공용 전투 규칙', '', '> 자동 생성 — 정본은 기획 플랫폼 규정 `data/design/spec.json` (pnpm build:design). 이 파일을 직접 고치지 않는다.', '',
    '상태: ✅ 확정 · 🎥 녹화 확인 · ⚠ 잠정(시뮬은 잠정값으로 돌고 표시) · ❓ 결정 필요', ''];
  for (const c of categories) {
    const its = spec.filter(s => s.cat === c.id);
    if (!its.length) continue;
    lines.push(`## ${c.title}`, '| # | 항목 | 규정 | 상태 | 근거 |', '|---|---|---|---|---|');
    for (const s of its) lines.push(`| ${s.id} | ${s.title} | ${String(s.rule).replace(/\|/g, '/').replace(/\n/g, ' ')} | ${mark[s.status] || ''} ${s.status} | ${[...(s.basis || []), s.note].filter(Boolean).join(' · ').replace(/\|/g, '/')} |`);
    lines.push('');
  }
  return lines.join('\n');
}

export function buildDesign() {
  const data = collectDesignData();
  const tpl = readFileSync(join(ROOT, 'apps', 'design', 'template.html'), 'utf8');
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const html = tpl.replace('/*__DESIGN_DATA__*/null', json);
  const out = join(ROOT, 'apps', 'design', 'dist');
  if (!existsSync(out)) mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'design.html'), html);
  writeFileSync(join(ROOT, 'docs', 'COMMON_RULES.md'), renderRulesMarkdown(data.categories, data.spec) + '\n');
  return { bytes: html.length, spec: data.spec.length, posts: data.posts.length };
}

if (process.argv[1]?.endsWith('build-design.ts')) {
  const r = buildDesign();
  console.log(`기획 플랫폼: 규정 ${r.spec}개 · 게시글 ${r.posts}개 · ${(r.bytes / 1024 / 1024).toFixed(2)}MB → apps/design/dist/design.html`);
}
