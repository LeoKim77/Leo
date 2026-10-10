// 천하결전 DB 엑셀(한국판 기준) → data/kr/*.json
//
// 사용: tsx src/import-excel.ts [엑셀 경로]
//   기본 경로: data/sources/cheonha-db-S2-0925.xlsx
//
// 원칙
//  - 무장·전법 시트의 시즌 = 한국 서버 출시 시즌 (사용자 확인 2026-10-02)
//  - 이름사전 시즌 = 해외 원작 기준 → overseasSeason 으로 따로 보관
//  - 무장 시트 W열(제목 없음)은 작업 메모라 가져오지 않는다 (사용자 확인)
//  - ID 는 deck-lab 슬러그(cao-cao 등)를 따른다 → 해외 자료와 바로 교차참조 가능
import ExcelJS from 'exceljs';
import { join } from 'node:path';
import { DATA, KR, SOURCES, readJson, writeJson } from './paths.ts';
import type { General, Skill, Bond, Formation, TierDeck, GlossaryTerm, SourceRef, Manual } from '../../engine/src/model.ts';

const file = process.argv[2] || join(SOURCES, 'cheonha-db-S2-0925.xlsx');
const SRC: SourceRef = { kind: 'kr-db', label: '천하결전 DB 엑셀 (S2, 2025-09-25)', note: '원 출처: (배포용) S1 삼국지: 천하결전 | 힛파비전' };

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(file);

function rows(sheet: string): (string | number | null)[][] {
  const ws = wb.getWorksheet(sheet);
  if (!ws) throw new Error(`시트 없음: ${sheet}`);
  const out: (string | number | null)[][] = [];
  ws.eachRow({ includeEmpty: false }, (row, i) => {
    if (i === 1) return; // 헤더
    const vals: (string | number | null)[] = [];
    for (let c = 1; c <= ws.columnCount; c++) {
      const cell = row.getCell(c);
      const v = cell.value as any;
      if (v == null) vals.push(null);
      else if (typeof v === 'number') vals.push(v);
      else if (typeof v === 'object' && 'richText' in v) vals.push(v.richText.map((t: any) => t.text).join('').trim());
      else if (typeof v === 'object' && 'result' in v) vals.push(v.result ?? null);
      else vals.push(String(v).trim());
    }
    out.push(vals);
  });
  return out;
}
const s = (v: unknown) => (v == null ? '' : String(v).trim());
const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : parseFloat(s(v));
  return Number.isFinite(n) ? n : undefined;
};
function pct(v: unknown): number | null {
  const t = s(v);
  if (!t) return null;
  const all = [...t.matchAll(/([\d.]+)\s*%/g)].map(m => parseFloat(m[1]) / 100);
  if (all.length) return all[all.length - 1];
  const n = parseFloat(t);
  return Number.isFinite(n) ? (n > 1 ? n / 100 : n) : null;
}

// ---- 해외 교차참조: deck-lab 카탈로그 + 이름사전 ----
const dl = readJson<any>(join(DATA, 'reference', 'decklab', 'catalog.json'));
const dlGeneralByName = new Map<string, any>(dl.generals.map((g: any) => [g.name, g]));
const dlGeneralByHan = new Map<string, any>(dl.generals.map((g: any) => [g.original, g]));
const dlTacticByName = new Map<string, any>(dl.tactics.map((t: any) => [t.name, t]));
const dlTacticByHan = new Map<string, any>();
dl.tactics.forEach((t: any) => {
  dlTacticByHan.set(t.original, t);
  (t.aliases || []).forEach((a: string) => dlTacticByHan.set(a, t));
});

interface NameRow { kind: string; ko: string; zhTW: string; zhCN: string; aliases: string[]; season: string }
const names: NameRow[] = rows('이름사전').map(r => ({
  kind: s(r[0]), ko: s(r[1]), zhTW: s(r[2]), zhCN: s(r[3]),
  aliases: s(r[4]).split(/,\s*/).filter(Boolean), season: s(r[5]),
}));
const nameOf = (kind: string, ko: string) => names.find(n => n.kind === kind && n.ko === ko);

const slug = (prefix: string, no: unknown) => `${prefix}-${s(no).padStart(3, '0')}`;

