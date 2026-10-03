// 천하결전 시뮬레이터 MCP 서버 (stdio)
//
// Claude(Code/Desktop)가 이 저장소의 게임 데이터·전투 엔진·감사·업데이트 게시판을 다루는 통로.
//   읽기:  game_search, game_get, tierdeck_list, term_normalize, overseas_lookup, board_list, audit_summary
//   실행:  sim_battle, sim_matchup, audit_skill, audit_run
//   쓰기:  board_post, data_patch, bundle_rebuild
// 쓰기 도구는 data/ 아래 JSON 만 바꾼다. Git 커밋·푸시는 Claude Code 가 따로 한다.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { Simulator, type DeckSpec } from '@cheonha/engine';
import { runAudit, type AuditReport } from '@cheonha/audit';
import { Recommender, planVerification } from '@cheonha/recommender';
import { buildBundle, loadChangelog, type FullBundle, type PatchKind } from '../../../packages/data-tools/src/bundle.ts';
import { DATA, ROOT, readJson, writeJson } from '../../../packages/data-tools/src/paths.ts';
import { normalizeKo } from '../../../packages/data-tools/src/terms.ts';
import { buildQueue, loadQueue, resolveItem } from '../../../packages/data-tools/src/verification.ts';

let cache: { bundle: FullBundle; sim: Simulator } | null = null;
function ctx() {
  if (!cache) {
    const bundle = buildBundle();
    cache = { bundle, sim: new Simulator(bundle) };
  }
  return cache;
}
const invalidate = () => { cache = null; };

const text = (v: unknown) => ({ content: [{ type: 'text' as const, text: typeof v === 'string' ? v : JSON.stringify(v, null, 2) }] });
const fail = (msg: string) => ({ content: [{ type: 'text' as const, text: msg }], isError: true });
const squash = (s: string) => s.replace(/\s+/g, '').toLowerCase();

function findGeneral(q: string) {
  const { bundle } = ctx();
  const k = squash(q);
  return bundle.generals.find(g => g.id === q || squash(g.name.ko) === k || g.name.zhTW === q || g.name.zhCN === q);
}
function findSkill(q: string) {
  const { bundle } = ctx();
  const k = squash(q);
  return bundle.skills.find(s => s.id === q || squash(s.name.ko) === k || (s.name.aliases || []).some(a => squash(a) === k) || s.name.zhTW === q || s.name.zhCN === q);
}

const deckInput = z.union([
  z.string().describe('티어덱 id (예: tier-s1-01) 또는 티어덱 이름 (예: "T0+ 대황노")'),
  z.object({
    name: z.string().optional(),
    formation: z.string().optional().describe('진형 이름 (기본 기형진)'),
    units: z.array(z.object({
      general: z.string().describe('무장 이름 또는 id'),
      skills: z.array(z.string()).max(2).describe('전법 2개 (이름 또는 id). 고유 전법은 자동 포함'),
      manual: z.string().optional().describe('금병법 이름 (생략하면 그 무장의 첫 금병법, "없음" 이면 미장착)'),
      position: z.enum(['front', 'mid', 'back']).optional(),
    })).min(1).max(3),
  }),
]);

function resolveDeck(d: z.infer<typeof deckInput>): DeckSpec {
  const { bundle, sim } = ctx();
  if (typeof d === 'string') {
    const td = bundle.tierDecks.find(t => t.id === d || `${t.tier} ${t.name}` === d || t.name === d);
    if (!td) throw new Error(`티어덱을 찾을 수 없습니다: ${d}`);
    return sim.tierDeckSpec(td.id);
  }
  return {
    name: d.name, formation: d.formation,
    units: d.units.map(u => {
      const g = findGeneral(u.general);
      if (!g) throw new Error(`무장을 찾을 수 없습니다: ${u.general}`);
      const manualId = u.manual === '없음' ? 'none' : u.manual ? g.manuals.find(m => squash(m.name) === squash(u.manual!))?.id : undefined;
      if (u.manual && u.manual !== '없음' && !manualId) throw new Error(`${g.name.ko} 의 금병법이 아닙니다: ${u.manual} (가능: ${g.manuals.map(m => m.name).join(', ') || '없음'})`);
      return {
        generalId: g.id, position: u.position, manualId,
        skillIds: u.skills.map(s => { const f = findSkill(s); if (!f) throw new Error(`전법을 찾을 수 없습니다: ${s}`); return f.id; }),
      };
    }),
  };
}

