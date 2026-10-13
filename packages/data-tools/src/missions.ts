// 검증 미션 생성기 (OPS5, 2026-10-13 사용자 결정).
//   엔진을 인게임과 똑같이 맞추기 위해 유저에게 맡길 녹화 미션을 데이터 빈칸에서 자동으로 만든다.
//   pnpm missions → data/verification/missions.json (설계서 '검증 미션' 탭, 공개 서비스 단계에서 시뮬 사이트로)
//   미션 종류
//     무장 화면 — 전투 없이 무장 상세 화면 녹화(50레벨 능력치·성장치·병종·열·고유 전법·금병법)
//     전법 화면 — 전법 상세 화면 녹화(한국판 이름·문구·1/10레벨 수치·발동률)
//     전투      — 지정 편성으로 병영소/유저 전투 후 전보 녹화(계수·로직 확인)
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildBundle } from './bundle.ts';
import { DATA, readJson } from './paths.ts';

export interface Mission {
  id: string;
  kind: '무장 화면' | '전법 화면' | '전투';
  title: string;
  /** 왜 필요한지 — 지금 시뮬이 무엇을 임시값·근사로 쓰는지 */
  why: string;
  targets: string[];
  /** 전투 미션: 아군 편성(무장 · 전법 · 금병법)·진형·상대 */
  setup?: { formation?: string; units: Array<{ general: string; skills: string[]; manual?: string | null }>; opponent: string };
  /** 녹화에 꼭 들어가야 하는 화면·장면 */
  checklist: string[];
  /** 촬영 순서 */
  howTo: string[];
  minSeconds: number;
  reward: [number, number];
  cap: number;
  status: '모집 중' | '분석 중' | '완료';
  priority: number;
  refs: string[];
}

const DRIVE_GUIDE = [
  '구글 드라이브 앱(또는 drive.google.com) → ＋ → 업로드 → 녹화 파일 선택',
  '올라간 파일의 ⋮ → 공유 → 일반 액세스를 "링크가 있는 모든 사용자", 역할 "뷰어"로 바꾸기',
  '링크 복사 → 미션 화면의 제출 칸에 붙여넣기 (제한됨 상태면 분석할 수 없어 보상이 없습니다)',
];
const SCREEN_HOWTO = [
  '무장(또는 전법) 목록에서 대상을 연다',
  '각 화면에서 1~2초 멈춰 숫자가 또렷하게 보이게 한다(빠르게 넘기면 판독 불가)',
  '상세 팝업(전법·금병법)은 눌러서 끝까지 펼친다',
];
const BATTLE_HOWTO = [
  '미션 편성 그대로 출전(무장·전법·금병법·진형). 다르면 보상이 줄어든다',
  '전투가 끝나면 통계 화면 → 전보 준비 턴부터 8턴까지 끝까지 스크롤(멈춤 1~2초씩)',
  '중점 확인 장면에서는 무장 이름을 눌러 툴팁(능력치·병력·증감)을, 전법 이름을 눌러 상세를 연다',
];