// ---- 전법 ----
const skills: Skill[] = [];
const unmatched: string[] = [];
for (const r of rows('전법')) {
  const [no, grade, season, kind, trait, name, rate, text, orig] = r;
  if (!s(name)) continue;
  const ko = s(name);
  const origStr = s(orig);
  const han = origStr.match(/\(([^)]+)\)/)?.[1];
  const aliasList = origStr.replace(/\([^)]*\)/, '').split(/,\s*/).map(x => x.trim()).filter(Boolean);
  const nd = nameOf('전법', ko);
  const dlT = dlTacticByName.get(ko) || (han && dlTacticByHan.get(han)) ||
    (nd && (dlTacticByHan.get(nd.zhTW) || dlTacticByHan.get(nd.zhCN))) ||
    aliasList.map(a => dlTacticByHan.get(a) || dlTacticByName.get(a)).find(Boolean);
  if (!dlT) unmatched.push(`전법 ${ko}`);
  skills.push({
    id: dlT?.id || slug('kr-skill', no),
    name: {
      ko,
      zhTW: nd?.zhTW || han || dlT?.original,
      zhCN: nd?.zhCN,
      aliases: [...new Set([...aliasList, ...(nd?.aliases || [])])].filter(a => a !== ko),
    },
    isUnique: false,
    season: s(season),
    overseasSeason: nd?.season || dlT?.season,
    grade: s(grade) || undefined,
    kind: s(kind),
    trait: s(trait) || undefined,
    procRate: pct(rate),
    procRateText: s(rate) || undefined,
    text: s(text),
    clauses: [],
    sources: [SRC, ...(dlT ? [{ kind: 'decklab', label: 'deck-lab 교차참조', url: dl.tacticDetails?.[dlT.id]?.sourceUrl } as SourceRef] : [])],
  });
}

// ---- 무장 + 고유 전법 ----
const manualRows = rows('병법');
const manualsByGeneral = new Map<string, Manual[]>();
for (const r of manualRows) {
  const gname = s(r[2]);
  if (!gname) continue;
  const list: Manual[] = [];
  for (const m of s(r[6]).matchAll(/<([^>]+)>\s*([^<]*)/g)) {
    // "<낙신부> 상권 고유 전법 …" 처럼 권 표기가 꺾쇠 밖에 있는 경우 이름에 붙인다
    const vol = m[2].trim().match(/^(상권|중권|하권)\s+/);
    list.push(vol ? { name: `${m[1].trim()} ${vol[1]}`, text: m[2].trim().slice(vol[0].length) } : { name: m[1].trim(), text: m[2].trim() });
  }
  manualsByGeneral.set(gname, list);
}

const generals: General[] = [];
for (const r of rows('무장')) {
  const [no, season, name, faction, row, role, unitType, ukind, utrait, uname, urate, utext, atk, int, cmd, spd] = r;
  if (!s(name)) continue;
  const ko = s(name);
  const nd = nameOf('무장', ko);
  const dlG = dlGeneralByName.get(ko) || (nd && (dlGeneralByHan.get(nd.zhTW) || dlGeneralByHan.get(nd.zhCN)));
  if (!dlG) unmatched.push(`무장 ${ko}`);
  const id = dlG?.id || slug('kr-gen', no);
  const und = nameOf('고유전법', s(uname));
  const dlU = dlG ? dl.generalSkills?.[dlG.id] : undefined;
  const stats: General['stats'] = {};
  ([['무력', atk], ['지력', int], ['통솔', cmd], ['선공', spd]] as const).forEach(([k, v]) => {
    const n = num(v);
    if (n != null) stats[k] = n;
  });
  const uniqueId = `u-${id}`;
  generals.push({
    id,
    name: { ko, zhTW: nd?.zhTW || dlG?.original, zhCN: nd?.zhCN },
    season: s(season),
    overseasSeason: nd?.season || dlG?.season,
    faction: s(faction),
    row: s(row),
    role: s(role) || undefined,
    unitType: s(unitType),
    stats,
    maxTroops: 10000,
    uniqueSkillId: uniqueId,
    manuals: manualsByGeneral.get(ko) || [],
    sources: [SRC, ...(dlG ? [{ kind: 'decklab', label: 'deck-lab 교차참조', url: dlU?.sourceUrl } as SourceRef] : [])],
  });
  skills.push({
    id: uniqueId,
    name: { ko: s(uname), zhTW: und?.zhTW || dlU?.original, zhCN: und?.zhCN },
    isUnique: true,
    ownerGeneralId: id,
    season: s(season),
    overseasSeason: und?.season,
    kind: s(ukind),
    trait: s(utrait) || undefined,
    procRate: pct(urate),
    procRateText: s(urate) || undefined,
    text: s(utext),
    overseasText: dlU?.effect,
    clauses: [],
    sources: [SRC, ...(dlU ? [{ kind: 'decklab', label: 'deck-lab 고유 전법', url: dlU.sourceUrl } as SourceRef] : [])],
  });
}
const generalIdByName = new Map(generals.map(g => [g.name.ko, g.id]));
const skillIdByName = new Map(skills.filter(x => !x.isUnique).map(x => [x.name.ko, x.id]));

