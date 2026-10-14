// 공개 서비스용 자료 (OPS15 엔진 보호, 사용자 지정 2026-10-14: 전투 엔진 값이 절대 밖으로 나가지 않게)
//   pnpm build:public 이 부른다.
//   ① 브라우저용 공개 카탈로그 apps/web/public-server/data/catalog.json
//      — 화면 표시에 필요한 게임 정보(이름·능력치·한국판 원문·발동률 표기·진형·티어덱)만. 엔진 정의·계수·해석 메모는 없다.
//   ② 서버 전용 번들 apps/web/server/_generated/bundle.json (서버 함수 안에만 들어간다, 정적 파일로 내보내지 않음)
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { buildBundle } from './bundle.ts';
import { DATA, ROOT, readJson } from './paths.ts';

const pick = <T extends Record<string, any>>(o: T, keys: string[]) => Object.fromEntries(keys.filter(k => o[k] !== undefined).map(k => [k, o[k]]));
const clauses = (cs: any[] | undefined) => (cs || []).map(c => ({ text: c.text, status: c.status }));

export function publicCatalog(b: any = buildBundle()) {
  return {
    dataVersion: b.dataVersion, season: b.season, builtAt: b.builtAt, seasons: b.seasons.map((x: any) => pick(x, ['id', 'label', 'status'])),
    generals: b.generals.map((g: any) => ({
      ...pick(g, ['id', 'name', 'season', 'overseasSeason', 'faction', 'row', 'role', 'unitType', 'stats', 'maxTroops', 'uniqueSkillId', 'grade', 'gender', 'samePerson', 'krRelease', 'dataStatus']),
      ...(g.dataStatus ? { dataStatus: Object.fromEntries(Object.entries(g.dataStatus).filter(([k]) => k !== 'note')) } : {}),
      manuals: (g.manuals || []).map((m: any) => ({ ...pick(m, ['id', 'name', 'text', 'status', 'textUnknown']), clauses: clauses(m.clauses) })),
    })),
    skills: b.skills.map((s: any) => ({
      ...pick(s, ['id', 'name', 'isUnique', 'ownerGeneralId', 'season', 'overseasSeason', 'grade', 'kind', 'trait', 'procRate', 'procRateText', 'text', 'krRelease', 'dataStatus']),
      clauses: clauses(s.clauses),
      ...(s.engineStatus ? { engineStatus: { status: s.engineStatus.status } } : {}),
    })),
    bonds: b.bonds.map((x: any) => pick(x, ['id', 'name', 'required', 'memberNames', 'memberIds', 'text'])),
    formations: b.formations.map((x: any) => pick(x, ['id', 'name', 'hitRate', 'traits', 'confirmed'])),
    tierDecks: b.tierDecks.map((t: any) => pick(t, ['id', 'season', 'tier', 'name', 'units'])),
    glossary: b.glossary, termMap: (b.termMap || []).map((m: any) => pick(m, ['from', 'to', 'autoReplace'])),
    changelog: [],   // 변경 기록은 공개 표시한 것만 따로(OPS8) — 지금은 없음
  };
}

export const CATALOG_FILE = join(ROOT, 'apps', 'web', 'public-server', 'data', 'catalog.json');
export const SERVER_BUNDLE_FILE = join(ROOT, 'apps', 'web', 'server', '_generated', 'bundle.json');
export const SERVER_ALT_FILE = join(ROOT, 'apps', 'web', 'server', '_generated', 'alternatives.json');

if (import.meta.url === `file://${process.argv[1]}`) {
  const b = buildBundle();
  // 덱 추천의 전법 대체 평가(해외 참고 자료) — 서버에서만 쓴다
  const decks = readJson<any>(join(DATA, 'reference', 'decklab', 'decks.json'));
  const alts = decks.tacticAlternativeAssessments.filter((a: any) => a.rating !== '미평가').map((a: any) => ({ requiredTacticId: a.requiredTacticId, alternativeTacticId: a.alternativeTacticId, rating: a.rating }));
  for (const [f, v] of [[CATALOG_FILE, publicCatalog(b)], [SERVER_BUNDLE_FILE, b], [SERVER_ALT_FILE, alts]] as const) {
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, JSON.stringify(v));
  }
  console.log(`공개 카탈로그 ${(JSON.stringify(publicCatalog(b)).length / 1024).toFixed(0)}KB → ${CATALOG_FILE}\n서버 번들 → ${SERVER_BUNDLE_FILE}`);
}
