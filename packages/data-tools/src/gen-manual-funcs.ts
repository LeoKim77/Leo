// 금병법 함수 파일 생성기 (전법 함수 생성기와 같은 방식).
//   pnpm gen:manuals            — 함수 파일이 없는 금병법만 새로 만든다(이미 있는 파일은 손대지 않는다)
//   pnpm gen:manuals --force id — 그 금병법 파일을 data/engine/manuals.json 원천으로 다시 만든다
// 만든 뒤엔 packages/engine/src/manuals/<id>.ts 가 정본이다. 새 금병법·수정은 이 파일을 고친다.
//   수정은 pnpm manual:revise <수정안.json> (형식은 manual-revise.ts 머리말)
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBundle, splitClauses } from './bundle.ts';
import { renderRun } from './gen-skill-funcs.ts';

export const MDIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'engine', 'src', 'manuals');
const RESERVED = new Set(['index', 'types']);
/** 본문 줄들의 공통 들여쓰기를 뺀다 */
const dedent = (t: string) => {
  const lines = t.replace(/^\n+|\s+$/g, '').split('\n');
  const ind = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)![0].length));
  return lines.map(l => l.slice(Number.isFinite(ind) ? ind : 0)).join('\n');
};
const json = (v: any) => JSON.stringify(v, null, 2).replace(/\n/g, '\n  ');

/** 금병법(m: 번들 무장의 manuals 항목) → 파일 내용. 손본 파일을 다시 쓸 때는 extra 로 넘긴다 */
export function renderManual(g: any, m: any, extra: { def?: any; status?: string; note?: string; clauses?: any[]; revised?: any[]; runBodies?: Array<string | null> } = {}): string {
  const def = extra.def !== undefined ? extra.def : structuredClone(m.engine || {});
  for (const k of Object.keys(def)) if (def[k] === undefined) delete def[k];
  delete def.fn;
  const status = extra.status || m.status;
  const note = extra.note !== undefined ? extra.note : m.note;
  // 처음 만들 때 절 상태: 원문대로(ok) → 모두 ok, 근사 → 모두 approx, 미지원 → missing (원문 대조에서 절별로 고친다)
  const first = status === 'ok' ? 'ok' : status === 'approx' ? 'approx' : 'missing';
  const clauses = extra.clauses || splitClauses(m.text || '').map(t => ({ text: t, status: first }));
  const parts: any[] = def.parts || [];
  const runs = parts.map((p, i) => {
    const body = dedent(extra.runBodies?.[i] != null ? extra.runBodies[i]! : renderRun(p, []).replace('    // (원문 절 매핑 없음)\n', ''));
    return `    // parts[${i}]${p.trigger?.event ? ` — 계기 ${p.trigger.event}` : p._timing ? ` — 시점 ${p._timing}` : ''}\n    (c) => {\n${body.replace(/^(?=.)/gm, '      ')}\n    },`;
  });
  const head = [
    `// ${g.name?.ko || g.id} 금병법〈${m.name}〉 · ${status}`,
    `// 원문: ${m.text || '(원문 없음)'}`,
    `// 원문 절 구현: ${clauses.map((c: any) => c.status).join(' / ') || '-'}`,
  ].join('\n');
  return `${head}
import { defineManual } from './types.ts';

export default defineManual({
  id: ${JSON.stringify(m.id)},
  generalId: ${JSON.stringify(g.id)},
  name: ${JSON.stringify(m.name)},
  status: ${JSON.stringify(status)},
${note ? `  note: ${JSON.stringify(note)},\n` : ''}${extra.revised?.length ? `  revised: ${json(extra.revised)},\n` : ''}  clauses: ${json(clauses)},
  def: ${json(def)},
${runs.length ? `  runs: [\n${runs.join('\n')}\n  ],\n` : ''}});
`;
}

export function writeManualIndex() {
  const ids = readdirSync(MDIR).filter(f => f.endsWith('.ts') && !RESERVED.has(f.slice(0, -3))).map(f => f.slice(0, -3)).sort();
  const lines = ['// 자동 생성 — pnpm gen:manuals (금병법 함수 파일 목록)', "import type { ManualModule } from './types.ts';"];
  ids.forEach((id, i) => lines.push(`import m${i} from './${id}.ts';`));
  lines.push('', 'export const MANUAL_MODULES: Record<string, ManualModule> = Object.fromEntries(', `  [${ids.map((_, i) => `m${i}`).join(', ')}].map(m => [m.id, m]),`, ');', '');
  writeFileSync(join(MDIR, 'index.ts'), lines.join('\n'));
  return ids.length;
}

if (process.argv[1]?.endsWith('gen-manual-funcs.ts')) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const only = args.filter(a => !a.startsWith('--'));
  const bundle: any = buildBundle({ fromJson: true });
  let made = 0;
  for (const g of bundle.generals) for (const m of g.manuals || []) {
    if (!m.engine) continue;   // 정의 없는 금병법(원문 미확인·장서각 미제공)은 원문이 오면 manuals.json 에 넣고 만든다
    if (only.length && !only.includes(m.id)) continue;
    const file = join(MDIR, `${m.id}.ts`);
    if (existsSync(file) && !force) continue;
    writeFileSync(file, renderManual(g, m));
    made++;
  }
  const n = writeManualIndex();
  console.log(`금병법 함수 파일 ${made}개 생성 · 전체 ${n}개`);
}
