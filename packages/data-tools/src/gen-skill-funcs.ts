// 전법 함수 파일 생성기.
//   pnpm gen:skills            — 함수 파일이 없는 전법만 새로 만든다(이미 있는 파일은 손대지 않는다 — 직접 고친 함수 보호)
//   pnpm gen:skills --force id — 그 전법 파일을 JSON 원천(skills.json·overrides·authored)으로 다시 만든다
// 만든 뒤엔 packages/engine/src/skills/<id>.ts 가 정본이다. 새 전법·수정은 이 파일을 고친다.
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBundle } from './bundle.ts';

export const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'engine', 'src', 'skills');
const RESERVED = new Set(['index', 'types']);
const ORDER = ['statMods', 'damage', 'heal', 'buffs', 'dispel', 'statusEffects', 'grants'] as const;
const CALL: Record<string, string> = { statMods: 'statMod', damage: 'damage', heal: 'heal', buffs: 'buff', dispel: 'dispel', statusEffects: 'status', grants: 'grant' };

const pct = (v: any) => (typeof v === 'number' ? `${Math.round(v * 1000) / 10}%` : '');
function describe(kind: string, x: any): string {
  if (typeof x === 'string') return x;
  if (!x || typeof x !== 'object') return '';
  const range = x.min != null ? (x.max != null && x.max !== x.min ? `${pct(x.min)}→${pct(x.max)}` : pct(x.max ?? x.min)) : '';
  const bits: string[] = [];
  if (kind === 'damage') bits.push(`${x.dmgType || ''} ${range}`.trim());
  else if (kind === 'heal') bits.push(`치유율 ${range}`);
  else if (kind === 'buffs') bits.push(`${x.stat} ${x.min != null ? (x.min > 0 ? '+' : '') + range : ''}`.trim());
  else if (kind === 'statMods') bits.push(`${x.stat} ${x.min ?? x.value ?? ''}${x.max != null && x.max !== x.min ? '→' + x.max : ''}`);
  else if (kind === 'statusEffects') bits.push(x.name || (x.oneOf ? x.oneOf.join('/') : ''));
  else if (kind === 'dispel') bits.push(`디버프 ${x.count || 1}가지 제거`);
  else if (kind === 'grants') bits.push(`「${x.key || x.skill?.name || ''}」 부여`);
  if (x.target) bits.push(`대상 ${x.target}`);
  if (x.actor) bits.push(`공격자 ${x.actor}`);
  if (x.chance != null) bits.push(`확률 ${pct(x.chance)}${x.chanceOnce ? '(1회 판정)' : ''}`);
  if (x.duration != null) bits.push(`${x.duration === 999 ? '전투 종료까지' : x.duration + '턴'}`);
  if (x.maxStacks) bits.push(`최대 ${x.maxStacks}중첩`);
  if (x.condition) bits.push(`조건 ${x.condition.type}`);
  return bits.join(', ');
}

function renderRun(def: any, clauses: any[]): string {
  const eff = def.effects || {};
  const order = def.statusFirst ? ['statusEffects', ...ORDER.filter(k => k !== 'statusEffects')] : [...ORDER];
  const lines: string[] = [];
  let lastClause = -2;
  for (const k of order) {
    (eff[k] || []).forEach((item: any, i: number) => {
      const path = `${k}[${i}]`;
      const ci = clauses.findIndex(c => (c.impl || []).includes(path));
      // 절 매핑이 없는 항목은 바로 앞 절에 이어 붙인다(같은 절의 두 번째 피해 등)
      if (ci >= 0 && ci !== lastClause) { lines.push(`    // 「${clauses[ci].text}」`); lastClause = ci; }
      else if (ci < 0 && lastClause === -2) { lines.push('    // (원문 절 매핑 없음)'); lastClause = -1; }
      lines.push(`    c.${CALL[k]}(${i});${describe(k, item) ? `   // ${describe(k, item)}` : ''}`);
    });
  }
  if (eff.guardAllies) lines.push('    c.guard();   // 보호 상태(대신 받기)');
  if (!lines.length) lines.push('    // 실행할 효과 없음 (상시 효과·트리거·특수 처리만 있는 전법)');
  return lines.join('\n');
}

const json = (v: any) => JSON.stringify(v, null, 2).replace(/\n/g, '\n  ');

/** 번들의 전법(s) → 파일 내용. 손본 파일을 다시 쓸 때는 extra 로 def·clauses·revised·runBody 를 넘긴다 */
export function render(s: any, extra: { def?: any; clauses?: any[]; revised?: any[]; runBody?: string } = {}): string {
  // def.clauses 는 v1.12b 절 분석(엔진이 '(○○의 영향 받음)' 연결에 씀)이라 그대로 둔다. 한국판 절 구현 상태는 아래 clauses
  const def = extra.def !== undefined ? extra.def : (s.engine ? structuredClone(s.engine) : null);
  if (def) delete def.fn;
  const clauses = extra.clauses || (s.clauses || []).map((c: any) => ({ text: c.text, status: c.status, ...(c.impl?.length ? { impl: c.impl } : {}), ...(c.reviewed ? { reviewed: c.reviewed } : {}) }));
  const head = [
    `// ${s.name.ko} · ${s.isUnique ? '고유 전법' : '전법'} · ${s.kind}${s.procRateText ? ' ' + s.procRateText : ''}`,
    `// 원문: ${s.text || '(원문 없음)'}`,
    `// 원문 절 구현: ${clauses.map((c: any) => c.status).join(' / ') || '-'}`,
  ].join('\n');
  const runBody = extra.runBody != null ? extra.runBody.replace(/^\n+|\s+$/g, '') : (def ? renderRun(def, clauses) : '');
  return `${head}
import { defineSkill } from './types.ts';

export default defineSkill({
  id: ${JSON.stringify(s.id)},
  name: ${JSON.stringify(s.name.ko)},
  kind: ${JSON.stringify(s.kind)},
  isUnique: ${!!s.isUnique},
${s.engineStatus ? `  engineStatus: ${json(s.engineStatus)},\n` : ''}${extra.revised?.length ? `  revised: ${json(extra.revised)},\n` : ''}  clauses: ${json(clauses)},
  def: ${json(def)},
${def ? `  run(c) {\n${runBody}\n  },\n` : ''}});
`;
}

export function writeIndex() {
  const ids = readdirSync(DIR).filter(f => f.endsWith('.ts') && !RESERVED.has(f.slice(0, -3))).map(f => f.slice(0, -3)).sort();
  const lines = ['// 자동 생성 — pnpm gen:skills (전법 함수 파일 목록)', "import type { SkillModule } from './types.ts';"];
  ids.forEach((id, i) => lines.push(`import m${i} from './${id}.ts';`));
  lines.push('', 'export const SKILL_MODULES: Record<string, SkillModule> = Object.fromEntries(', `  [${ids.map((_, i) => `m${i}`).join(', ')}].map(m => [m.id, m]),`, ');', '');
  writeFileSync(join(DIR, 'index.ts'), lines.join('\n'));
  return ids.length;
}

if (process.argv[1]?.endsWith('gen-skill-funcs.ts')) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const only = args.filter(a => !a.startsWith('--'));
  const bundle: any = buildBundle({ fromJson: true });
  let made = 0;
  for (const s of bundle.skills) {
    if (only.length && !only.includes(s.id)) continue;
    const file = join(DIR, `${s.id}.ts`);
    if (existsSync(file) && !force) continue;
    writeFileSync(file, render(s));
    made++;
  }
  const n = writeIndex();
  console.log(`전법 함수 파일 ${made}개 생성 · 전체 ${n}개`);
}
