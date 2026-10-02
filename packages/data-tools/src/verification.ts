// 전보 녹화 검증 대기 목록 (R-007)
//   근사 처리한 금병법·전법·엔진 가정을 한곳에 모은다. 상태(대기/확인/기각)는 다시 만들어도 유지된다.
import { join } from 'node:path';
import { DATA, readJson, writeJson } from './paths.ts';

export interface VerificationItem {
  id: string;
  kind: 'manual' | 'skill' | 'clause' | 'engine';
  /** 관련 무장·전법 id */
  refs: string[];
  title: string;
  assumption: string;
  howToVerify: string;
  status: 'pending' | 'verified' | 'rejected';
  result?: string;
  resolvedAt?: string;
}

const FILE = join(DATA, 'verification', 'queue.json');

export function loadQueue(): VerificationItem[] {
  return readJson<{ items: VerificationItem[] }>(FILE, { items: [] }).items;
}

/** 현재 데이터에서 검증 대상을 다시 모으고, 기존 판정은 id 로 이어받는다 */
export function buildQueue(bundle: any): VerificationItem[] {
  const prev = new Map(loadQueue().map(i => [i.id, i]));
  const items: VerificationItem[] = [];
  const keep = (it: Omit<VerificationItem, 'status'>) => {
    const p = prev.get(it.id);
    items.push({ ...it, status: p?.status || 'pending', result: p?.result, resolvedAt: p?.resolvedAt });
  };
  for (const g of bundle.generals) for (const m of g.manuals || []) {
    if (m.status !== 'approx') continue;
    keep({ id: `V-manual-${m.id}`, kind: 'manual', refs: [g.id, g.uniqueSkillId], title: `${g.name.ko} 금병법〈${m.name}〉`,
      assumption: m.note || '근사 반영', howToVerify: `${g.name.ko}이(가) 〈${m.name}〉을 장착한 전보에서 원문 효과("${m.text.slice(0, 60)}…")가 실제로 어떻게 찍히는지 확인` });
  }
  for (const s of bundle.skills) {
    const eng = s.engine || {};
    if (eng.authored && eng.authoredStatus === 'approx') {
      keep({ id: `V-skill-${s.id}`, kind: 'skill', refs: [s.id], title: `${s.name.ko}${s.isUnique ? ' (고유)' : ''}`,
        assumption: eng.authoredNote || '근사 반영', howToVerify: `【${s.name.ko}】이(가) 발동한 전보에서 근사 항목(${eng.authoredNote || '원문 대조'})을 확인` });
    }
    for (const c of s.clauses || []) {
      if (c.status !== 'approx') continue;
      keep({ id: `V-clause-${s.id}-${c.idx}`, kind: 'clause', refs: [s.id], title: `${s.name.ko} — "${c.text.slice(0, 30)}…"`,
        assumption: c.reviewed || '근사 반영', howToVerify: `【${s.name.ko}】 전보에서 이 절의 수치·대상·지속을 확인` });
    }
  }
  for (const e of readJson<any>(join(DATA, 'verification', 'engine-assumptions.json'), { items: [] }).items) {
    keep({ id: `V-engine-${e.key}`, kind: 'engine', refs: e.refs || [], title: e.title, assumption: e.assumption, howToVerify: e.howToVerify });
  }
  writeJson(FILE, { note: '전보 녹화 검증 대기 목록 (R-007). status: pending=대기, verified=전보로 확인, rejected=틀림(수정 필요). MCP verification_resolve 로 판정을 기록한다.', items });
  return items;
}

export function resolveItem(id: string, status: 'verified' | 'rejected', result: string) {
  const items = loadQueue();
  const it = items.find(i => i.id === id);
  if (!it) throw new Error(`검증 항목 없음: ${id}`);
  it.status = status; it.result = result; it.resolvedAt = new Date().toISOString().slice(0, 10);
  writeJson(FILE, { note: '전보 녹화 검증 대기 목록 (R-007). status: pending=대기, verified=전보로 확인, rejected=틀림(수정 필요). MCP verification_resolve 로 판정을 기록한다.', items });
  return it;
}