const server = new McpServer({ name: 'cheonha-sim', title: '삼국지 천하결전 무한무투', version: '0.1.0' }, {
  instructions: '삼국지 천하결전 덱 전투 시뮬레이터. 한국판 용어를 쓴다(병기/책략/피신/묘책, 해외 표기 병인/모략/회피/기책 금지). 사용자가 알려준 게임 정보는 data_patch 로 반영하고, board_post 로 업데이트 게시판에 날짜와 함께 기록한다. 해외 자료를 옮길 때는 term_normalize 로 한국판 용어로 바꾼다.',
});

// ---------------- 읽기 ----------------
server.registerTool('game_search', {
  title: '게임 데이터 검색',
  description: '무장·전법·티어덱·인연·진형·용어를 이름 일부로 찾는다.',
  inputSchema: {
    query: z.string(),
    kind: z.enum(['general', 'skill', 'tierdeck', 'bond', 'formation', 'term']).optional(),
    season: z.string().optional().describe('S1, S2 … (한국 서버 기준)'),
  },
}, async ({ query, kind, season }) => {
  const { bundle } = ctx();
  const q = squash(query);
  const hit = (s: string | undefined) => !!s && squash(s).includes(q);
  const out: any[] = [];
  if (!kind || kind === 'general') bundle.generals.filter(g => (!season || g.season === season) && (hit(g.name.ko) || hit(g.name.zhTW) || g.id.includes(query)))
    .forEach(g => out.push({ kind: 'general', id: g.id, name: g.name.ko, season: g.season, faction: g.faction, unitType: g.unitType, row: g.row }));
  if (!kind || kind === 'skill') bundle.skills.filter(s => (!season || s.season === season) && (hit(s.name.ko) || hit(s.name.zhTW) || (s.name.aliases || []).some(hit) || hit(s.text)))
    .forEach(s => out.push({ kind: s.isUnique ? 'unique-skill' : 'skill', id: s.id, name: s.name.ko, type: s.kind, season: s.season, engine: !!s.engine }));
  if (!kind || kind === 'tierdeck') bundle.tierDecks.filter(t => (!season || t.season === season) && (hit(t.name) || t.units.some(u => hit(u.generalName))))
    .forEach(t => out.push({ kind: 'tierdeck', id: t.id, name: `${t.tier} ${t.name}`, units: t.units.map(u => u.generalName) }));
  if (!kind || kind === 'bond') bundle.bonds.filter(b => hit(b.name) || b.memberNames.some(hit)).forEach(b => out.push({ kind: 'bond', id: b.id, name: b.name, members: b.memberNames }));
  if (!kind || kind === 'formation') bundle.formations.filter(f => hit(f.name)).forEach(f => out.push({ kind: 'formation', id: f.id, name: f.name, traits: f.traits }));
  if (!kind || kind === 'term') bundle.glossary.filter(t => hit(t.term)).forEach(t => out.push({ kind: 'term', ...t }));
  return text(out.slice(0, 60));
});

server.registerTool('game_get', {
  title: '게임 데이터 상세',
  description: '무장 또는 전법 하나의 전체 정보(원문, 절 분해와 반영 상태, 엔진 정의 요약, 최근 감사 결과).',
  inputSchema: { kind: z.enum(['general', 'skill']), name: z.string().describe('이름 또는 id') },
}, async ({ kind, name }) => {
  const { bundle } = ctx();
  const audit = existsSync(join(DATA, 'audit', 'latest.json')) ? readJson<AuditReport>(join(DATA, 'audit', 'latest.json')) : null;
  if (kind === 'general') {
    const g = findGeneral(name);
    if (!g) return fail(`무장 없음: ${name}`);
    const u = bundle.skills.find(s => s.id === g.uniqueSkillId);
    return text({ ...g, uniqueSkill: u && { id: u.id, name: u.name.ko, kind: u.kind, text: u.text }, audit: audit?.generals.find(x => x.id === g.id) });
  }
  const s = findSkill(name);
  if (!s) return fail(`전법 없음: ${name}`);
  const eng = s.engine as any;
  return text({
    id: s.id, name: s.name, kind: s.kind, trait: s.trait, season: s.season, procRate: s.procRateText, text: s.text,
    overseasText: s.overseasText, clauses: s.clauses,
    engine: eng ? { effects: eng.effects, trigger: eng.trigger, prepTurns: eng.prepTurns, override: eng.overrideNote } : null,
    audit: audit?.skills.find(x => x.id === s.id),
  });
});

