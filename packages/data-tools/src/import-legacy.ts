// v1.12b 단일 HTML 의 GAME_DATA → data/engine/*.json
//
// data/kr/ (엑셀 원본) 과 분리해 둔다. 엑셀을 다시 가져와도 엔진 정의 작업분이 지워지지 않게 하기 위함.
//   data/engine/skills.json     전법 id → v1.12b 효과 정의 (effects, trigger, prepTurns …)
//   data/engine/generals.json   무장 id → 성별, v1.12b 스탯(보정 실험에 쓰인 값)
//   data/engine/bonds.json      인연 id → v1.12b 파싱 결과
//   data/engine/formations.json 진형 이름 → v1.12b 효과
//
// 사용: tsx src/import-legacy.ts [v1.12b.html]   (기본: legacy/simulator-v1.12b.html)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, DATA, KR, readJson, writeJson } from './paths.ts';

const file = process.argv[2] || join(ROOT, 'legacy', 'simulator-v1.12b.html');
const html = readFileSync(file, 'utf8');

function extractJsonAfter(marker: string): any {
  const i = html.indexOf(marker);
  if (i < 0) throw new Error(`${marker} 없음`);
  let depth = 0, start = -1, inStr = false, esc = false;
  for (let j = i + marker.length; j < html.length; j++) {
    const c = html[j];
    if (start < 0) { if (c === '{') { start = j; depth = 1; } continue; }
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return JSON.parse(html.slice(start, j + 1));
  }
  throw new Error('JSON 끝을 찾지 못함');
}

const G = extractJsonAfter('window.GAME_DATA =');
const krGenerals = readJson<any[]>(join(KR, 'generals.json'));
const krSkills = readJson<any[]>(join(KR, 'skills.json'));
const krBonds = readJson<any[]>(join(KR, 'bonds.json'));

const genIdByName = new Map(krGenerals.map(g => [g.name.ko, g.id]));
const skillIdByName = new Map(krSkills.filter(s => !s.isUnique).map(s => [s.name.ko, s.id]));
// 엑셀 이름과 v1.12b 이름이 다른 경우(띄어쓰기 등)를 대비해 공백 제거 키도 둔다
const squash = (x: string) => x.replace(/\s+/g, '');
const skillIdBySquash = new Map(krSkills.filter(s => !s.isUnique).map(s => [squash(s.name.ko), s.id]));

const ENGINE_KEYS_DROP = new Set(['id', 'name', 'usedByGeneral', 'isUnique', 'grade', 'type', 'trait', 'procRate', 'nameOrig']);
function engineDef(sk: any) {
  const out: Record<string, unknown> = { legacyId: sk.id, legacyName: sk.name, legacyType: sk.type, legacyProcRate: sk.procRate };
  for (const [k, v] of Object.entries(sk)) if (!ENGINE_KEYS_DROP.has(k)) out[k] = v;
  return out;
}

const skills: Record<string, unknown> = {};
const unmatched: string[] = [];
for (const sk of G.skills) {
  const id = skillIdByName.get(sk.name) || skillIdBySquash.get(squash(sk.name));
  if (!id) { unmatched.push(`전법 ${sk.name}`); continue; }
  skills[id] = engineDef(sk);
}
for (const sk of G.uniqueSkills) {
  const gid = genIdByName.get(sk.usedByGeneral);
  if (!gid) { unmatched.push(`고유 ${sk.name}(${sk.usedByGeneral})`); continue; }
  skills[`u-${gid}`] = engineDef(sk);
}

const generals: Record<string, unknown> = {};
for (const g of G.generals) {
  const id = genIdByName.get(g.name);
  if (!id) { unmatched.push(`무장 ${g.name}`); continue; }
  generals[id] = { gender: g.gender, legacyStats: g.stats, legacyRole: g.role, legacyPosition: g.position };
}

const bonds: Record<string, unknown> = {};
for (const b of G.bonds) {
  const kb = krBonds.find(x => x.name === b.name);
  if (!kb) { unmatched.push(`인연 ${b.name}`); continue; }
  bonds[kb.id] = { parsed: b.parsed, simulatable: b.simulatable, legacyMembersInRoster: b.membersInRoster };
}

const formations: Record<string, unknown> = {};
for (const f of G.formations) formations[f.name] = { legacyHitRate: f.hitRate, effects: f.effects, traits: f.traits };

const out = join(DATA, 'engine');
writeJson(join(out, 'skills.json'), skills);
writeJson(join(out, 'generals.json'), generals);
writeJson(join(out, 'bonds.json'), bonds);
writeJson(join(out, 'formations.json'), formations);
writeJson(join(out, 'glossary-v1.12b.json'), extractJsonAfter('window.GLOSSARY ='));
console.log(`v1.12b → 전법 ${Object.keys(skills).length} · 무장 ${Object.keys(generals).length} · 인연 ${Object.keys(bonds).length} · 진형 ${Object.keys(formations).length}`);
if (unmatched.length) console.log('연결 실패:', unmatched.join(', '));
