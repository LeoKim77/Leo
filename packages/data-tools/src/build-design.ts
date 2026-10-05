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
  const out = (m: Map<string, any>) => [...m.entries()].map(([k, v]) => ({ key: k, n: v.n, where: [...v.where].slice(0, 6) })).sort((a, b) => b.n - a.n);
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
    manuals: (g.manuals || []).map((m: any) => ({ name: m.name, status: m.status })),
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
  return {
    builtAt: new Date().toISOString(), dataVersion: bundle.dataVersion, season: bundle.season,
    categories, spec, posts,
    game: { generals, skills, manuals, formations, bonds, glossary },
    catalog: catalog(bundle),
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
