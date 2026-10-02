// data/ 의 원본 JSON 들을 합쳐 웹·엔진·감사·MCP 가 쓰는 GameBundle 을 만든다.
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { DATA, KR, readJson } from './paths.ts';
import type { GameBundle, Skill, Clause, Formation, ChangelogEntry, SeasonInfo } from '../../engine/src/model.ts';

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

const STATUS_MAP: Record<string, Clause['status']> = { ok: 'ok', NOTE: 'note', MISSING: 'missing', special: 'special' };

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

export function buildBundle(): FullBundle {
  const seasonsFile = readJson<{ current: string; seasons: SeasonInfo[] }>(join(DATA, 'common', 'seasons.json'));
  const generals = readJson<any[]>(join(KR, 'generals.json'));
  const skills = readJson<Skill[]>(join(KR, 'skills.json'));
  const engSkills = readJson<Record<string, any>>(join(DATA, 'engine', 'skills.json'));
  const engGenerals = readJson<Record<string, any>>(join(DATA, 'engine', 'generals.json'));
  const engBonds = readJson<Record<string, any>>(join(DATA, 'engine', 'bonds.json'));
  const engFormations = readJson<Record<string, any>>(join(DATA, 'engine', 'formations.json'));

  for (const g of generals) if (engGenerals[g.id]?.gender) g.gender = engGenerals[g.id].gender;
  const overrides = readJson<any>(join(DATA, 'engine', 'overrides.json'), { skills: {} });
  for (const s of skills) {
    let eng = engSkills[s.id];
    const ov = overrides.skills?.[s.id];
    if (eng && ov) {
      eng = structuredClone(eng);
      for (const [path, v] of Object.entries(ov.set || {})) setPath(eng, path, v);
      eng.overrideNote = { date: ov.date, found: ov.found, reason: ov.reason };
    }
    if (eng) s.engine = eng;
    s.clauses = buildClauses(s.text, eng?.clauses);
  }
  const bonds = readJson<any[]>(join(KR, 'bonds.json')).map(b => ({ ...b, engine: engBonds[b.id] }));
  const formations: Formation[] = readJson<Formation[]>(join(KR, 'formations.json')).map(f => ({
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
    tierDecks: readJson(join(KR, 'tier-decks.json')),
    glossary: readJson(join(KR, 'glossary.json')),
    termMap: readJson<any>(join(DATA, 'common', 'term-map.json')).mappings,
    changelog: loadChangelog(),
    engineGenerals: engGenerals,
  };
}
