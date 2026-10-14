// 시뮬서 공개용 검증 요청 (OPS5·OPS15, 사용자 지정 2026-10-14)
//   설계서는 외부에 공개하지 않는다. 설계서의 녹화 안내(missions.json, 내부 정본)에서 '무엇을 녹화할지'만 뽑아
//   시뮬서 '검증 요청' 탭으로 보낸다 → apps/web/public-server/data/requests.json (+ 운영자용 아티팩트에 함께 실림)
//   빠지는 것: 엔진 가정의 공식·가중치·계수 오차·엔진 발동 비율·규정 번호·엔진 해석 문장·내부 항목 id
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { buildBundle } from './bundle.ts';
import { DATA, ROOT, readJson } from './paths.ts';

/** 공개본에 나오면 안 되는 표식 (tests/public-leak.test.ts 도 같은 목록으로 검사) */
export const REQUEST_FORBIDDEN: RegExp[] = [/×/, /가중치/, /계수/, /RMS/i, /잠정/, /엔진/, /근사/, /미반영/, /\bJ\d+\b/, /\bW\d\d\b/, /FEAT-|FIX-/, /오차/, /역재현/, /역산/, /\d+(\.\d+)?%p/];

const COMMON_PUBLIC = [
  '피해 줄이 나올 때마다 공격자·피격자를 눌러 툴팁(능력치·주는/받는 피해 증감)을 같이 — 증감 효과가 여러 개 겹친 장면이면 더 좋습니다',
  '같은 공격자가 같은 대상에게 같은 전법으로 여러 번 피해를 준 장면',
  '회심·묘책이 터진 피해 줄과 그 직전·직후의 일반 피해 줄',
  '회복 줄이 나올 때마다 시전자·대상 툴팁',
  '같은 책략 전법이 여러 대상에게 한 번에 들어간 줄 + 맞은 대상들의 툴팁',
  '준비 턴(0턴)과 1턴 시작 부분 전보를 빠짐없이',
];

export function buildPublicRequests() {
  const M = readJson<any>(join(DATA, 'verification', 'missions.json'));
  const b: any = buildBundle();
  const sName = new Map<string, string>(b.skills.map((s: any) => [s.id, s.name.ko]));
  const gName = new Map<string, string>(b.generals.map((g: any) => [g.id, g.name.ko]));
  const mName = new Map<string, string>(b.generals.flatMap((g: any) => (g.manuals || []).map((m: any) => [m.id, `${g.name.ko}〈${m.name}〉`])));
  const label = (r: string) => sName.get(r) ? `「${sName.get(r)}」` : gName.get(r) || mName.get(r) || null;
  // 확인 항목 → 공개 문장. 같은 전법은 한 줄로 합친다(발동 장면 / 스탯 영향 / 시점 세부 / 금병법)
  const decks = M.decks.map((d: any) => {
    const inDeck = new Set<string>(d.units.flatMap((u: any) => [u.name, `「${u.unique}」`, ...u.skills.map((x: string) => `「${x}」`), ...(u.manual ? [`${u.name}〈${u.manual}〉`] : [])]));
    const names = (c: any) => [...new Set((c.refs || []).map(label).filter((x: any) => x && inDeck.has(x)))] as string[];
    const scene = new Set<string>(), manual = new Set<string>(), timing = new Set<string>(), stat = new Map<string, string>();
    for (const c of d.checks) {
      if (c.kind === '스탯 영향') { const m = /^(「[^」]+」) (.+)의 영향/.exec(c.text); if (m && inDeck.has(m[1])) stat.set(m[1], m[2]); continue; }
      if (c.kind === '스탯 영향 세부') { names(c).forEach(n => timing.add(n)); continue; }
      if (/^CM-|^V-m-/.test(c.id)) { names(c).filter(n => n.includes('〈')).forEach(n => manual.add(n)); continue; }
      names(c).filter(n => n.startsWith('「')).forEach(n => scene.add(n));
    }
    const checks = [
      ...[...scene].map(n => `${n} 발동 장면 — 발동 줄 앞뒤 전보 + 효과를 받은 무장 툴팁`),
      ...[...manual].map(n => `${n} 효과가 적용되는 장면 + 해당 무장 툴팁`),
      ...[...stat].map(([n, st]) => `${n} 효과 수치가 찍힌 줄 + 그 순간 시전자 툴팁(${st})`),
      ...[...timing].map(n => `${n} 효과가 걸리는 시점(턴 시작·행동·턴 종료)과 그 순간 시전자 툴팁 — 발동할 때마다 연속으로`),
    ];
    const before = d.before.filter((x: string) => /무장 상세:|^전법 「/.test(x));
    return { no: d.no, formation: d.formation, opponent: d.opponent, runs: d.runs, reward: d.reward,
      units: d.units.map((u: any) => ({ name: u.name, unique: u.unique, skills: u.skills, manual: u.manual })),
      before, checks };
  }).filter((d: any) => d.checks.length || d.before.length);
  const screens = M.screens.filter((c: any) => /^[GS]-/.test(c.id)).map((c: any) => c.text);
  return { generatedAt: M.generatedAt, howTo: M.howTo, driveGuide: M.driveGuide, rules: M.rules.map((x: string) => x.replace(/엔진/g, '시뮬')), common: COMMON_PUBLIC, decks, screens };
}

export const REQUESTS_FILE = join(ROOT, 'apps', 'web', 'public-server', 'data', 'requests.json');
export const REQUESTS_FILE_ARTIFACT = join(ROOT, 'apps', 'web', 'public', 'data', 'requests.json');

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = buildPublicRequests();
  const bad = REQUEST_FORBIDDEN.filter(re => re.test(JSON.stringify(r)));
  if (bad.length) { console.error('공개 검증 요청에 내부 표식이 있습니다:', bad.map(String)); process.exit(1); }
  for (const f of [REQUESTS_FILE, REQUESTS_FILE_ARTIFACT]) { mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, JSON.stringify(r)); }
  console.log(`공개 검증 요청: ${r.decks.length}판 · 화면만 ${r.screens.length}건 → ${REQUESTS_FILE}`);
}