server.registerTool('tierdeck_list', {
  title: '티어덱 목록',
  inputSchema: { season: z.string().optional() },
}, async ({ season }) => {
  const { bundle } = ctx();
  return text(bundle.tierDecks.filter(t => !season || t.season === season).map(t => ({
    id: t.id, season: t.season, tier: t.tier, name: t.name, note: t.note,
    units: t.units.map(u => `${u.generalName} [${u.skillNames.join(', ')}] 병법:${u.manualSlots.map(s => s.join('/')).join(' · ')}`),
  })));
});

server.registerTool('term_normalize', {
  title: '한국판 용어로 바꾸기',
  description: '해외(중국·대만)·deck-lab 표기를 한국판 게임 용어로 바꾼다. 자동으로 못 바꾸는 표현은 review 로 알려준다.',
  inputSchema: { text: z.string() },
}, async ({ text: t }) => text(normalizeKo(t, ctx().bundle.termMap)));

server.registerTool('overseas_lookup', {
  title: '해외 자료 조회 (deck-lab)',
  description: '천덱랩(deck-lab)에 모인 중국·대만 자료에서 장수·전법·덱을 찾는다. 결과는 한국판 용어로 바꿔서 돌려준다. 원출처 URL 포함.',
  inputSchema: { query: z.string(), kind: z.enum(['general', 'tactic', 'deck']).optional() },
}, async ({ query, kind }) => {
  const dir = join(DATA, 'reference', 'decklab');
  const cat = readJson<any>(join(dir, 'catalog.json'));
  const decks = readJson<any>(join(dir, 'decks.json'));
  const map = ctx().bundle.termMap;
  const norm = (v: unknown) => JSON.parse(normalizeKo(JSON.stringify(v), map).text);
  const q = squash(query);
  const hit = (s?: string) => !!s && squash(s).includes(q);
  const out: any[] = [];
  if (!kind || kind === 'general') cat.generals.filter((g: any) => hit(g.name) || hit(g.original) || g.id === query)
    .forEach((g: any) => out.push({ kind: 'general', ...g, uniqueSkill: cat.generalSkills[g.id] }));
  if (!kind || kind === 'tactic') cat.tactics.filter((t: any) => hit(t.name) || hit(t.original) || (t.aliases || []).some(hit) || t.id === query)
    .forEach((t: any) => out.push({ kind: 'tactic', ...t, detail: cat.tacticDetails[t.id] }));
  if (!kind || kind === 'deck') [...decks.decks, ...decks.aiDecks].filter((d: any) => hit(d.name) || hit(d.originalName))
    .forEach((d: any) => out.push({ kind: 'deck', id: d.id, name: d.name, originalName: d.originalName, tier: d.tier, seasons: d.seasons, formation: d.formation, members: d.members.map((m: any) => ({ generalId: m.generalId, tactics: m.tactics, manuals: m.manuals })) }));
  return text({ attribution: '천덱랩 deck-lab v5.0 — 원출처는 각 항목 sourceUrl', results: norm(out.slice(0, 30)) });
});

server.registerTool('board_list', {
  title: '업데이트 게시판 목록',
  inputSchema: { limit: z.number().int().min(1).max(100).optional(), season: z.string().optional(), category: z.string().optional() },
}, async ({ limit, season, category }) => text(loadChangelog().filter(e => (!season || e.season === season) && (!category || e.category === category)).slice(0, limit ?? 20)));

