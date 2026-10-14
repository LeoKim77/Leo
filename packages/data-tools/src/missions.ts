// 녹화 안내(검증 요청) 생성기 — OPS5, 사용자 지정 2026-10-13.
//   "녹화로 알아내야 하는 모든 것"을 한데 모아, 가장 적은 판 수로 모두 확인되게 무장·전법·금병법 편성을 엔진으로 짠다.
//   pnpm missions → data/verification/missions.json → 설계서 '녹화 안내' 한 페이지(검증 자료 페이지들은 따로)
//
//   확인 항목(item)
//     원문 근사·미반영 — 전법·고유 전법·금병법 문장이 실제로 어떻게 적용되는지 (발동 장면 전보 + 툴팁)
//     검증 대기       — 엔진 가정(스탯 영향 계수 등) — 해당 전법이 나오는 장면의 수치 + 시전자 스탯
//     녹화 계획       — 예전 녹화 계획 판의 남은 확인 항목
//     무장 자료       — 50레벨 능력치·성장치·병종·열·등급·고유 전법 상세·금병법 문구 (출전 전 무장 상세 화면)
//     전법 자료       — 한국판 이름·문구·수치·발동률 (출전 전 전법 상세 팝업)
//   편성 최적화(탐욕적 집합 덮기): 한 판에 무장 3명 × (고유 + 전법 2 + 금병법 1). 같은 인물·같은 전법 중복 불가.
//   엔진으로 편성을 실제로 돌려 확인할 전법이 한 판에 나올 확률을 재고, 권장 녹화 판 수를 적는다.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildBundle } from './bundle.ts';
import { DATA, readJson } from './paths.ts';
import { Simulator } from '../../engine/src/index.ts';
import { designPosts, designSpec } from './design.ts';
import { checkReplay, loadReplays } from './replay-check.ts';
import { loadInfluenceFit } from './influence.ts';

type Need = { generals?: string[]; skills?: string[]; manual?: { general: string; name: string } };
type Kind = '스탯 영향 세부' | '원문 근사·미반영' | '검증 대기' | '녹화 계획' | '검증 요청 글' | '스탯 영향' | '무장 자료' | '전법 자료' | '화면 확인';
interface Item { id: string; kind: Kind; text: string; need: Need; weight: number; refs: string[] }

export interface RecDeck {
  no: number; legend: number; hero: number; title: string; formation: string; opponent: string;
  units: Array<{ generalId: string; name: string; unique: string; skills: string[]; skillIds: string[]; manual: string | null; manualId: string | null }>;
  before: string[];                         // 출전 전 화면 녹화(무장 상세·전법 상세)
  checks: Array<{ id: string; kind: string; text: string; refs: string[] }>;
  stats: Array<{ general: string; skill: string; stat: string; what: string }>;   // 이 판에서 재는 스탯 영향 값
  fireRates: Array<{ skill: string; rate: number }>;
  runs: number;                             // 권장 녹화 판 수
  reward: [number, number];
}

const DRIVE_GUIDE = [
  '구글 드라이브 앱(또는 drive.google.com) → ＋ → 업로드 → 녹화 파일 선택',
  '올라간 파일의 ⋮ → 공유 → 일반 액세스를 "링크가 있는 모든 사용자", 역할 "뷰어"로 바꾸기',
  '링크 복사 → 녹화 안내의 해당 판 번호와 함께 제출 (제한됨 상태면 분석할 수 없어 보상이 없습니다)',
];
const HOW_TO = [
  '출전 전: "출전 전 화면"에 적힌 무장 상세 화면(50레벨 능력치·병종·고유 전법·금병법)과 전법 상세 팝업을 1~2초씩 멈춰 녹화',
  '편성은 안내 그대로(무장·전법·금병법·진형). 다르면 그 항목은 확인할 수 없고 보상이 줄어든다',
  '상대는 병영소 NPC(아무 레벨) 또는 유저 대전',
  '전투 후: 통계 화면 → 전보 준비 턴부터 마지막 턴까지 끝까지 스크롤(멈춤 1~2초씩)',
  '확인 항목의 전법이 발동한 줄에서 무장 이름을 눌러 툴팁(능력치·병력·증감)을, 전법 이름을 눌러 상세를 연다',
  '권장 판 수만큼 녹화(확률 전법이 안 나오면 다음 판에서 확인)',
];

