// 금병법 함수 파일 손보기: pnpm manual:revise <수정안.json> [날짜]
// 수정안 = { "<금병법 id(m-무장-번호)>": { note, status?, manualNote?, set?: { "parts.0.effects.damage.0.min": 1.2, ... },
//                                        unset?: ["static.mods.주는회복량"], clauses?: { "<절 번호>": "ok" | { status, reviewed } },
//                                        runs?: { "<parts 번호>": "c.damage(0);\n..." } } }
//   set/unset 경로는 def 기준(점으로 구분, 배열은 번호). uniquePatch 는 키에 점이 있어 통째로 넣는다(set: { uniquePatch: {...} }).
//   status 는 금병법 상태(ok/approx/unsupported), manualNote 는 화면에 나오는 메모. 적용하면 revised 에 날짜·사유가 쌓인다.
//   runs 를 주지 않은 parts 는 이미 손본 파일이면 지금 본문을, 아니면 정의에서 다시 만든 본문을 쓴다.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildBundle } from './bundle.ts';
import { renderManual, writeManualIndex, MDIR } from './gen-manual-funcs.ts';
import { MANUAL_MODULES } from '../../engine/src/manuals/index.ts';

function setPath(o: any, path: string, v: any) {
  if (path === 'uniquePatch') { o.uniquePatch = v; return; }
  const ks = path.split('.');
  let cur = o;
  ks.slice(0, -1).forEach((k, i) => { if (cur[k] == null) cur[k] = /^\d+$/.test(ks[i + 1]) ? [] : {}; cur = cur[k]; });
  cur[ks[ks.length - 1]] = v;
}
function unsetPath(o: any, path: string) {
  if (path === 'uniquePatch') { delete o.uniquePatch; return; }
  const ks = path.split('.');
  let cur = o;
  for (const k of ks.slice(0, -1)) { cur = cur?.[k]; if (cur == null) return; }
  const last = ks[ks.length - 1];
  if (Array.isArray(cur)) cur.splice(+last, 1); else delete cur[last];
}

/** 지금 파일의 runs 본문들 (parts 번호 순) */
function currentRunBodies(id: string): string[] {
  const src = readFileSync(join(MDIR, `${id}.ts`), 'utf8');
  const out: string[] = [];
  for (const mm of src.matchAll(/\n    \/\/ parts\[(\d+)\][^\n]*\n    \(c\) => \{\n([\s\S]*?)\n    \},/g)) out[+mm[1]] = mm[2];
  return out;
}

export function reviseManuals(fixes: Record<string, any>, date = new Date().toISOString().slice(0, 10)) {
  const bundle: any = buildBundle();
  const done: string[] = [];
  for (const [id, f] of Object.entries(fixes)) {
    const m = MANUAL_MODULES[id];
    if (!m) throw new Error(`금병법 함수 파일 없음: ${id}`);
    const g = bundle.generals.find((x: any) => x.id === m.generalId);
    const bm = (g?.manuals || []).find((x: any) => x.engine?.fn === id);
    if (!bm) throw new Error(`번들에 연결된 금병법 없음: ${id}`);
    const def: any = structuredClone(m.def);
    for (const [p, v] of Object.entries(f.set || {})) setPath(def, p, v);
    for (const p of [...(f.unset || [])].sort().reverse()) unsetPath(def, p);
    const clauses = structuredClone(m.clauses);
    for (const [i, st] of Object.entries(f.clauses || {})) {
      if (typeof st === 'string') clauses[+i].status = st as any;
      else Object.assign(clauses[+i], st);
    }
    const old = m.revised?.length ? currentRunBodies(id) : [];
    const runBodies = (def.parts || []).map((_: any, i: number) => f.runs?.[i] ?? old[i] ?? null);
    const revised = [...(m.revised || []), { date, note: f.note }];
    writeFileSync(join(MDIR, `${id}.ts`), renderManual(g, { ...bm, id }, {
      def, clauses, revised, runBodies,
      status: f.status || m.status,
      note: f.manualNote !== undefined ? f.manualNote : m.note,
    }));
    done.push(id);
  }
  writeManualIndex();
  return done;
}

if (process.argv[1]?.endsWith('manual-revise.ts')) {
  const fixes = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const done = reviseManuals(fixes, process.argv[3]);
  console.log(`손본 금병법 ${done.length}개: ${done.join(', ')}`);
}