server.registerTool('audit_summary', {
  title: '감사 결과 요약',
  description: '최근 감사(data/audit/latest.json)의 실패·경고 목록.',
  inputSchema: { level: z.enum(['fail', 'warn']).optional(), rule: z.string().optional() },
}, async ({ level, rule }) => {
  const p = join(DATA, 'audit', 'latest.json');
  if (!existsSync(p)) return fail('감사 결과가 없습니다. audit_run 을 먼저 실행하세요.');
  const r = readJson<AuditReport>(p);
  const want = level ? [level] : ['fail', 'warn'];
  const items = r.skills.flatMap(s => s.checks.filter(c => want.includes(c.level) && (!rule || c.rule === rule)).map(c => ({ skill: s.name, id: s.id, kind: s.kind, rule: c.rule, level: c.level, message: c.message })));
  return text({ generatedAt: r.generatedAt, dataVersion: r.dataVersion, battles: r.battles, summary: r.summary, engineRules: r.engineRules, items: items.slice(0, 150), total: items.length });
});

// ---------------- 실행 ----------------
server.registerTool('sim_battle', {
  title: '전투 1판',
  description: '두 덱으로 한 판을 돌려 전보를 돌려준다. seed 를 주면 같은 판이 재현된다.',
  inputSchema: { a: deckInput, b: deckInput, seed: z.union([z.string(), z.number()]).optional(), fullLog: z.boolean().optional() },
}, async ({ a, b, seed, fullLog }) => {
  try {
    const { sim } = ctx();
    const A = resolveDeck(a), B = resolveDeck(b);
    const errs = [...sim.validateDeck(A), ...sim.validateDeck(B)];
    if (errs.length) return fail(errs.join('\n'));
    const s = seed ?? Date.now();
    const r = sim.simulate(A, B, { seed: s });
    const log = fullLog ? r.log : r.log.filter(l => !/└\[상태\]|└\[계산\]/.test(l)).slice(0, 400);
    return text({ seed: s, winner: r.winner, turns: r.turns, rounds: r.rounds, units: r.units, log });
  } catch (e: any) { return fail(e.message); }
});

server.registerTool('sim_matchup', {
  title: '몬테카를로 대전',
  description: '두 덱을 N판 돌려 승률·평균 턴·전법 기여도를 낸다.',
  inputSchema: { a: deckInput, b: deckInput, runs: z.number().int().min(10).max(3000).optional(), seed: z.union([z.string(), z.number()]).optional() },
}, async ({ a, b, runs, seed }) => {
  try {
    const { sim } = ctx();
    const A = resolveDeck(a), B = resolveDeck(b);
    const errs = [...sim.validateDeck(A), ...sim.validateDeck(B)];
    if (errs.length) return fail(errs.join('\n'));
    const m = sim.monteCarlo(A, B, { runs: runs ?? 500, seed });
    return text({ ...m, contribution: m.contribution.slice(0, 10), contributionB: m.contributionB.slice(0, 10) });
  } catch (e: any) { return fail(e.message); }
});

server.registerTool('audit_skill', {
  title: '전법 하나 감사',
  description: '한 전법(고유 전법 포함)이 원문대로 발동하는지 전투를 돌려 검사한다.',
  inputSchema: { skill: z.string().describe('전법 이름 또는 id, 또는 무장 이름(고유 전법)') },
}, async ({ skill }) => {
  const g = findGeneral(skill);
  const s = findSkill(skill) || (g && ctx().bundle.skills.find(x => x.id === g.uniqueSkillId));
  if (!s) return fail(`전법 없음: ${skill}`);
  const r = runAudit(ctx().bundle, { onlySkillIds: [s.id], tierSeeds: 16, extraSeeds: 40 });
  return text({ skill: r.skills[0], engineRules: r.engineRules, battles: r.battles });
});

server.registerTool('audit_run', {
  title: '전체 감사 실행',
  description: '모든 무장·전법을 감사하고 data/audit/latest.json 과 웹용 사본을 갱신한다.',
  inputSchema: { quick: z.boolean().optional() },
}, async ({ quick }) => {
  const r = runAudit(ctx().bundle, { tierSeeds: quick ? 4 : 16, extraSeeds: quick ? 8 : 30 });
  writeJson(join(DATA, 'audit', 'latest.json'), r);
  writeJson(join(ROOT, 'apps', 'web', 'public', 'data', 'audit.json'), r);
  return text({ battles: r.battles, summary: r.summary, ruleSummary: r.ruleSummary, engineRules: r.engineRules });
});