export function buildMissions() {
  const b: any = buildBundle();
  const plan = readJson<any>(join(DATA, 'verification', 'recording-plan.json'));
  const assumptions = readJson<any>(join(DATA, 'verification', 'engine-assumptions.json')).items;
  // 검증 대기 목록(queue.json)에서 이미 확인·기각된 가정은 미션에서 뺀다
  const queue = readJson<any>(join(DATA, 'verification', 'queue.json'), { items: [] }).items;
  const closed = new Set(queue.filter((q: any) => ['verified', 'rejected', 'resolved', 'done'].includes(q.status)).map((q: any) => String(q.id).replace(/^V-engine-/, '')));
  // 우선순위: 티어덱에 많이 나오는 무장·전법일수록 덱 추천에 영향이 크다
  const use = new Map<string, number>();
  for (const t of b.tierDecks) for (const u of t.units || []) {
    use.set(u.generalId, (use.get(u.generalId) || 0) + 1);
    for (const s of u.skillIds || []) use.set(s, (use.get(s) || 0) + 1);
  }
  const skillById = new Map<string, any>(b.skills.map((s: any) => [s.id, s]));
  const out: Mission[] = [];

  // 1) 무장 화면 — 출시된 무장만(미출시는 녹화 불가)
  for (const g of b.generals) {
    if (g.krRelease === '미출시') continue;
    const ds = g.dataStatus || {};
    const u = skillById.get(g.uniqueSkillId);
    const items: string[] = [];
    const why: string[] = [];
    if (ds.stats) { items.push('50레벨 무장 상세: 무력·지력·통솔·선공(숫자 4개)', '능력치 성장치(가능하면)'); why.push(`능력치 ${String(ds.stats).slice(0, 40)}`); }
    if (ds.unitType || ds.row || ds.faction) { items.push('병종·진영·추천 열(전열/후열)'); why.push('병종·열·진영 미확인'); }
    if (ds.season) { items.push('카드의 시즌 표시'); why.push('시즌 표시 미확인'); }
    if (!g.grade) items.push('카드 등급 색(전설 금·영웅 보라·희귀 파랑)');
    if (u && (u.dataStatus || (u.clauses || []).some((c: any) => c.status !== 'ok'))) {
      items.push(`고유 전법 「${u.name.ko}」 상세: 종류·발동률·문구, 1레벨과 10레벨(또는 현재 레벨) 수치, 승품 단계`);
      why.push(u.dataStatus ? `고유 전법 ${Object.values(u.dataStatus)[0]}` : '고유 전법 문구 일부 근사');
    }
    const ms = g.manuals || [];
    if (!ms.length) { items.push('금병법 2개 이름·문구 전체(병법 탭)'); why.push('금병법 미수집'); }
    else if (ms.some((m: any) => m.textUnknown)) { items.push(`금병법 ${ms.filter((m: any) => m.textUnknown).map((m: any) => `〈${m.name}〉`).join('·')} 문구 전체`); why.push('금병법 문구 미확인'); }
    if (!items.length) continue;
    const pri = (use.get(g.id) || 0) * 3 + (ds.stats ? 4 : 0) + (!ms.length ? 2 : 0) + (u?.dataStatus ? 2 : 0);
    out.push({ id: `M-G-${g.id}`, kind: '무장 화면', title: `${g.name.ko} 무장 상세 화면`, why: why.join(' · '), targets: [g.name.ko],
      checklist: items, howTo: SCREEN_HOWTO, minSeconds: 15, reward: [100, 300], cap: 3, status: '모집 중', priority: pri, refs: [g.id, g.uniqueSkillId].filter(Boolean) });
  }

  // 2) 전법 화면 — 고유 전법은 무장 미션에 포함, 일반 전법만
  for (const s of b.skills) {
    if (s.isUnique || !s.dataStatus) continue;
    const ds = s.dataStatus;
    const items = [`전법 「${s.name.ko}」 상세 팝업: 한국판 이름, 종류(액티브·지휘·패시브·추격), 발동률, 특성`, '문구 전체와 수치(1레벨 → 10레벨, 또는 현재 레벨·승품)'];
    if (ds.procRate) items.push('발동률 숫자');
    if (s.season) items.push('카드의 시즌 표시(S 표시)');
    out.push({ id: `M-S-${s.id}`, kind: '전법 화면', title: `전법 「${s.name.ko}」 상세 화면`, why: Object.values(ds).join(' · '), targets: [s.name.ko],
      checklist: items, howTo: SCREEN_HOWTO, minSeconds: 8, reward: [100, 200], cap: 3, status: '모집 중', priority: (use.get(s.id) || 0) * 3 + (ds.text ? 3 : 1), refs: [s.id] });
  }

  // 3) 전투 — 녹화 계획 판 중 확인이 남은 것
  for (const bt of plan.battles || []) {
    const open = (bt.checks || []).filter((c: any) => !c.done);
    if (!open.length) continue;
    out.push({ id: `M-B-${bt.no}`, kind: '전투', title: `${bt.no}판 ${bt.title}`, why: `엔진 계수·로직 확인 ${open.length}건 남음`,
      targets: bt.units.map((u: any) => u[0]),
      setup: { formation: bt.formation, units: bt.units.map((u: any) => ({ general: u[0], skills: u[1] || [], manual: u[2] || null })), opponent: plan.opponent || '병영소 NPC(아무 레벨) 또는 유저 대전' },
      checklist: [...open.map((c: any) => c.text), ...(plan.howToRecord || [])], howTo: BATTLE_HOWTO, minSeconds: 120, reward: [300, 1000], cap: 3, status: '모집 중',
      priority: 50 + open.length * 5, refs: open.flatMap((c: any) => c.refs || []) });
  }
  // 4) 전투 — 검증 대기(엔진 가정) 중 녹화 계획에 없는 것: 해당 전법 보유 무장으로 자유 편성
  const planned = new Set((plan.battles || []).flatMap((bt: any) => (bt.checks || []).flatMap((c: any) => c.refs || [])));
  for (const a of assumptions) {
    if (closed.has(a.key) || planned.has(a.key) || !(a.refs || []).length || /승품/.test(a.title)) continue;   // 승품은 화면 미션(전법 상세)으로
    const sks = a.refs.map((r: string) => skillById.get(r)).filter(Boolean);
    if (!sks.length) continue;
    const owners = sks.map((s: any) => s.isUnique ? b.generals.find((g: any) => g.id === s.ownerGeneralId)?.name.ko : null).filter(Boolean);
    out.push({ id: `M-A-${a.key}`, kind: '전투', title: a.title, why: `지금 가정: ${a.assumption}`,
      targets: [...new Set([...owners, ...sks.map((s: any) => s.name.ko)])] as string[],
      setup: { units: (owners.length ? owners : ['자유']).map((n: string) => ({ general: n, skills: sks.filter((s: any) => !s.isUnique).map((s: any) => s.name.ko) })), opponent: '병영소 NPC 또는 유저 대전' },
      checklist: [`확인할 장면: ${a.howToVerify}`, `전법 ${sks.map((s: any) => `「${s.name.ko}」`).join('·')} 이 발동하는 턴의 전보 줄과 그때 시전자·목표 툴팁`],
      howTo: BATTLE_HOWTO, minSeconds: 60, reward: [200, 800], cap: 3, status: '모집 중', priority: 30 + (a.priority || 0), refs: a.refs });
  }
  out.sort((x, y) => y.priority - x.priority || x.id.localeCompare(y.id));
  return { generatedAt: new Date().toISOString().slice(0, 10), note: '자동 생성 — pnpm missions. 정본은 무장·전법 데이터 빈칸·녹화 계획·검증 대기. 같은 대상이 확인되면 다음 생성 때 사라진다.', driveGuide: DRIVE_GUIDE,
    rules: ['미션당 제출 3건까지', '보상은 Claude 가 요청 사항 준수·중대 버그 발견·엔진 개선 기여도로 산정, 운영자 엔진 반영 승인 때 지급(최소 100P)', '분석이 불가능할 정도로 짧거나 내용이 없는 영상은 보상 제외', '제출 → 운영자 분석 승인 → Claude 분석 → 운영자 반영 승인'],
    missions: out };
}

if (process.argv[1]?.endsWith('missions.ts')) {
  const m = buildMissions();
  writeFileSync(join(DATA, 'verification', 'missions.json'), JSON.stringify(m, null, 2) + '\n');
  const by = (k: string) => m.missions.filter(x => x.kind === k).length;
  console.log(`검증 미션 ${m.missions.length}개 — 무장 화면 ${by('무장 화면')} · 전법 화면 ${by('전법 화면')} · 전투 ${by('전투')}`);
}
