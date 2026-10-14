// 시즌 시트(공유 구글 시트 격자) → data/seasons/<시즌>/{generals,skills,tier-decks}.json
//
// 사용: tsx src/import-season.ts S3
//   먼저 import-gsheet.ts 로 시트 격자를 받아 두고, data/seasons/<시즌>/name-map.json(사람이 검토한 이름 대응표)을 준비한다.
//
// 원칙
// - 시트 원문(한국어)이 우선. 수치 "Lv1 → Lv2" 는 10레벨 값(= Lv1 × 2)으로 바꾼다 (deck-lab 최고 레벨 값과 일치 확인).
// - 시트에 없는 종류·발동률은 deck-lab 에서 채우고, 그것도 없으면 원문으로 추정해 dataStatus 에 '추정'으로 남긴다.
// - 능력치·병종·배치는 아직 공개 자료가 없으면 임시값을 넣고 dataStatus 로 표시한다(시뮬 결과에 근사로 표기됨).
import { join } from 'node:path';
import { readdirSync } from 'node:fs';
import { DATA, SOURCES, KR, readJson, writeJson } from './paths.ts';
import { normalizeKo } from './terms.ts';

const squash = (s: string) => s.replace(/\s+/g, '');
const fmt = (n: number) => String(Math.round(n * 10) / 10);

/** "60% → 66.6%" 처럼 1레벨 → 2레벨로 적힌 수치를 10레벨 값(1레벨의 2배)으로 바꾼다 */
export function toMaxLevel(text: string) {
  return text.replace(/(\d+(?:\.\d+)?)\s*(%?)\s*→\s*\d+(?:\.\d+)?%?/g, (_, a, pct) => `${fmt(+a * 2)}${pct}`);
}

/** 해외 자료가 2레벨 값(1레벨 × 10/9, 소수 첫째 자리 버림)으로 적은 수치를 10레벨 값으로 바꾼다. 바꾼 개수를 돌려준다 */
export function lv2ToMax(text: string) {
  let n = 0;
  const out = text.replace(/(\d+\.\d)(%?)/g, (m, v, pct) => {
    const lv1 = Math.round(+v * 0.9 * 2) / 2;
    if (Math.abs(+v * 0.9 - lv1) > 0.1 || !lv1) return m;
    n++;
    return `${fmt(lv1 * 2)}${pct}`;
  });
  return { text: out, converted: n };
}

/** 시트 문단 → 한 줄 문장 (끝맺음 없는 항목 줄에는 마침표) */
export function cleanText(raw: string) {
  return raw.replace(/[​‘’*]/g, '').split('\n').map(l => l.trim()).filter(Boolean)
    .map(l => (/[.:：]$/.test(l) ? l : /효과$/.test(l) ? `${l}:` : `${l}.`)).join(' ').replace(/\s+/g, ' ').trim();
}

const CATEGORY: Record<string, string> = { 모략: '책략', 병인: '병기', 치료: '치유' };
const RATE = (t?: string) => (t ? +t.replace('%', '') / 100 : undefined);

interface NameMap {
  sheet: { id: string; codexGid?: string; tierGid: string; label: string };
  generals: Array<any>;
  skills: Array<any>;
  manualMarks: { prefix: string; placeholders: string[] };
}