// ---------------- 쓰기 ----------------
const CATEGORIES = ['신규 무장', '신규 전법', '밸런스 조정', '티어덱', '전투 규칙', '데이터 수정', '엔진', '기타'] as const;

/** 아직 커밋하지 않은 변경 파일 (게시판 '업데이트 파일' 기본값) */
function changedFiles(): string[] {
  try {
    const out = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' });
    return out.split('\n').map(l => l.slice(3).trim()).filter(f => f && !f.startsWith('data/changelog/') && !f.startsWith('apps/web/public/'));
  } catch { return []; }
}

function postBoard(e: { title: string; body: string; category: typeof CATEGORIES[number]; season?: string; date?: string; refs?: string[]; source?: string; files?: string[] }) {
  const { bundle } = ctx();
  const date = e.date || new Date().toISOString().slice(0, 10);
  const slug = e.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 40) || 'post';
  let id = `${date}-${slug}`;
  let n = 2;
  while (existsSync(join(DATA, 'changelog', `${id}.json`))) id = `${date}-${slug}-${n++}`;
  const entry = { id, date, season: e.season || bundle.season, category: e.category, title: e.title, body: e.body, refs: e.refs || [], source: e.source, author: 'Claude (MCP)', dataVersion: bundle.dataVersion, files: e.files ?? changedFiles() };
  writeJson(join(DATA, 'changelog', `${id}.json`), entry);
  return entry;
}

server.registerTool('board_post', {
  title: '업데이트 게시판 글쓰기',
  description: '게임에서 새로 확인한 정보, 데이터·엔진 변경 내역을 날짜와 함께 게시판에 남긴다. 본문은 한국판 용어로.',
  inputSchema: {
    title: z.string(), body: z.string(), category: z.enum(CATEGORIES),
    season: z.string().optional(), date: z.string().optional().describe('YYYY-MM-DD (기본 오늘)'),
    refs: z.array(z.string()).optional().describe('관련 무장·전법 id'), source: z.string().optional(),
    files: z.array(z.string()).optional().describe('이 업데이트로 바뀐 파일 (생략하면 git 의 미커밋 변경 파일)'),
  },
}, async (args) => {
  const e = postBoard(args);
  invalidate();
  return text({ posted: e, file: `data/changelog/${e.id}.json`, next: '웹에 반영하려면 bundle_rebuild 후 커밋하세요.' });
});

server.registerTool('data_patch', {
  title: '게임 정보 반영',
  description: '사용자가 게임에서 확인한 정보(스탯, 전법 원문·발동률, 신규 무장/전법, 티어덱)를 엑셀 원본 위에 덮어쓴다. fields 키는 점 경로(예: "stats.무력", "text", "procRate"). announce=true 면 게시판 글도 함께 남긴다.',
  inputSchema: {
    kind: z.enum(['generals', 'skills', 'tier-decks', 'bonds', 'formations']),
    id: z.string().describe('id 또는 이름. 새 항목이면 새 id'),
    fields: z.record(z.unknown()),
    note: z.string().describe('무엇을 어디서 확인했는지'),
    create: z.boolean().optional(),
    announce: z.object({ title: z.string(), body: z.string(), category: z.enum(CATEGORIES) }).optional(),
  },
}, async ({ kind, id, fields, note, create, announce }) => {
  let realId = id;
  if (kind === 'generals') realId = findGeneral(id)?.id || id;
  if (kind === 'skills') realId = findSkill(id)?.id || id;
  if (!create) {
    const { bundle } = ctx();
    const exists = kind === 'generals' ? bundle.generals.some(g => g.id === realId) : kind === 'skills' ? bundle.skills.some(s => s.id === realId)
      : kind === 'tier-decks' ? bundle.tierDecks.some(t => t.id === realId) : bundle.bonds.some(b => b.id === realId);
    if (!exists) return fail(`${kind} 에 ${id} 가 없습니다. 새 항목이면 create=true.`);
  }
  // 전법 원문을 바꾸면 발동 확률·용어도 함께 점검할 수 있게 한국판 용어로 정규화한다
  const termMap = ctx().bundle.termMap;
  const normalized: Record<string, unknown> = {};
  const termNotes: string[] = [];
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string') {
      const r = normalizeKo(v, termMap);
      normalized[k] = r.text;
      r.replaced.forEach(x => termNotes.push(`${k}: ${x.from}→${x.to}`));
    } else normalized[k] = v;
  }
  const file = join(DATA, 'patches', `${kind}.json`);
  const data = readJson<any>(file, { items: {} });
  data.items[realId] = [...(data.items[realId] || []), { date: new Date().toISOString().slice(0, 10), note, create: !!create, fields: normalized }];
  writeJson(file, data);
  invalidate();
  const post = announce ? postBoard({ ...announce, refs: [realId], source: note }) : null;
  invalidate();
  return text({ patched: { kind, id: realId, fields: normalized }, termNotes, boardPost: post, next: 'bundle_rebuild → audit_skill 로 확인 후 커밋하세요.' });
});