export function buildMissions(opts: { simRuns?: number } = {}) {
  const b: any = buildBundle();
  const sim = new Simulator(b);
  const plan = readJson<any>(join(DATA, 'verification', 'recording-plan.json'));
  const assumptions = readJson<any>(join(DATA, 'verification', 'engine-assumptions.json')).items;
  const queue = readJson<any>(join(DATA, 'verification', 'queue.json'), { items: [] }).items;
  const closed = new Set(queue.filter((q: any) => ['verified', 'rejected', 'resolved', 'done'].includes(q.status)).map((q: any) => String(q.id).replace(/^V-engine-/, '')));

  const released = (g: any) => g && g.krRelease !== '미출시';
  const gens: any[] = b.generals.filter(released);
  const gById = new Map<string, any>(b.generals.map((g: any) => [g.id, g]));
  const sById = new Map<string, any>(b.skills.map((s: any) => [s.id, s]));
  const sq = (x: string) => x.replace(/\s+/g, '');
  const sByName = new Map<string, any>(b.skills.map((s: any) => [sq(s.name.ko), s]));
  const normalSkills = b.skills.filter((s: any) => !s.isUnique && s.engine && s.krRelease !== '미출시');
  const unreleased: string[] = [];
  // 티어덱 등장 횟수 — 덱 추천에 많이 쓰이는 것이 먼저
  const use = new Map<string, number>();
  for (const t of b.tierDecks) for (const u of t.units || []) { use.set(u.generalId, (use.get(u.generalId) || 0) + 1); for (const s of u.skillIds || []) use.set(s, (use.get(s) || 0) + 1); }
  const pop = (id: string) => 1 + Math.min(3, (use.get(id) || 0) / 4);

  // ── 확인 항목 모으기 ─────────────────────────────────────────
  const items: Item[] = [];
  const skillNeed = (s: any): Need | null => {
    if (!s.isUnique) return { skills: [s.id] };
    const g = gById.get(s.ownerGeneralId);
    if (!released(g)) { unreleased.push(`${s.name.ko}(${g?.name.ko || '?'})`); return null; }
    return { generals: [g.id] };
  };
  for (const s of b.skills) {
    const bad = (s.clauses || []).filter((c: any) => c.status === 'approx' || c.status === 'missing');
    if (!bad.length || s.krRelease === '미출시') continue;
    const need = skillNeed(s); if (!need) continue;
    items.push({ id: `C-${s.id}`, kind: '원문 근사·미반영', weight: 3 * pop(s.id), refs: [s.id], need,
      text: `「${s.name.ko}」 ${bad.map((c: any) => `"${c.text}"`).join(' / ')} — 이 문장이 실제로 어떻게 적용되는지(발동 줄 전후 전보 + 대상 툴팁)` });
  }
  for (const g of gens) (g.manuals || []).forEach((m: any) => {
    const bad = (m.clauses || []).filter((c: any) => c.status === 'approx' || c.status === 'missing');
    if (!bad.length || m.textUnknown) return;
    items.push({ id: `CM-${m.id}`, kind: '원문 근사·미반영', weight: 2 * pop(g.id), refs: [m.id], need: { generals: [g.id], manual: { general: g.id, name: m.name } },
      text: `${g.name.ko}〈${m.name}〉 ${bad.map((c: any) => `"${c.text}"`).join(' / ')} — 실제 적용 장면` });
  });
  for (const a of assumptions) {
    if (closed.has(a.key) || /승품/.test(a.title)) continue;
    const sks = (a.refs || []).map((r: string) => sById.get(r)).filter(Boolean);
    if (!sks.length) continue;
    // 여러 전법 중 하나만 있어도 확인 가능 — 첫 번째로 출시된 것
    const need = sks.map(skillNeed).find(Boolean);
    if (!need) continue;
    items.push({ id: `A-${a.key}`, kind: '검증 대기', weight: 4 + (a.priority || 0) / 20, refs: a.refs, need, text: `${a.title} — ${a.howToVerify}` });
  }
  const entityNeed = (text: string, deckUnits: any[]): Need | null => {
    const gs = deckUnits.map((u: any) => b.generals.find((g: any) => g.name.ko === u[0])).filter(released);
    const found: Need = { generals: [], skills: [] };
    for (const g of gs) if (text.includes(g.name.ko)) found.generals!.push(g.id);
    for (const u of deckUnits) for (const n of u[1] || []) { const s = sByName.get(sq(n)); if (s && text.includes(n)) found.skills!.push(s.id); }
    for (const u of deckUnits) if (u[2] && text.includes(u[2])) { const g = gs.find((x: any) => x.name.ko === u[0]); if (g) { found.generals!.push(g.id); found.manual = { general: g.id, name: u[2] }; } }
    if (!found.generals!.length && !found.skills!.length) { if (!gs.length) return null; found.generals = gs.map((g: any) => g.id); found.skills = deckUnits.flatMap((u: any) => (u[1] || []).map((n: string) => sByName.get(sq(n))?.id).filter(Boolean)); }
    return found;
  };
  for (const bt of plan.battles || []) (bt.checks || []).forEach((c: any, i: number) => {
    if (c.done) return;
    // "원문대로 손본 전법 실행 확인: A, B, C" — 전법마다 따로 발동 장면이 있어야 하므로 전법별 항목으로 나눈다
    const list = /^원문대로 손본 전법 실행 확인:\s*(.+)$/.exec(c.text);
    if (list) {
      for (const n of list[1].split(/,\s*/)) {
        const s = sByName.get(sq(n)); if (!s) continue;
        const need = skillNeed(s); if (!need) continue;
        items.push({ id: `P-${bt.no}-${i}-${s.id}`, kind: '녹화 계획', weight: 2, refs: [s.id], need, text: `원문대로 손본 전법 「${s.name.ko}」 실행 장면(발동 줄 전후 전보)` });
      }
      return;
    }
    const need = entityNeed(c.text, bt.units); if (!need) return;
    items.push({ id: `P-${bt.no}-${i}`, kind: '녹화 계획', weight: 4, refs: c.refs || [], need, text: c.text });
  });
  // 무장 자료 (출전 전 무장 상세 화면)
  const screenOf = new Map<string, string[]>();
  for (const g of gens) {
    const ds = g.dataStatus || {};
    const u = sById.get(g.uniqueSkillId);
    const want: string[] = [];
    if (ds.stats) want.push('50레벨 무력·지력·통솔·선공, 성장치');
    if (ds.unitType || ds.row || ds.faction) want.push('병종·진영·열');
    if (ds.season) want.push('시즌 표시');
    if (!g.grade) want.push('등급 색');
    if (u?.dataStatus) want.push(`고유 전법 「${u.name.ko}」 상세(1/10레벨 수치·승품)`);
    const ms = g.manuals || [];
    if (!ms.length) want.push('금병법 2개 이름·문구'); else if (ms.some((m: any) => m.textUnknown)) want.push(`금병법 ${ms.filter((m: any) => m.textUnknown).map((m: any) => `〈${m.name}〉`).join('·')} 문구`);
    if (!want.length) continue;
    screenOf.set(g.id, want);
    items.push({ id: `G-${g.id}`, kind: '무장 자료', weight: 1 + want.length * 0.4, refs: [g.id], need: { generals: [g.id] }, text: `${g.name.ko} 무장 상세 화면: ${want.join(', ')}` });
  }
  for (const s of normalSkills) {
    if (!s.dataStatus) continue;
    items.push({ id: `S-${s.id}`, kind: '전법 자료', weight: 0.8, refs: [s.id], need: { skills: [s.id] }, text: `전법 「${s.name.ko}」 상세 팝업: 한국판 이름·문구·1/10레벨 수치·발동률·시즌(${Object.values(s.dataStatus).join(' · ')})` });
  }

  // 원문 "(○○의 영향 받음)" — 어느 스탯인지
  const statOf = (s: any): string | null => {
    const m = /\(([^()]*?)의 영향(?:을)? 받/.exec(s.text || '') || /([^(),.]*?)의 영향(?:을)? 받/.exec(s.text || '');
    if (!m) return null;
    const t = m[1].split(/[,%]/).pop()!.replace(/^\s*(추가로|치유율\s*[\d.]+)\s*/, '').trim();
    return t && t.length <= 16 ? t : '능력치';
  };
  // 스탯 영향 값 (J10 잠정) — 전법마다 계수가 같은지. 빈 전법 칸을 채우는 용도라 가중치가 낮다
  for (const s of b.skills) {
    const st = statOf(s); if (!st || s.krRelease === '미출시') continue;
    if (!s.isUnique && !s.engine) continue;
    const need = skillNeed(s); if (!need) continue;
    items.push({ id: `I-${s.id}`, kind: '스탯 영향', weight: 0.6 * pop(s.id), refs: [s.id, 'J10'], need,
      text: `「${s.name.ko}」 ${st}의 영향 — 효과 수치 줄 + 그 순간 시전자 ${st} 툴팁` });
  }
  // 스탯 영향 세부 검증 요청 (FEAT-034: 녹화 표본끼리 어긋나는 전법 — 실행·발동 구간을 자세히)
  for (const r of loadInfluenceFit()?.requests || []) {
    const s = sById.get(r.key.split('@')[0]); if (!s) continue;
    const need = skillNeed(s); if (!need) continue;
    items.push({ id: `IR-${r.key}`, kind: '스탯 영향 세부', weight: 5 * pop(s.id), refs: [s.id, 'J10'], need, text: r.ask });
  }
  // 열린 검증요청·질문 글의 요청 문장 (옛 녹화 계획 판 글은 위 '녹화 계획' 항목으로 이미 들어감)
  const common: Array<{ id: string; kind: string; text: string; refs: string[] }> = [];
  const talk: Array<{ id: string; text: string; refs: string[] }> = [];
  const byLen = [...gens].sort((x, y) => y.name.ko.length - x.name.ko.length);
  const namesIn = (text: string) => {
    let t = text; const gs: string[] = [];
    for (const g of byLen) if (t.includes(g.name.ko)) { gs.push(g.id); t = t.split(g.name.ko).join(' '); }
    const ss = b.skills.filter((s: any) => s.krRelease !== '미출시' && s.name.ko.length >= 2 && text.includes(s.name.ko)).map((s: any) => s.id);
    return { gs, ss };
  };
  for (const p of designPosts()) {
    if (p.status !== '열림' || !['검증요청', '질문'].includes(p.type) || /^녹화 (계획|안내)/.test(p.title)) continue;
    (p.ask?.length ? p.ask : [p.title]).forEach((ask: string, i: number) => {
      const id = `Q-${p.id}-${i + 1}`, text = `${p.title} — ${ask}`, refs = [p.id];
      const battle = /줄|전보|장면|녹화|턴/.test(ask), screen = /캡처|화면|툴팁|문구|상세|승품|병종|표기/.test(ask);
      if (!battle && !screen) { talk.push({ id, text, refs }); return; }
      const { gs, ss } = namesIn(ask);
      const uniq = ss.map((x: string) => sById.get(x)).filter((s: any) => s.isUnique).map((s: any) => s.ownerGeneralId).filter((g: string) => gById.has(g) && released(gById.get(g)));
      const need: Need = { generals: [...new Set([...gs, ...uniq])].slice(0, 3), skills: ss.filter((x: string) => !sById.get(x).isUnique) };
      if (!need.generals!.length && !need.skills!.length) { if (battle) common.push({ id, kind: '검증 요청 글', text, refs }); else items.push({ id, kind: '화면 확인', weight: 0.5, refs, need: {}, text }); return; }
      items.push({ id, kind: battle ? '검증 요청 글' : '화면 확인', weight: battle ? 4 : 1, refs, need, text });
    });
  }
  // 잠정 규정 — 어느 판에서나 같이 확인
  const SPEC_HOW: Record<string, string> = {
    J3: '공격자의 주는 피해 증감(툴팁)과 피해 줄을 같이 — 여러 증가가 겹칠 때 더하는지 곱하는지',
    J4: '피격자의 받는 피해 증감(툴팁)과 피해 줄을 같이 — 여러 감소가 겹칠 때 더하는지 곱하는지',
    J7: '같은 공격자 → 같은 대상, 같은 전법 피해 줄을 여러 번(스탯·증감이 그대로일 때) — 난수 폭',
    J10: '각 판 "스탯 영향 값" 표의 전법 수치 줄 + 시전자 스탯 툴팁',
    L5: '주는 피해 증가 효과가 쌓인 뒤 툴팁 값과 피해 줄',
    C2: '전보 준비 턴(0턴)과 1턴 시작 줄 순서 — 지휘·패시브가 언제 찍히는지',
  };
  for (const sp of designSpec()) if ((sp.status === '잠정' || sp.status === '결정필요') && SPEC_HOW[sp.id]) common.push({ id: `J-${sp.id}`, kind: '잠정 규정', text: `${sp.id} ${sp.title} — ${SPEC_HOW[sp.id]}`, refs: [sp.id] });
  // 역재현 오차가 10% 넘는 계수 — 표본 더
  {
    const rows = loadReplays().flatMap((r: any) => { try { return checkReplay(r, {}, sim).filter((x: any) => x.kind !== 'group'); } catch { return []; } });
    const rms = (f: (x: any) => boolean) => { const e = rows.filter(f).map((x: any) => Math.log(Math.max(x.predicted, 0.01) / x.observed) * 100); return e.length ? { n: e.length, rms: Math.sqrt(e.reduce((a: number, v: number) => a + v * v, 0) / e.length) } : null; };   // 설계서 '계수·감사·데이터'와 같은 계산
    for (const [key, label, f] of [['phys', '병기 피해', (x: any) => x.kind === 'damage' && x.label.includes('병기')], ['magic', '책략 피해', (x: any) => x.kind === 'damage' && x.label.includes('책략')], ['heal', '회복', (x: any) => x.kind === 'heal'], ['infl', '스탯 영향', (x: any) => x.kind === 'influence']] as const) {
      const r = rms(f as any); if (!r || r.rms <= 10) continue;
      common.push({ id: `K-${key}`, kind: '계수 표본', text: `${label} 역재현 오차 ±${r.rms.toFixed(1)}% (표본 ${r.n}건) — ${key === 'heal' ? '회복 줄마다 시전자·대상' : key === 'infl' ? '효과 수치 줄마다 시전자' : '피해 줄마다 공격자·피격자'} 툴팁을 같이`, refs: [] });
    }
  }
  // 검증 대기(queue) 가운데 위에서 안 잡힌 것: 발동률·전법 정보·금병법 해석
  const have = new Set(items.flatMap(it => it.refs));
  for (const q of queue.filter((q: any) => q.status === 'pending' && ['rate', 'capture', 'manual'].includes(q.kind))) {
    if (q.kind === 'manual') {
      const mid = String(q.id).replace(/^V-manual-/, ''); if (items.some(it => it.id === `CM-${mid}`)) continue;
      const g = gById.get(q.refs[0]); const m = g?.manuals?.find((x: any) => x.id === mid);
      if (!released(g) || !m || m.textUnknown) continue;
      items.push({ id: `V-${mid}`, kind: '원문 근사·미반영', weight: 2 * pop(g.id), refs: [mid], need: { generals: [g.id], manual: { general: g.id, name: m.name } }, text: `${g.name.ko}〈${m.name}〉 ${q.assumption} — ${q.howToVerify}` });
      continue;
    }
    const s = sById.get(q.refs[0]); if (!s || s.krRelease === '미출시') continue;
    if (q.kind === 'capture' && (have.has(s.id) && items.some(it => it.id === `S-${s.id}`))) continue;
    const need = skillNeed(s); if (!need) continue;
    items.push({ id: `V-${q.kind}-${s.id}`, kind: s.isUnique ? '무장 자료' : '전법 자료', weight: 0.8, refs: [s.id], need, text: `「${s.name.ko}」 ${q.kind === 'rate' ? '발동률' : '전법 정보'} — ${q.howToVerify}` });
  }

  // ── 편성 최적화 ────────────────────────────────────────────
  const covers = (it: Item, deck: { gens: Set<string>; skills: Set<string>; manuals: Map<string, string> }) => {
    const n = it.need;
    if (!n.generals?.length && !n.skills?.length && !n.manual) return false;   // 대상 무장·전법이 없는 화면 확인 → '화면만 녹화'
    if (n.generals?.length && !n.generals.every(g => deck.gens.has(g))) return false;
    if (n.skills?.length && !n.skills.some(s => deck.skills.has(s) || [...deck.gens].some(g => gById.get(g)?.uniqueSkillId === s))) return false;
    if (n.manual && deck.manuals.get(n.manual.general) !== n.manual.name) return false;
    return true;
  };
  let remaining = [...items];
  const decks: RecDeck[] = [];
  const person = (id: string) => gById.get(id)?.samePerson || id;
  // 등급 우선 (사용자 지정 2026-10-14): 실전은 전설급 위주 — 전설 ×3, 영웅 ×0.4
  const gradeOf = (it: Item): string => {
    const n = it.need;
    const sk = n.skills?.length ? sById.get(n.skills[0]) : null;
    if (sk && !sk.isUnique) return sk.grade || '';
    const g = n.generals?.length ? gById.get(n.generals[0]) : (sk?.isUnique ? gById.get(sk.ownerGeneralId) : null);
    return g?.grade || '';
  };
  const GRADE_MUL: Record<string, number> = { 전설: 3, 영웅: 0.4 };
  for (const it of items) it.weight *= GRADE_MUL[gradeOf(it)] ?? 1;
  const isData = (it: Item) => it.kind === '무장 자료' || it.kind === '전법 자료' || it.kind === '화면 확인';
  const isFill = (it: Item) => it.kind === '스탯 영향';   // 빈칸 채우기 — 이것만 남으면 판을 더 만들지 않는다
  const primary = (it: Item) => !isData(it) && !isFill(it);
  // 전투가 필요한 항목이 남은 동안만 판을 만든다. 무장·전법 자료(화면만 있으면 되는 것)는 판에 곁들이고, 남으면 '화면만 녹화'로
  const usedAll = new Set<string>();
  for (let no = 1; remaining.some(primary) && no <= 30; no++) {
    const deck = { gens: new Set<string>(), skills: new Set<string>(), manuals: new Map<string, string>() };
    const units: RecDeck['units'] = [];
    for (let slot = 0; slot < 3; slot++) {
      let best: any = null;
      for (const g of gens) {
        if (deck.gens.has(g.id) || [...deck.gens].some(x => person(x) === person(g.id))) continue;
        const trial = { gens: new Set([...deck.gens, g.id]), skills: new Set(deck.skills), manuals: new Map(deck.manuals) };
        // 금병법: 남은 항목을 가장 많이 덮는 것
        let man: string | null = null, manGain = 0;
        for (const m of g.manuals || []) {
          if (m.textUnknown) continue;
          trial.manuals.set(g.id, m.name);
          const gain = remaining.filter(it => it.need.manual?.general === g.id && covers(it, trial)).reduce((a, it) => a + it.weight, 0);
          if (gain > manGain) { manGain = gain; man = m.name; }
        }
        if (man) trial.manuals.set(g.id, man); else trial.manuals.delete(g.id);
        // 전법 2개: 남은 항목을 많이 덮는 일반 전법부터
        const picks: string[] = [];
        for (let k = 0; k < 2; k++) {
          let sBest: string | null = null, sGain = 0;
          for (const s of normalSkills) {
            if (trial.skills.has(s.id)) continue;
            const gain = remaining.filter(it => it.need.skills?.includes(s.id) && !covers(it, trial) && covers(it, { ...trial, skills: new Set([...trial.skills, s.id]) })).reduce((a, it) => a + it.weight, 0);
            if (gain > sGain) { sGain = gain; sBest = s.id; }
          }
          if (sBest) { trial.skills.add(sBest); picks.push(sBest); }
        }
        const gain = remaining.filter(it => covers(it, trial) && !covers(it, deck)).reduce((a, it) => a + it.weight * (primary(it) ? 10 : 1), 0);
        if (!best || gain > best.gain || (gain === best.gain && (use.get(g.id) || 0) > (use.get(best.g.id) || 0))) best = { g, gain, man, picks, trial };
      }
      if (!best || best.gain <= 0) break;
      deck.gens = best.trial.gens; deck.skills = best.trial.skills; deck.manuals = best.trial.manuals;
      units.push({ generalId: best.g.id, name: best.g.name.ko, unique: sById.get(best.g.uniqueSkillId)?.name.ko || '', skillIds: best.picks, skills: best.picks.map((id: string) => sById.get(id).name.ko), manual: best.man, manualId: best.man ? (best.g.manuals.find((m: any) => m.name === best.man)?.id || null) : null });
    }
    if (!units.length) break;
    // 3명을 못 채우면 아무 출시 무장으로 채운다(전투가 성립하도록) — 자료가 빈 무장을 우선
    while (units.length < 3) {
      const free = (x: any) => !deck.gens.has(x.id) && ![...deck.gens].some(y => person(y) === person(x.id));
      const g = gens.find(x => free(x) && !usedAll.has(x.id) && remaining.some(it => it.id === `G-${x.id}`)) || gens.find(x => free(x) && !usedAll.has(x.id)) || gens.find(x => !deck.gens.has(x.id) && ![...deck.gens].some(y => person(y) === person(x.id)));
      deck.gens.add(g.id);
      units.push({ generalId: g.id, name: g.name.ko, unique: sById.get(g.uniqueSkillId)?.name.ko || '', skillIds: [], skills: [], manual: null, manualId: null });
    }
    const got = remaining.filter(it => covers(it, deck));
    if (!got.some(primary)) break;
    for (const u of units) usedAll.add(u.generalId);
    remaining = remaining.filter(it => !covers(it, deck));
    // 엔진으로 한 번 돌려 확인할 전법이 한 판에 나오는 확률
    const inDeck = new Set([...deck.skills, ...[...deck.gens].map(g => gById.get(g)?.uniqueSkillId)]);
    const targetSkills = [...new Set(got.flatMap(it => [...(it.need.skills || []), ...(it.need.generals || []).map(g => gById.get(g)?.uniqueSkillId)]).filter(s => s && inDeck.has(s)))] as string[];
    const spec = { formation: '기형진', units: units.map(u => ({ generalId: u.generalId, skillIds: u.skillIds, manualId: u.manualId || 'none' })) } as any;
    const foe = sim.tierDeckSpec(b.tierDecks.find((t: any) => t.season === 'S1').id);
    const N = opts.simRuns ?? 20;
    const seen = new Map<string, number>();
    if (!sim.validateDeck(spec).length) for (let k = 0; k < N; k++) {
      const log: string[] = sim.simulate(spec, foe, { seed: k + 1 } as any).log;
      for (const sid of targetSkills) { const nm = sById.get(sid)?.name.ko; if (nm && log.some(l => l.includes(`【${nm}】`) || l.includes(`[${nm}]을(를) 발동`))) seen.set(sid, (seen.get(sid) || 0) + 1); }
    }
    const fireRates = targetSkills.map(sid => ({ skill: sById.get(sid).name.ko, rate: Math.round(((seen.get(sid) || 0) / N) * 100) / 100 }));
    const minRate = Math.max(0.05, Math.min(...fireRates.map(f => f.rate).filter(r => r > 0), 1));
    const runs = Math.min(3, Math.max(1, Math.ceil(Math.log(0.2) / Math.log(1 - Math.min(minRate, 0.99)))));
    const gotIds = new Set(got.map(it => it.id));
    const before = units.filter(u => gotIds.has(`G-${u.generalId}`)).map(u => `${u.name} 무장 상세: ${screenOf.get(u.generalId)!.join(', ')}`);
    for (const u of units) for (const sid of u.skillIds) if (gotIds.has(`S-${sid}`)) before.push(`전법 「${sById.get(sid).name.ko}」 상세 팝업`);
    const battleChecks = got.filter(it => !isData(it));
    for (const it of got.filter(it => isData(it) && !/^[GS]-/.test(it.id))) before.push(it.text);
    const stats: RecDeck['stats'] = [];
    for (const u of units) for (const sid of [gById.get(u.generalId)?.uniqueSkillId, ...u.skillIds]) {
      const sk = sById.get(sid); const st = sk && statOf(sk);
      if (st) stats.push({ general: u.name, skill: sk.name.ko, stat: st, what: `「${sk.name.ko}」 효과 수치 줄 + 그 순간 ${u.name} ${st} 툴팁` });
    }
    const legend = got.filter(it => gradeOf(it) === '전설').length, hero = got.filter(it => gradeOf(it) === '영웅').length;
    decks.push({ no, legend, hero, title: battleChecks.length ? `확인 ${battleChecks.length}건 · 화면 ${got.length - battleChecks.length}건` : `자료 ${got.length}건`, formation: '기형진', opponent: '병영소 NPC(아무 레벨) 또는 유저 대전',
      units, before, checks: battleChecks.map(it => ({ id: it.id, kind: it.kind, text: it.text, refs: it.refs })), stats, fireRates, runs,
      reward: [100, Math.min(1000, 200 + battleChecks.length * 60 + before.length * 30)] });
  }
  // 판 순서: 전설 항목 비중이 큰 판부터
  decks.sort((a, b) => (b.legend - b.hero * 0.5) / (b.checks.length + b.before.length || 1) * Math.log2(2 + b.checks.length) - (a.legend - a.hero * 0.5) / (a.checks.length + a.before.length || 1) * Math.log2(2 + a.checks.length));
  decks.forEach((d, i) => { d.no = i + 1; });
  const gRank = (it: Item) => ({ 전설: 0, '': 1, 영웅: 2 } as any)[gradeOf(it)] ?? 1;
  remaining.sort((a, b) => gRank(a) - gRank(b));
  const byKind = (k: string) => items.filter(i => i.kind === k).length;
  return { generatedAt: new Date().toISOString().slice(0, 10),
    note: '자동 생성(pnpm missions). 녹화로 알아내야 할 모든 것(원문 근사·미반영, 검증 대기, 녹화 계획 남은 항목, 무장·전법 자료 빈칸)을 모아 가장 적은 판 수로 덮는 편성을 엔진으로 짰다. 확인되면 다음 생성 때 빠진다.',
    totals: { items: items.length + common.length, covered: items.length - remaining.filter(it => !isData(it)).length + common.length, statsLeft: remaining.filter(isFill).length, decks: decks.length, screens: remaining.filter(isData).length, common: common.length, byKind: Object.fromEntries(['스탯 영향 세부', '원문 근사·미반영', '검증 대기', '녹화 계획', '검증 요청 글', '스탯 영향', '무장 자료', '전법 자료', '화면 확인'].map(k => [k, byKind(k) + common.filter(c => c.kind === k).length]).concat([['잠정 규정', common.filter(c => c.kind === '잠정 규정').length], ['계수 표본', common.filter(c => c.kind === '계수 표본').length]])) },
    howTo: HOW_TO, driveGuide: DRIVE_GUIDE,
    rules: ['판(편성)당 제출 3건까지', '보상은 Claude 가 요청 사항 준수·중대 버그 발견·엔진 개선 기여도로 산정, 운영자 엔진 반영 승인 때 지급(최소 100P)', '분석이 불가능할 정도로 짧거나 내용이 없는 영상은 보상 제외', '제출 → 운영자 분석 승인 → Claude 분석 → 운영자 반영 승인'],
    common, talk, decks, screens: remaining.filter(isData).map(it => ({ id: it.id, kind: it.kind, text: it.text })),
    statsLeft: remaining.filter(isFill).map(it => ({ id: it.id, kind: it.kind, text: it.text })),
    uncovered: remaining.filter(primary).map(it => ({ id: it.id, kind: it.kind, text: it.text })), unreleased: [...new Set(unreleased)] };
}

if (process.argv[1]?.endsWith('missions.ts')) {
  const m = buildMissions();
  writeFileSync(join(DATA, 'verification', 'missions.json'), JSON.stringify(m, null, 2) + '\n');
  console.log(`녹화 안내: 확인 항목 ${m.totals.items}개 — 전투 ${m.totals.decks}판 + 화면만 ${m.totals.screens}건 + 공통 ${m.totals.common}건 · 스탯 영향 남음 ${m.totals.statsLeft} — ${JSON.stringify(m.totals.byKind)} · 편성으로 못 덮음 ${m.uncovered.length}`);
}