export function importSeason(season: string) {
  const dir = join(DATA, 'seasons', season);
  const map = readJson<NameMap>(join(dir, 'name-map.json'));
  const gdir = join(SOURCES, 'gsheet', map.sheet.id);
  // 도감 탭이 없는 시즌(티어덱만 갱신)도 있다
  const codex = map.sheet.codexGid ? readJson<any>(join(gdir, `${map.sheet.codexGid}.json`)) : { rows: [], fetchedAt: '' };
  const tier = readJson<any>(join(gdir, `${map.sheet.tierGid}.json`));
  const cat = readJson<any>(join(DATA, 'reference', 'decklab', 'catalog.json'));
  const termMap = readJson<any>(join(DATA, 'common', 'term-map.json')).mappings;
  const krGenerals = readJson<any[]>(join(KR, 'generals.json'));
  const krSkills = readJson<any[]>(join(KR, 'skills.json'));
  const dlGeneral = new Map<string, any>(cat.generals.map((g: any) => [g.id, g]));
  const dlTactic = new Map<string, any>(cat.tactics.map((t: any) => [t.id, t]));
  const ko = (t: string) => normalizeKo(t, termMap).text;

  const source = { kind: 'gsheet', label: map.sheet.label, url: `https://docs.google.com/spreadsheets/d/${map.sheet.id}/edit?gid=${map.sheet.codexGid}`, note: `가져온 때 ${codex.fetchedAt.slice(0, 10)} · 원 출처: sgmdtx.com` };
  const dlSource = (url?: string) => ({ kind: 'decklab', label: 'deck-lab 교차참조', url });

  // 도감 격자: 두 줄씩 [이름 | 원문 | 이름 | 원문]
  const codexText = new Map<string, string>();
  for (const row of codex.rows as string[][]) {
    for (const [nc, tc] of [[0, 1], [7, 8]]) if (row[nc] && row[tc] && !row[nc].startsWith('출처')) codexText.set(squash(row[nc]), row[tc]);
  }
  const fixes: Array<{ from: string; to: string }> = (map as any).textFixes || [];
  const textOf = (e: any) => {
    const t: string | undefined = codexText.get(squash(e.sheet)) ?? (e.aliases || []).map((a: string) => codexText.get(squash(a))).find(Boolean);
    return t && fixes.reduce((acc, f) => acc.split(f.from).join(f.to), t);
  };

  // 능력치 임시값: 기존 한국 무장 평균
  const avg = (k: string) => Math.round(krGenerals.reduce((s, g) => s + (g.stats[k] || 0), 0) / krGenerals.length);
  const placeholderStats = { 무력: avg('무력'), 지력: avg('지력'), 통솔: avg('통솔'), 선공: avg('선공') };

  const generals: any[] = [];
  const skills: any[] = [];
  for (const e of map.generals) {
    const dg = e.decklab ? dlGeneral.get(e.decklab) : undefined;
    const ds = e.decklab ? cat.generalSkills[e.decklab] : undefined;
    const raw = textOf(e);
    const status: Record<string, string> = { stats: '임시값(기존 무장 평균)', unitType: e.unitType ? '원명으로 확인' : '미확인', row: '미확인' };
    if (e.factionInferred) status.faction = '추정(역사 소속)';
    const uid = `u-${e.id}`;
    generals.push({
      id: e.id,
      name: { ko: e.ko || dg?.name || e.sheet, zhTW: e.zhTW || dg?.original },
      season,
      overseasSeason: dg?.season,
      faction: e.faction || dg?.faction || '미확인',
      row: '미확인',
      role: ds ? (CATEGORY[ds.category] || ds.category) : undefined,
      unitType: e.unitType || '미확인',
      stats: placeholderStats,
      maxTroops: 10000,
      uniqueSkillId: uid,
      manuals: [],
      dataStatus: status,
      sources: [source, ...(dg ? [dlSource(ds?.sourceUrl)] : [])],
    });
    let text: string, textStatus: string, procRate: number | undefined, kind: string;
    if (raw) {
      text = cleanText(toMaxLevel(raw));
      textStatus = '한국어 시트 원문(10레벨 환산)';
    } else if (ds) {
      text = ko(ds.effect);
      textStatus = '해외 자료 번역(deck-lab) — 한국판 문구 확인 필요';
    } else throw new Error(`원문 없음: ${e.sheet}`);
    kind = ds?.type || e.unique?.kind;
    procRate = RATE(ds?.triggerRate);
    const sstatus: Record<string, string> = { text: textStatus };
    if (!ds) sstatus.kind = '원문으로 추정';
    if (procRate == null) {
      // 발동률 미확인: 같은 종류 고유 전법의 중앙값을 임시로 쓴다 (전보로 확인)
      const same = krSkills.filter(s => s.isUnique && s.kind === kind).map(s => s.procRate).sort((a, b) => a - b);
      procRate = kind === '지휘' || kind === '패시브' ? 1 : same[Math.floor(same.length / 2)] ?? 0.5;
      if (kind === '액티브' || kind === '추격') sstatus.procRate = `임시값(같은 종류 고유 전법 중앙값 ${Math.round(procRate! * 100)}%)`;
    }
    if (e.unique?.nameUnknown) sstatus.name = '이름 미확인';
    else if (ds && !e.unique?.ko) sstatus.name = '한자 독음(deck-lab) — 한국판 이름 확인 필요';
    skills.push({
      id: uid,
      name: { ko: ds?.name || e.unique?.ko, zhTW: ds?.original },
      isUnique: true,
      ownerGeneralId: e.id,
      season,
      overseasSeason: dg?.season,
      kind,
      trait: ds ? (CATEGORY[ds.category] || ds.category) : undefined,
      procRate,
      procRateText: `${Math.round(procRate! * 1000) / 10}%`,
      text,
      ...(raw && ds ? { overseasText: ko(ds.effect) } : {}),
      clauses: [],
      dataStatus: sstatus,
      sources: [source, ...(ds ? [dlSource(ds.sourceUrl)] : [])],
    });
  }

  for (const e of map.skills) {
    const dt = e.decklab ? dlTactic.get(e.decklab) : undefined;
    const dd = e.decklab ? cat.tacticDetails[e.decklab] : undefined;
    const raw = textOf(e);
    const sstatus: Record<string, string> = {};
    let text: string;
    if (raw) {
      text = cleanText(toMaxLevel(raw));
      sstatus.text = '한국어 시트 원문(10레벨 환산)';
    } else if (dd) {
      const conv = lv2ToMax(ko(dd.maxEffect));
      text = conv.text;
      sstatus.text = `해외 자료 번역(deck-lab)${conv.converted ? ` — 2레벨 수치 ${conv.converted}개를 10레벨로 환산` : ''}, 한국판 문구 확인 필요`;
    } else throw new Error(`원문 없음: ${e.sheet}`);
    const kind = dd?.type || e.kind;
    let procRate = RATE(dd?.triggerRate);
    if (!dd) sstatus.kind = '원문으로 추정';
    if (procRate == null) {
      const same = krSkills.filter(s => !s.isUnique && s.kind === kind).map(s => s.procRate).sort((a, b) => a - b);
      procRate = kind === '지휘' || kind === '패시브' ? 1 : same[Math.floor(same.length / 2)] ?? 0.4;
      if (kind === '액티브' || kind === '추격') sstatus.procRate = `임시값(같은 종류 전법 중앙값 ${Math.round(procRate! * 100)}%)`;
    }
    skills.push({
      id: e.id,
      // 이름은 한국어 시트 표기. deck-lab 이름은 한자 독음이라 별칭으로만 둔다
      name: { ko: e.ko || e.sheet, zhTW: dt?.original, aliases: [...new Set([...(e.aliases || []), ...(dt && dt.name !== e.sheet ? [dt.name] : [])])] },
      isUnique: false,
      season: e.season || season,
      overseasSeason: dt?.season,
      grade: cat.tacticRarities?.[e.decklab] || '미확인',
      kind,
      trait: dd ? (CATEGORY[dd.category] || dd.category) : undefined,
      procRate,
      procRateText: `${Math.round(procRate! * 1000) / 10}%`,
      text,
      ...(raw && dd ? { overseasText: ko(dd.maxEffect) } : {}),
      clauses: [],
      dataStatus: sstatus,
      sources: [source, ...(dd ? [dlSource(dd.sourceUrl)] : [])],
    });
  }

  // ── 티어덱 격자 ──
  // 다른 시즌 층에 이미 있는 카드도 이름으로 찾는다 (예: S2 티어덱이 S3 시트에서 들어온 전법을 씀)
  const otherLayer = (file: string) => readdirSync(join(DATA, 'seasons')).filter(x => x !== season)
    .flatMap(x => readJson<any[]>(join(DATA, 'seasons', x, file), []));
  const allGenerals = [...krGenerals, ...generals, ...otherLayer('generals.json')];
  const allSkills = [...krSkills, ...skills, ...otherLayer('skills.json')];
  const resolveGeneral = (cell: string) => {
    const troop = cell.match(/\((궁병|기병|창병|방패병)\)/)?.[1];
    const base = squash(cell.replace(/\(.*?\)/g, ''));
    const e = map.generals.find(x => [x.sheet, ...(x.aliases || [])].some((n: string) => squash(n) === base));
    const g = e ? allGenerals.find(x => x.id === e.id) : allGenerals.find(x => squash(x.name.ko) === base);
    return { g, troop };
  };
  const resolveSkill = (name: string) => {
    const n = squash(name);
    const e = map.skills.find(x => [x.sheet, ...(x.aliases || [])].some((a: string) => squash(a) === n));
    if (e) return allSkills.find(s => s.id === e.id);
    return allSkills.find(s => !s.isUnique && (squash(s.name.ko) === n || (s.name.aliases || []).some((a: string) => squash(a) === n)));
  };
  const R: string[][] = tier.rows;
  const fills: Record<string, string> = tier.fills;
  const tierDecks: any[] = [];
  const unresolved: string[] = [];
  const TITLE = /^(T[\d.]+[+-]?)\s*(.+)$/;
  const prefix = map.manualMarks.prefix;
  const split = (c: string) => c.split(/[\/+]/).map(x => x.trim()).filter(x => x && x !== '-');
  // 병종 칸 "중방패병-전환" → 병종 (전환 표시가 있으면 덱에서 병종을 바꾼 것)
  const troopOf = (c: string) => {
    const t = c.split('/')[0].trim();
    const kind = /방패/.test(t) ? '방패병' : /궁/.test(t) ? '궁병' : /창|찬/.test(t) ? '창병' : /기병/.test(t) ? '기병' : undefined;
    return { text: t, kind, converted: /전환/.test(t) };
  };
  for (let start = 0; start < R.length; start++) {
    for (let base = 0; base + 3 < (R[start]?.length || 0); base += 5) {
      const title = R[start][base];
      const m = title?.match(TITLE);
      if (!m || R[start - 1]?.[base] === title) continue;   // 병합된 제목 칸 아래 줄은 건너뛴다
      const cell = (r: number, k: number) => (R[r]?.[base + k] || '').trim();
      // 첫 열의 줄 이름(전법·대체전법·병종·병종특화·병법·장비·장비특기·탈것특기·스텟)으로 칸을 찾는다 — 시즌마다 줄 구성이 다르다
      const rows: Array<{ r: number; label: string }> = [];
      for (let r = start + 4; r < R.length; r++) {
        const label = cell(r, 0).replace(/\s+/g, '');
        if (!label || TITLE.test(label) || label.startsWith('출처')) break;
        rows.push({ r, label });
      }
      const rowsOf = (re: RegExp) => rows.filter(x => re.test(x.label));
      const highlight: Array<{ field: string; unit: number; color: string }> = [];
      const fieldRows: Array<[number, string]> = [[start + 2, '무장'], ...rowsOf(/^전법$/).map((x, i): [number, string] => [x.r, `전법${i + 1}`]),
        ...rowsOf(/^병법$/).map((x, i): [number, string] => [x.r, `병법${i + 1}`]),
        ...rows.filter(x => !/^(전법|병법)$/.test(x.label)).map((x): [number, string] => [x.r, x.label === '스텟' ? '능력치 분배' : x.label])];
      const one = (re: RegExp, k: number) => { const x = rowsOf(re)[0]; return x ? cell(x.r, k) : ''; };
      const units = [1, 2, 3].map(k => {
        for (const [r, field] of fieldRows) {
          const color = fills[`${r},${base + k}`];
          if (color) highlight.push({ field, unit: k - 1, color });
        }
        const gCells = cell(start + 2, k).split('/').map(x => x.trim()).filter(Boolean);
        const { g, troop } = resolveGeneral(gCells[0] || '');
        if (!g) unresolved.push(`무장 ${cell(start + 2, k)} (${m[2]})`);
        // "아무 치료 전법"·"치료 계열 전법" 처럼 고르게 둔 칸은 이름만 남긴다
        const resolveAll = (names: string[]) => names.filter(a => !/대체\s*없음/.test(a)).map(a => {
          if (/아무|계열 전법|^\S+ 전법$/.test(a) && !resolveSkill(a)) return { name: a, id: undefined as string | undefined, free: true };
          const sk = resolveSkill(a.replace(/\+$/, ''));
          if (!sk) unresolved.push(`전법 ${a} (${m[2]})`);
          return { name: a, id: sk?.id as string | undefined };
        });
        const slots = rowsOf(/^전법$/).map(x => resolveAll(split(cell(x.r, k))));
        const swaps = resolveAll(split(one(/^대체전법$/, k)));
        const manualCells = rowsOf(/^병법$/).map(x => cell(x.r, k));
        const tr = troopOf(one(/^병종$/, k));
        const unitType = troop || (tr.converted ? tr.kind : undefined);
        return {
          generalId: g?.id || `?${gCells[0] || ''}`,
          generalName: g?.name.ko || gCells[0] || '',
          ...(gCells.length > 1 ? { generalAlternatives: gCells.slice(1) } : {}),
          ...(unitType ? { unitType } : {}),
          statPriority: one(/^스텟$/, k),
          skillIds: slots.map(p => p[0]?.id).filter(Boolean),
          skillNames: slots.map(p => p[0]?.name || ''),
          skillAlternatives: slots.map(p => p.slice(1)),
          ...(swaps.length ? { swapSkills: swaps } : {}),
          manualSlots: manualCells.map(c => c.split('/').map(x => x.trim().replace(new RegExp(`^${prefix}`), '')).filter(Boolean)),
          goldManuals: manualCells.flatMap(c => c.split('/').map(x => x.trim())).filter(x => x.startsWith(prefix)).map(x => x.slice(prefix.length)),
          statCombo: one(/^장비$/, k),
          ...(tr.text ? { troop: { type: tr.text, spec: one(/^병종특화$/, k) } } : {}),
          gear: { trait: one(/^장비특[성기]$/, k), mount: one(/^탈것특[성기]$/, k) },
        };
      });
      tierDecks.push({
        id: `tier-${season.toLowerCase()}-${String(tierDecks.length + 1).padStart(2, '0')}`,
        season,
        tier: m[1],
        name: m[2].trim(),
        note: cell(start + 1, 0) === '-' ? '' : cell(start + 1, 0),
        formation: cell(start + 3, 0),
        units,
        highlight,
        source: { kind: 'gsheet', label: map.sheet.label, url: `https://docs.google.com/spreadsheets/d/${map.sheet.id}/edit?gid=${map.sheet.tierGid}`, note: `가져온 때 ${tier.fetchedAt.slice(0, 10)}` },
      });
    }
  }
  // 신규 무장의 금병법: 티어덱 '금·' 칸에 적힌 이름만 안다(원문은 아직 없음)
  for (const g of generals) {
    const names = [...new Set(tierDecks.flatMap(t => t.units.filter((u: any) => u.generalId === g.id).flatMap((u: any) => u.goldManuals)))];
    g.manuals = names.map(name => ({ name, text: '', textUnknown: true }));
  }
  writeJson(join(dir, 'generals.json'), generals);
  writeJson(join(dir, 'skills.json'), skills);
  writeJson(join(dir, 'tier-decks.json'), tierDecks);
  return { generals: generals.length, skills: skills.length, tierDecks: tierDecks.length, unresolved };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const season = process.argv[2] || 'S3';
  const r = importSeason(season);
  console.log(`${season}: 무장 ${r.generals} · 전법 ${r.skills} (고유 포함) · 티어덱 ${r.tierDecks}`);
  if (r.unresolved.length) console.log('연결 못 한 이름:\n  ' + r.unresolved.join('\n  '));
}