server.registerTool('deck_recommend', {
  title: '덱 추천 (1~5덱)',
  description: '보유 무장·전법으로 티어덱 기준 1~5덱을 추천한다. 전법은 전체 1회(R-006), 무장도 한 부대에만. 메타 덱 상대 시뮬로 검증해 고른다.',
  inputSchema: {
    generals: z.array(z.string()).describe('보유 무장 이름/id. ["전체"] 면 전부 보유로 가정'),
    skills: z.array(z.string()).describe('보유 전법 이름/id (고유 전법 제외). ["전체"] 면 전부'),
    count: z.number().int().min(1).max(5).optional(),
    allowGeneralSub: z.boolean().optional(),
    validateRuns: z.number().int().min(0).max(200).optional().describe('메타 상대당 시뮬 판 수 (0=검증 생략, 기본 30)'),
  },
}, async ({ generals, skills, count, allowGeneralSub, validateRuns }) => {
  const { bundle } = ctx();
  const gs = generals.length === 1 && generals[0] === '전체' ? bundle.generals.map(g => g.id) : generals.map(x => findGeneral(x)?.id).filter(Boolean) as string[];
  const ss = skills.length === 1 && skills[0] === '전체' ? bundle.skills.filter(s => !s.isUnique).map(s => s.id) : skills.map(x => findSkill(x)?.id).filter(Boolean) as string[];
  const alternatives = readJson<any>(join(DATA, 'reference', 'decklab', 'decks.json')).tacticAlternativeAssessments;
  const runs = validateRuns ?? 30;
  const r = new Recommender(bundle).recommend({ owned: { generals: gs, skills: ss }, count: count ?? 5, allowGeneralSub, alternatives, validate: runs ? { opponents: 3, runs, candidates: 6 } : undefined });
  const name = (id: string) => bundle.generals.find(g => g.id === id)?.name.ko || bundle.skills.find(s => s.id === id)?.name.ko || id;
  return text({
    notes: r.unusedNotes,
    decks: r.decks.map((d, i) => ({
      rank: i + 1, tierDeck: `${d.tier} ${d.name}`, fidelity: Math.round(d.fidelity * 100) + '%', metaWinRate: d.validation ? Math.round(d.validation.avgWinRate * 100) + '%' : null,
      units: d.units.map(u => ({ general: name(u.generalId), skills: u.skillIds.map(name), manual: bundle.generals.find(g => g.id === u.generalId)?.manuals.find(m => m.id === u.manualId)?.name, substitutions: u.subs, empty: u.missing })),
      vsMeta: d.validation?.opponents.map(o => `${o.name} ${Math.round(o.winRate * 100)}%`),
    })),
  });
});

server.registerTool('verification_list', {
  title: '전보 검증 대기 목록',
  description: '근사 처리한 금병법·전법·엔진 가정 중 전보 녹화로 확인해야 할 항목 (R-007). 사용자가 전보를 올리면 이 목록과 대조한다.',
  inputSchema: { status: z.enum(['pending', 'verified', 'rejected']).optional(), ref: z.string().optional().describe('무장·전법 이름 또는 id 로 좁히기') },
}, async ({ status, ref }) => {
  buildQueue({ ...ctx().bundle });
  let items = loadQueue();
  if (status) items = items.filter(i => i.status === status);
  if (ref) {
    const ids = new Set([findGeneral(ref)?.id, findGeneral(ref)?.uniqueSkillId, findSkill(ref)?.id].filter(Boolean) as string[]);
    items = items.filter(i => i.refs.some(r => ids.has(r)) || i.title.includes(ref));
  }
  return text({ total: items.length, items });
});

