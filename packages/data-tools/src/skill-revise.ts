// 전법 함수 파일 손보기: pnpm skill:revise <수정안.json>
// 수정안 = { "<전법 id>": { note, set?: { "effects.damage.0.tag": "hit", ... }, unset?: ["effects.statusEffects.1"],
//                          clauses?: { "<절 번호>": "ok" | "approx" | ... }, run?: "c.damage(0);\n..." } }
//   set/unset 경로는 def 기준(점으로 구분, 배열은 번호). unset 한 배열 항목은 빠진다.
//   run 은 run(c) 본문(줄마다 원문 절 주석을 단다). 적용하면 revised 에 날짜·사유가 쌓인다.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildBundle } from './bundle.ts';
import { render, writeIndex, DIR } from './gen-skill-funcs.ts';
import { SKILL_MODULES } from '../../engine/src/skills/index.ts';

function setPath(o: any, path: string, v: any) {
  const ks = path.split('.');
  let cur = o;
  ks.slice(0, -1).forEach((k, i) => { if (cur[k] == null) cur[k] = /^\d+$/.test(ks[i + 1]) ? [] : {}; cur = cur[k]; });
  cur[ks[ks.length - 1]] = v;
}
function unsetPath(o: any, path: string) {
  const ks = path.split('.');
  let cur = o;
  for (const k of ks.slice(0, -1)) { cur = cur?.[k]; if (cur == null) return; }
  const last = ks[ks.length - 1];
  if (Array.isArray(cur)) cur.splice(+last, 1); else delete cur[last];
}

export function revise(fixes: Record<string, any>, date = new Date().toISOString().slice(0, 10)) {
  const bundle: any = buildBundle();
  const done: string[] = [];
  for (const [id, f] of Object.entries(fixes)) {
    const m = SKILL_MODULES[id];
    const s = bundle.skills.find((x: any) => x.id === id);
    if (!m || !s) throw new Error(`전법 없음: ${id}`);
    const def: any = structuredClone(m.def) || { effects: {} };
    for (const [p, v] of Object.entries(f.set || {})) setPath(def, p, v);
    // 배열 항목 삭제는 뒤 번호부터 해야 앞 번호가 밀리지 않는다
    for (const p of [...(f.unset || [])].sort().reverse()) unsetPath(def, p);
    const clauses = structuredClone(m.clauses);
    for (const [i, st] of Object.entries(f.clauses || {})) {
      if (typeof st === 'string') clauses[+i].status = st as any;
      else Object.assign(clauses[+i], st);
    }
    const revised = [...(m.revised || []), { date, note: f.note }];
    // run 을 주지 않으면: 이미 손본 파일은 지금 파일의 run 본문을 그대로 두고, 아니면 정의에서 다시 만든다
    let runBody = f.run;
    if (runBody == null && m.revised?.length) {
      const src = readFileSync(join(DIR, `${id}.ts`), 'utf8');
      const mm = src.match(/\n  run\(c\) \{\n([\s\S]*?)\n  \},\n\}\);\s*$/);
      if (mm) runBody = mm[1];
    }
    // engineStatus: 직접 작성 전법의 상태(ok/approx/unsupported) — 수정안에 있으면 바꾼다
    const es = f.engineStatus !== undefined ? f.engineStatus : m.engineStatus;
    writeFileSync(join(DIR, `${id}.ts`), render({ ...s, engineStatus: es }, { def, clauses, revised, runBody }));
    done.push(id);
  }
  writeIndex();
  return done;
}

if (process.argv[1]?.endsWith('skill-revise.ts')) {
  const fixes = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const done = revise(fixes, process.argv[3]);
  console.log(`손본 전법 ${done.length}개: ${done.join(', ')}`);
}
