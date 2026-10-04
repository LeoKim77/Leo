// data/ 의 원본 JSON 들을 합쳐 웹·엔진·감사·MCP 가 쓰는 GameBundle 을 만든다.
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { DATA, KR, readJson } from './paths.ts';
import type { GameBundle, Skill, Clause, Formation, ChangelogEntry, SeasonInfo } from '../../engine/src/model.ts';
import { SKILL_MODULES } from '../../engine/src/skills/index.ts';

// ---------- 절 분해 ----------
// 괄호 안의 쉼표·마침표에서는 자르지 않는다. "전투 시작 시," 같은 짧은 시점 문구는 뒤 절에 붙인다.
export function splitClauses(text: string): string[] {
  const parts: string[] = [];
  let depth = 0, buf = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '(' || c === '（') depth++;
    if (c === ')' || c === '）') depth = Math.max(0, depth - 1);
    const isDecimal = c === '.' && /\d/.test(text[i - 1] || '') && /\d/.test(text[i + 1] || '');
    if (depth === 0 && ((c === '.' && !isDecimal) || c === ',')) {
      if (buf.trim()) parts.push(buf.trim());
      buf = '';
      continue;
    }
    buf += c;
  }
  if (buf.trim()) parts.push(buf.trim());
  const merged: string[] = [];
  for (const p of parts) {
    const prev = merged[merged.length - 1];
    if (prev && prev.length <= 22 && /(?:시|후|때|중|전|경우|마다)$/.test(prev)) merged[merged.length - 1] = `${prev}, ${p}`;
    else merged.push(p);
  }
  return merged;
}

const normForMatch = (s: string) => s.replace(/[\d.%→~\s,()（）을를이가의은는에게]/g, '');
function bigrams(s: string) {
  const out = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
  return out;
}
function dice(a: string, b: string) {
  const A = bigrams(normForMatch(a)), B = bigrams(normForMatch(b));
  if (!A.size || !B.size) return 0;
  let n = 0;
  A.forEach(x => { if (B.has(x)) n++; });
  return (2 * n) / (A.size + B.size);
}

const STATUS_MAP: Record<string, Clause['status']> = { ok: 'ok', NOTE: 'note', MISSING: 'missing', special: 'special', approx: 'approx', note: 'note', missing: 'missing' };

/** 한국판 원문 절마다 v1.12b 절 분석 결과(구현 여부)를 가장 비슷한 절에서 이어받는다 */
export function buildClauses(text: string, legacyClauses?: Array<{ text: string; impl: string[]; status: string }>): Clause[] {
  return splitClauses(text).map((t, idx) => {
    if (!legacyClauses || !legacyClauses.length) return { idx, text: t, status: 'missing' as const };
    // 한국판 한 절이 v1.12b 의 여러 절(시점 + 동작)에 걸칠 수 있다 → 겹치는 절을 모두 모아 가장 나쁜 상태를 쓴다
    const scored = legacyClauses.map(c => ({ c, s: dice(t, c.text) })).sort((a, b) => b.s - a.s);
    const best = scored[0];
    if (!best || best.s < 0.35) return { idx, text: t, status: 'missing' as const };
    const hits = scored.filter(x => x.s >= Math.max(0.35, best.s - 0.15)).map(x => x.c);
    const action = hits.filter(h => h.status !== 'NOTE');
    const pool = action.length ? action : hits;
    const order: Clause['status'][] = ['missing', 'special', 'approx', 'note', 'ok'];
    const statuses = pool.map(h => STATUS_MAP[h.status] || 'missing');
    const worst = order.find(o => statuses.includes(o)) || 'missing';
    return { idx, text: t, status: worst, impl: [...new Set(pool.flatMap(h => h.impl || []))] };
  });
}

// ---------- 진형 특성 문장 → 엔진 효과 ----------
const MOD_WORDS: Array<[RegExp, string]> = [
  [/받는 피해/, '받는피해'], [/주는 피해/, '주는피해'], [/연타(?: 확률|율)/, '연타확률'], [/피신/, '피신'],
];
export function parseFormationTrait(trait: string) {
  const row = trait.startsWith('전열') ? 'front' : trait.startsWith('후열') ? 'back' : null;
  if (!row) return [];
  const sign = /감소/.test(trait) ? -1 : 1;
  const pctM = trait.match(/([\d.]+)%/);
  const ptM = trait.match(/([\d.]+)포인트/);
  const out: any[] = [];
  const stat = (['무력', '지력', '통솔', '선공'] as const).find(s => trait.includes(s));
  if (stat && ptM) out.push({ row, stat, value: sign * parseFloat(ptM[1]) });
  if (pctM) {
    const v = sign * parseFloat(pctM[1]) / 100;
    if (/회심과 묘책/.test(trait)) { out.push({ row, mod: '회심', value: v }, { row, mod: '묘책', value: v }); }
    else for (const [re, mod] of MOD_WORDS) if (re.test(trait)) { out.push({ row, mod, value: v }); break; }
  }
  return out;
}