server.registerTool('verification_plan', {
  title: '검증 전투 짜기',
  description: '사용자 보유 무장·전법으로 검증 대기 항목을 가장 적은 전투 수에 담은 녹화용 부대를 짠다. 보유 목록은 웹 보유 탭 "복사해서 내보내기" JSON 을 그대로 넘겨도 된다.',
  inputSchema: {
    generals: z.array(z.string()).describe('보유 무장 이름/id (["전체"] 가능)'),
    skills: z.array(z.string()).describe('보유 전법 이름/id (["전체"] 가능)'),
  },
}, async ({ generals, skills }) => {
  const { bundle } = ctx();
  const gs = generals[0] === '전체' ? bundle.generals.map(g => g.id) : generals.map(x => findGeneral(x)?.id).filter(Boolean) as string[];
  const ss = skills[0] === '전체' ? bundle.skills.filter(s => !s.isUnique).map(s => s.id) : skills.map(x => findSkill(x)?.id).filter(Boolean) as string[];
  const p = planVerification(bundle, buildQueue({ ...bundle }), { generals: gs, skills: ss });
  const gn = (id: string) => bundle.generals.find(g => g.id === id);
  return text({
    summary: `검증 대기 ${p.total}개 중 ${p.covered}개를 ${p.battles.length}판으로`,
    battles: p.battles.map((b, i) => ({
      battle: i + 1,
      units: b.units.map(u => ({ general: gn(u.generalId)?.name.ko, manual: gn(u.generalId)?.manuals.find(m => m.id === u.manualId)?.name ?? '자유', skills: [0, 1].map(k => (u.skillIds[k] ? bundle.skills.find(s => s.id === u.skillIds[k])?.name.ko : '자유')) })),
      watch: b.items.map(it => `${it.title} — ${it.howToVerify}`),
    })),
    blocked: p.blocked,
  });
});

server.registerTool('verification_resolve', {
  title: '전보 검증 결과 기록',
  description: '전보 녹화로 확인한 결과를 기록한다. rejected 면 엔진 정의를 고쳐야 한다(고친 뒤 audit_skill). announce 로 게시판 글을 함께 남길 수 있다.',
  inputSchema: {
    id: z.string(), status: z.enum(['verified', 'rejected']), result: z.string().describe('전보에서 본 내용'),
    announce: z.boolean().optional(),
  },
}, async ({ id, status, result, announce }) => {
  try {
    const it = resolveItem(id, status, result);
    const post = announce ? postBoard({ title: `[전보 검증] ${it.title} — ${status === 'verified' ? '확인' : '불일치'}`, body: `가정: ${it.assumption}\n전보 결과: ${result}`, category: '전투 규칙', refs: it.refs.filter(r => ctx().bundle.skills.some(s => s.id === r) || ctx().bundle.generals.some(g => g.id === r)), source: '전보 녹화' }) : null;
    invalidate();
    return text({ resolved: it, boardPost: post });
  } catch (e: any) { return fail(e.message); }
});

server.registerTool('bundle_rebuild', {
  title: '웹 데이터 다시 만들기',
  description: 'data/ 변경을 웹(apps/web/public/data/bundle.json)에 반영한다.',
  inputSchema: {},
}, async () => {
  invalidate();
  const { bundle } = ctx();
  const out: any = { ...bundle, verification: buildQueue(bundle), confirmedRules: readJson<any>(join(DATA, 'common', 'confirmed-rules.json')).rules, site: readJson<any>(join(DATA, 'common', 'site.json')) };
  writeJson(join(ROOT, 'apps', 'web', 'public', 'data', 'bundle.json'), out);
  return text({ dataVersion: bundle.dataVersion, generals: bundle.generals.length, skills: bundle.skills.length, posts: bundle.changelog.length });
});

await server.connect(new StdioServerTransport());