// ---- 인연 ----
const bonds: Bond[] = rows('인연').filter(r => s(r[1])).map(r => {
  const title = s(r[1]);
  const m = title.match(/^(.+?)\s*\((\d+)명/);
  const memberNames = s(r[2]).split(/,\s*/).filter(Boolean);
  return {
    id: `bond-${s(r[0]).padStart(3, '0')}`,
    name: m ? m[1].trim() : title,
    required: m ? +m[2] : memberNames.length,
    memberNames,
    memberIds: memberNames.map(n => generalIdByName.get(n) || dlGeneralByName.get(n)?.id || `?${n}`),
    text: s(r[3]),
  };
});

// ---- 진형 (원본은 진형당 2행: 피격률이 두 행에 나뉘어 있음) ----
const formationRows = rows('진형');
const fmap = new Map<string, { no: string; rates: (number | null)[][]; traits: string[] }>();
for (const r of formationRows) {
  const name = s(r[1]);
  if (!name) continue;
  const e = fmap.get(name) || { no: s(r[0]), rates: [], traits: [] };
  e.rates.push([pct(r[2]), pct(r[3]), pct(r[4])]);
  if (s(r[5])) e.traits.push(s(r[5]).replace(/감사$/, '감소'));
  fmap.set(name, e);
}
const formations: Formation[] = [...fmap.entries()].map(([name, e]) => {
  const pickRate = (i: number) => e.rates.map(x => x[i]).find(v => v != null) ?? null;
  let [front, mid, back] = [pickRate(0), pickRate(1), pickRate(2)];
  // 빈 칸은 남은 비율을 나눠 채운다
  const known = [front, mid, back].filter(v => v != null) as number[];
  const rest = Math.max(0, 1 - known.reduce((a, b) => a + b, 0));
  const blanks = [front, mid, back].filter(v => v == null).length;
  const fill = blanks ? rest / blanks : 0;
  front ??= fill; mid ??= fill; back ??= fill;
  return { id: `formation-${e.no}`, name, hitRate: { front, mid, back }, traits: e.traits };
});

// ---- 용어 ----
const glossary: GlossaryTerm[] = rows('용어').filter(r => s(r[2])).map(r => ({ category: s(r[1]), term: s(r[2]), desc: s(r[3]) }));

// ---- 티어덱 (번호 있는 행 = 덱 시작, 이후 행 = 구성원) ----
const tierDecks: TierDeck[] = [];
let lastDeckKey = '';
for (const r of rows('전쟁티어덱')) {
  const [no, season, title, gname, statPri, sk1, sk2, manuals, combo] = r;
  // 병합 셀은 exceljs 가 구성원 행마다 같은 값을 돌려주므로, 번호+제목이 바뀔 때만 새 덱으로 본다
  const deckKey = `${s(no)}|${s(title)}`;
  if (s(no) && deckKey !== lastDeckKey) {
    lastDeckKey = deckKey;
    const t = s(title);
    const tm = t.match(/^(T\d[+-]?)\s*(.*)$/);
    const nm = (tm ? tm[2] : t).match(/^([^(]+?)\s*(?:\((.+)\))?$/);
    tierDecks.push({
      id: `tier-${s(season).toLowerCase()}-${s(no).padStart(2, '0')}`,
      season: s(season),
      tier: tm ? tm[1] : '',
      name: nm ? nm[1].trim() : t,
      note: nm?.[2],
      units: [],
      source: SRC,
    });
  }
  const deck = tierDecks[tierDecks.length - 1];
  if (!deck || !s(gname)) continue;
  const skillNames = [s(sk1), s(sk2)].filter(Boolean);
  deck.units.push({
    generalId: generalIdByName.get(s(gname)) || `?${s(gname)}`,
    generalName: s(gname),
    statPriority: s(statPri),
    skillNames,
    skillIds: skillNames.map(n => skillIdByName.get(n) || `?${n}`),
    manualSlots: s(manuals).split(/\s+\/\s+/).map(slot => slot.split('/').map(x => x.trim()).filter(Boolean)),
    statCombo: s(combo),
  });
}

// ---- 이름사전 전체 (한국판에 아직 없는 해외 장수·전법 포함) ----
writeJson(join(KR, 'names.json'), { note: '한국어명 ↔ 번체/간체. season 은 해외 원작 기준', names });
writeJson(join(KR, 'generals.json'), generals);
writeJson(join(KR, 'skills.json'), skills);
writeJson(join(KR, 'bonds.json'), bonds);
writeJson(join(KR, 'formations.json'), formations);
writeJson(join(KR, 'glossary.json'), glossary);
writeJson(join(KR, 'tier-decks.json'), tierDecks);

const missingRefs = tierDecks.flatMap(d => d.units.flatMap(u => [u.generalId, ...u.skillIds].filter(x => x.startsWith('?'))));
console.log(`무장 ${generals.length} · 전법 ${skills.filter(x => !x.isUnique).length} · 고유 ${skills.filter(x => x.isUnique).length} · 인연 ${bonds.length} · 진형 ${formations.length} · 티어덱 ${tierDecks.length} · 용어 ${glossary.length}`);
if (unmatched.length) console.log('deck-lab 교차참조 실패:', unmatched.join(', '));
if (missingRefs.length) console.log('티어덱 참조 실패:', [...new Set(missingRefs)].join(', '));