/** "a.b.0.c" 경로에 값을 넣는다 (배열 인덱스 지원) */
export function setPath(obj: any, path: string, value: unknown) {
  const keys = path.split('.');
  let cur = obj;
  keys.slice(0, -1).forEach((k, i) => {
    if (cur[k] == null) cur[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    cur = cur[k];
  });
  cur[keys[keys.length - 1]] = value;
}

export interface PatchItem { date: string; note?: string; source?: string; create?: boolean; fields: Record<string, unknown> }
export type PatchKind = 'generals' | 'skills' | 'tier-decks' | 'bonds' | 'formations';

/** data/patches/<kind>.json 을 원본 배열에 적용한다. create=true 면 새 항목으로 추가 */
export function applyPatches<T extends { id: string }>(kind: PatchKind, list: T[]): T[] {
  const file = readJson<{ items: Record<string, PatchItem[]> }>(join(DATA, 'patches', `${kind}.json`), { items: {} });
  const out = [...list];
  for (const [id, patches] of Object.entries(file.items || {})) {
    for (const p of patches) {
      let item = out.find(x => x.id === id);
      if (!item) {
        if (!p.create) continue;
        item = { id } as T;
        out.push(item);
      }
      for (const [path, v] of Object.entries(p.fields)) setPath(item, path, v);
      const anyItem = item as any;
      anyItem.sources = [...(anyItem.sources || []), { kind: 'manual', label: `게임 확인 ${p.date}`, note: p.note || p.source }];
    }
  }
  return out;
}

export function loadChangelog(): ChangelogEntry[] {
  const dir = join(DATA, 'changelog');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.json'))
    .map(f => readJson<ChangelogEntry>(join(dir, f)))
    .sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id));
}

export interface FullBundle extends GameBundle {
  changelog: ChangelogEntry[];
  engineGenerals: Record<string, { gender?: 'M' | 'F'; legacyStats?: Record<string, number> }>;
}

/** 시즌 시트에서 가져온 층(data/seasons/<시즌>/<종류>.json)을 엑셀 원본 뒤에 붙인다. 같은 id 는 엑셀이 우선 */
export function withSeasonLayers<T extends { id: string }>(base: T[], file: 'generals' | 'skills' | 'tier-decks'): T[] {
  const dir = join(DATA, 'seasons');
  if (!existsSync(dir)) return base;
  let out = [...base];
  for (const season of readdirSync(dir).sort()) {
    const items = readJson<T[]>(join(dir, season, `${file}.json`), []);
    // 티어덱은 시즌 시트가 최신이다 — 그 시즌의 엑셀 티어덱을 시트 판으로 바꾼다
    if (file === 'tier-decks' && items.length) out = out.filter(x => (x as any).season !== season);
    for (const item of items) if (!out.some(x => x.id === item.id)) out.push(item);
  }
  return out;
}

