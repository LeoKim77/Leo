// 전보 녹화 검증 대기 목록 (R-007)
//   근사 처리한 금병법·전법·엔진 가정을 한곳에 모은다. 상태(대기/확인/기각)는 다시 만들어도 유지된다.
import { join } from 'node:path';
import { DATA, readJson, writeJson } from './paths.ts';

export interface VerificationItem {
  id: string;
  /** capture: 전투 없이 게임 정보 화면 캡처로 확인하는 자료(능력치·병종·이름·원문) */
  kind: 'manual' | 'skill' | 'clause' | 'engine' | 'rate' | 'capture';
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
  // 시즌 시트로 들어온 신규 카드의 임시값·추정값 (자료가 공개되면 교체)
  const FIELD: Record<string, string> = { stats: '능력치', unitType: '병종', row: '배치(전열/후열)', faction: '진영', name: '이름', kind: '전법 종류', text: '원문', procRate: '발동률' };
  for (const g of bundle.generals) {
    const ds = g.dataStatus || {};
    const fields = Object.keys(ds).filter(k => /임시|미확인|추정/.test(ds[k]));
    if (fields.length) keep({ id: `V-capture-${g.id}`, kind: 'capture', refs: [g.id], title: `${g.name.ko} 무장 정보`,
      assumption: fields.map(k => `${FIELD[k] || k}: ${ds[k]}`).join(' · '), howToVerify: `게임 무장 정보 화면(능력치·병종·배치) 캡처 1장` });
  }
  for (const s of bundle.skills) {
    const ds = s.dataStatus || {};
    if (ds.procRate) keep({ id: `V-rate-${s.id}`, kind: 'rate', refs: [s.id], title: `${s.name.ko}${s.isUnique ? ' (고유)' : ''} 발동률`,
      assumption: ds.procRate, howToVerify: `【${s.name.ko}】 전법 정보 캡처(발동률 표기) 또는 이 전법을 쓴 전보 여러 판의 발동 횟수` });
    const cap = Object.keys(ds).filter(k => k !== 'procRate' && /미확인|추정|확인 필요|번역/.test(ds[k]));
    if (cap.length) keep({ id: `V-capture-${s.id}`, kind: 'capture', refs: [s.id], title: `${s.name.ko}${s.isUnique ? ' (고유)' : ''} 전법 정보`,
      assumption: cap.map(k => `${FIELD[k] || k}: ${ds[k]}`).join(' · '), howToVerify: `게임 전법 정보 화면(이름·종류·발동률·10레벨 설명) 캡처 1장` });
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
