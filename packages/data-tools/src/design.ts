// 기획 플랫폼(data/design) 쓰기 — MCP 도구(design_*)와 스크립트가 같이 쓴다.
//   categories.json  카테고리 목록
//   spec.json        규정(정본). 항목마다 history 에 날짜·변경·게시글을 남긴다
//   posts/P-xxxx.json 게시글: 공지·결정·질문·검증요청·변경 (상태 열림 → 답변됨 → 시뮬 반영 / 닫힘)
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA, readJson } from './paths.ts';

export const DESIGN_DIR = join(DATA, 'design');
export const POST_TYPES = ['공지', '결정', '질문', '검증요청', '검증완료', '변경'] as const;
export const POST_STATUS = ['열림', '답변됨', '시뮬 반영', '닫힘'] as const;
export const SPEC_STATUS = ['확정', '녹화확인', '잠정', '결정필요', '참고'] as const;

const today = () => new Date().toISOString().slice(0, 10);
const save = (path: string, v: unknown) => writeFileSync(path, JSON.stringify(v, null, 2) + '\n');

export function designCategories(): Array<{ id: string; title: string; desc: string }> {
  return readJson<any>(join(DESIGN_DIR, 'categories.json')).categories;
}
function specFile() { return readJson<any>(join(DESIGN_DIR, 'spec.json')); }
export function designSpec(): any[] { return specFile().items; }
export function designPosts(): any[] {
  return readdirSync(join(DESIGN_DIR, 'posts')).filter(f => f.endsWith('.json')).sort().map(f => readJson<any>(join(DESIGN_DIR, 'posts', f)));
}
const postPath = (id: string) => join(DESIGN_DIR, 'posts', `${id}.json`);
function checkCat(cat: string) {
  if (!designCategories().some(c => c.id === cat)) throw new Error(`카테고리 없음: ${cat} (가능: ${designCategories().map(c => c.id).join(', ')})`);
}

export function addPost(p: { cat: string; type: string; title: string; body: string; status?: string; specIds?: string[]; rules?: string[]; ask?: string[]; date?: string; links?: Array<{ label: string; url: string }> }) {
  checkCat(p.cat);
  const ids = designPosts().map(x => +x.id.slice(2));
  const id = `P-${String((ids.length ? Math.max(...ids) : 0) + 1).padStart(4, '0')}`;
  const date = p.date || today();
  const rec = { id, date, cat: p.cat, type: p.type, title: p.title, body: p.body, status: p.status || (p.type === '질문' || p.type === '검증요청' ? '열림' : '시뮬 반영'),
    specIds: p.specIds || [], rules: p.rules || [], ...(p.ask?.length ? { ask: p.ask } : {}), ...(p.links?.length ? { links: p.links } : {}), history: [{ date, change: '작성' }] };
  save(postPath(id), rec);
  return rec;
}

export function updatePost(id: string, f: { status?: string; answer?: string; note?: string; specIds?: string[]; rules?: string[] }) {
  const p = designPosts().find(x => x.id === id);
  if (!p) throw new Error(`게시글 없음: ${id}`);
  if (f.status) p.status = f.status;
  if (f.answer) p.answer = p.answer ? `${p.answer}\n${f.answer}` : f.answer;
  if (f.specIds) p.specIds = [...new Set([...(p.specIds || []), ...f.specIds])];
  if (f.rules) p.rules = [...new Set([...(p.rules || []), ...f.rules])];
  p.history = [...(p.history || []), { date: today(), change: f.note || [f.status && `상태 ${f.status}`, f.answer && '결정 기록'].filter(Boolean).join(', ') }];
  save(postPath(id), p);
  return p;
}

/** 규정 추가·수정. 없는 id 면 cat·group·title·rule 이 있어야 새로 만든다 */
export function updateSpec(id: string, f: { cat?: string; group?: string; title?: string; rule?: string; status?: string; basis?: string[]; note?: string; change: string; post?: string }) {
  const file = specFile();
  let it = file.items.find((x: any) => x.id === id);
  if (!it) {
    if (!f.cat || !f.title || !f.rule) throw new Error(`새 규정 ${id} 에는 cat·title·rule 이 필요합니다`);
    checkCat(f.cat);
    it = { id, cat: f.cat, group: f.group || designCategories().find(c => c.id === f.cat)!.title, title: f.title, rule: f.rule, status: f.status || '잠정', basis: f.basis || [], note: f.note || '', history: [] };
    const last = file.items.map((x: any) => x.cat).lastIndexOf(f.cat);
    file.items.splice(last >= 0 ? last + 1 : file.items.length, 0, it);
  } else {
    for (const k of ['cat', 'group', 'title', 'rule', 'status', 'note'] as const) if (f[k] != null) it[k] = f[k];
    if (f.basis) it.basis = [...new Set([...(it.basis || []), ...f.basis])];
  }
  it.history = [...(it.history || []), { date: today(), change: f.change, ...(f.post ? { post: f.post } : {}) }];
  save(join(DESIGN_DIR, 'spec.json'), file);
  return it;
}

/** 확정 규칙(R-xxx) 추가 — data/common/confirmed-rules.json */
export function addConfirmedRule(topic: string, statement: string, applied: string) {
  const path = join(DATA, 'common', 'confirmed-rules.json');
  const file = readJson<any>(path);
  const n = Math.max(...file.rules.map((r: any) => +r.id.slice(2))) + 1;
  const rule = { id: `R-${String(n).padStart(3, '0')}`, date: today(), topic, statement, applied };
  file.rules.push(rule);
  save(path, file);
  return rule;
}

/** 질문·검증요청에 답이 나왔을 때: 게시글 답변 기록 + 규정 갱신 + (선택) 확정 규칙 등록을 한 번에 */
export function resolvePost(id: string, r: { answer: string; specUpdates?: Array<{ id: string; rule?: string; status?: string; note?: string; title?: string; cat?: string; group?: string }>; confirmRule?: { topic: string; statement: string }; simApplied?: boolean }) {
  const rule = r.confirmRule ? addConfirmedRule(r.confirmRule.topic, r.confirmRule.statement, `기획 플랫폼 ${id}`) : null;
  const specs = (r.specUpdates || []).map(u => updateSpec(u.id, { ...u, status: u.status || '확정', basis: rule ? [rule.id] : undefined, change: `${id} 답변 반영${rule ? ` (${rule.id})` : ''}`, post: id }));
  const post = updatePost(id, { status: r.simApplied ? '시뮬 반영' : '답변됨', answer: r.answer, rules: rule ? [rule.id] : undefined, specIds: specs.map(s => s.id) });
  return { post, specs, rule };
}