/** fromJson: 전법 함수 파일을 무시하고 JSON 원천(skills.json·overrides·authored)으로만 정의를 만든다 — 함수 파일 생성용 */
export function buildBundle(opts: { fromJson?: boolean } = {}): FullBundle {
  const seasonsFile = readJson<{ current: string; seasons: SeasonInfo[] }>(join(DATA, 'common', 'seasons.json'));
  const generals = applyPatches('generals', withSeasonLayers(readJson<any[]>(join(KR, 'generals.json')), 'generals'));
  const skills = applyPatches('skills', withSeasonLayers(readJson<Skill[]>(join(KR, 'skills.json')), 'skills'));
  const engSkills = readJson<Record<string, any>>(join(DATA, 'engine', 'skills.json'));
  const engGenerals = readJson<Record<string, any>>(join(DATA, 'engine', 'generals.json'));
  const engBonds = readJson<Record<string, any>>(join(DATA, 'engine', 'bonds.json'));
  const engFormations = readJson<Record<string, any>>(join(DATA, 'engine', 'formations.json'));

  for (const g of generals) if (engGenerals[g.id]?.gender) g.gender = engGenerals[g.id].gender;
  // 금병법 엔진 정의 연결 (R-003)
  const manualDefs = readJson<any>(join(DATA, 'engine', 'manuals.json'), { manuals: {} }).manuals;
  const squashName = (x: string) => x.replace(/\s+/g, '');
  for (const g of generals) {
    (g.manuals || []).forEach((m: any, i: number) => {
      m.id = `m-${g.id}-${i + 1}`;
      const def = (manualDefs[g.id] || []).find((d: any) => squashName(d.name) === squashName(m.name));
      if (!def) { m.status = 'missing'; if (m.textUnknown) m.note = '원문 미확인 — 티어덱 시트에 이름만 있음'; return; }
      m.status = def.status;
      if (def.note) m.note = def.note;
      m.engine = { parts: def.parts, static: def.static, unit: def.unit, uniquePatch: def.uniquePatch };
    });
  }
  const overrides = readJson<any>(join(DATA, 'engine', 'overrides.json'), { skills: {} });
  const authored = readJson<any>(join(DATA, 'engine', 'authored.json'), { skills: {} }).skills;
  const clauseReview = readJson<any>(join(DATA, 'engine', 'clause-review.json'), { skills: {} }).skills;
  for (const s of skills) {
    // 전법 함수 파일(packages/engine/src/skills/<id>.ts)이 있으면 그것이 정본이다 — 정의·원문 절 구현 상태 모두 파일에서
    const mod = opts.fromJson ? undefined : SKILL_MODULES[s.id];
    if (mod) {
      if (mod.def) s.engine = { ...mod.def, fn: true } as any;
      if (mod.engineStatus) (s as any).engineStatus = mod.engineStatus;
      // 원문 절은 파일의 같은 문장을 그대로 쓰고, 원문이 바뀌어 같은 문장이 없을 때만 가장 비슷한 절에서 이어받는다
      const fuzzy = buildClauses(s.text, mod.clauses.map(c => ({ text: c.text, impl: c.impl || [], status: c.status })));
      s.clauses = fuzzy.map(c => {
        const m = mod.clauses.find(x => x.text === c.text);
        return m ? { idx: c.idx, text: c.text, status: m.status, ...(m.impl?.length ? { impl: m.impl } : {}), ...(m.reviewed ? { reviewed: m.reviewed } : {}) } : c;
      });
      continue;
    }
    let eng = engSkills[s.id];
    // 직접 작성한 정의: v1.12b 에 없는 전법, 또는 replace=true 로 v1.12b 정의를 대체
    const au = authored[s.id] && (!eng || authored[s.id].replace) ? authored[s.id] : undefined;
    if (au) {
      // 직접 작성한 정의(S2 신규 등). 미지원이면 엔진에는 붙이지 않고 사유만 남긴다
      const { status, note, missingHints = [], approxHints = [], replace, ...def } = au;
      (s as any).engineStatus = { status, note, source: 'authored' };
      const marks = (t: string): Clause['status'] => (missingHints.some((h: string) => t.includes(h)) ? 'missing' : approxHints.some((h: string) => t.includes(h)) ? 'approx' : 'ok');
      s.clauses = splitClauses(s.text).map((t, idx) => ({ idx, text: t, status: status === 'unsupported' ? 'missing' : marks(t) }));
      if (status !== 'unsupported') s.engine = { ...def, authored: true, authoredStatus: status, authoredNote: note, replacedLegacy: !!replace };
      continue;
    }
    const ov = overrides.skills?.[s.id];
    if (eng && ov) {
      eng = structuredClone(eng);
      for (const [path, v] of Object.entries(ov.set || {})) setPath(eng, path, v);
      eng.overrideNote = { date: ov.date, found: ov.found, reason: ov.reason };
    }
    if (eng) s.engine = eng;
    s.clauses = buildClauses(s.text, eng?.clauses);
    for (const r of clauseReview[s.id] || []) {
      s.clauses.forEach(c => { if (c.text.includes(r.match)) { c.status = r.status; c.reviewed = r.note || '검토됨'; } });
    }
  }
  const bonds = applyPatches('bonds', readJson<any[]>(join(KR, 'bonds.json'))).map(b => ({ ...b, engine: engBonds[b.id] }));
  const formations: Formation[] = applyPatches('formations', readJson<Formation[]>(join(KR, 'formations.json'))).map(f => ({
    ...f,
    engine: { effects: f.traits.flatMap(parseFormationTrait), legacy: engFormations[f.name] },
  }));

  return {
    dataVersion: `${seasonsFile.current}.${new Date().toISOString().slice(0, 10)}`,
    season: seasonsFile.current,
    builtAt: new Date().toISOString(),
    seasons: seasonsFile.seasons,
    generals,
    skills,
    bonds,
    formations,
    tierDecks: applyPatches('tier-decks', withSeasonLayers(readJson<any[]>(join(KR, 'tier-decks.json')), 'tier-decks')).map(t => ({
      ...t,
      units: t.units.map((u: any) => {
        // 세팅 병법 칸에 적힌 이름이 그 무장의 금병법이면 그것을, 아니면 시뮬 가능한 첫 금병법을 쓴다
        const g = generals.find(x => x.id === u.generalId);
        const ms = (g?.manuals || []) as any[];
        const named = [...(u.goldManuals || []), ...u.manualSlots.flat()].map(squashName);
        const pick = ms.find(m => named.includes(squashName(m.name))) || ms.find(m => m.status === 'ok' || m.status === 'approx') || ms[0];
        return pick ? { ...u, manualId: pick.id } : u;
      }),
    })),
    glossary: readJson(join(KR, 'glossary.json')),
    termMap: readJson<any>(join(DATA, 'common', 'term-map.json')).mappings,
    changelog: loadChangelog(),
    engineGenerals: engGenerals,
  };
}
