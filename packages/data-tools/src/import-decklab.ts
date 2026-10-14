// deck-lab(천덱랩) 공유 HTML → data/reference/decklab/*.json
//
// 사용: tsx src/import-decklab.ts [deck-lab.html 경로]
//   경로를 주지 않으면 data/sources/decklab-snapshot.json(이미 추출한 스냅샷)을 다시 나눈다.
//
// 원작자: 천덱랩(cheonha-deck-lab) 작성자. 사용자 합의에 따라 출처를 표기해 활용한다.
// 제외 항목:
//   - supportInfo: 작성자 개인 후원 계좌 정보
//   - generalPortraits / tacticImages: base64 게임 이미지(용량·저작권)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { DATA, SOURCES, writeJson, ensureDir } from './paths.ts';
import { join } from 'node:path';

const EXCLUDE = new Set(['supportInfo', 'generalPortraits', 'tacticImages']);
const SNAPSHOT = join(SOURCES, 'decklab-snapshot.json');

function loadFromHtml(path: string): Record<string, unknown> {
  const html = readFileSync(path, 'utf8');
  const m = html.match(/<script id="app-data" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('deck-lab HTML 에서 app-data 블록을 찾지 못했습니다.');
  return JSON.parse(m[1]);
}

const arg = process.argv[2];
let raw: Record<string, unknown>;
if (arg) {
  raw = loadFromHtml(arg);
  const stripped = Object.fromEntries(Object.entries(raw).filter(([k]) => !EXCLUDE.has(k)));
  writeFileSync(SNAPSHOT, JSON.stringify(stripped));
  raw = stripped;
} else if (existsSync(SNAPSHOT)) {
  raw = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
} else {
  throw new Error(`deck-lab HTML 경로를 인자로 주거나 ${SNAPSHOT} 를 준비하세요.`);
}

const meta = raw.metadata as Record<string, unknown>;
const out = join(DATA, 'reference', 'decklab');
ensureDir(out);

const attribution = {
  label: `천덱랩 deck-lab v${meta.appVersion} (스냅샷 ${meta.dataSnapshot})`,
  note: '다른 유저가 해외(중국·대만) 자료를 모아 만든 공유 HTML. 각 항목의 sourceUrl 이 원출처다. 해외 표기는 표시 전에 한국판 용어로 정규화한다.',
  generatedAt: meta.generatedAt,
  excluded: [...EXCLUDE],
};

const groups: Record<string, string[]> = {
  catalog: ['generals', 'tactics', 'generalSkills', 'tacticDetails', 'tacticRarities', 'tacticEffects', 'tacticMeanings', 'tacticBasis', 'tacticFallbacks', 'formationEffects', 'balancePatch', 'equipmentPatchEffects', 'battleTerms', 'tacticBattleTermLinks'],
  decks: ['decks', 'aiDecks', 'aiFactors', 'aiGradeCounts', 'deckBattleTerms', 'deckMechanics', 'tacticAlternativeAssessments'],
  matchups: ['verifiedCounters', 'matchupEvidence', 'favorableMatchupCombos', 'verifiedCounterDeckProfiles', 'verifiedCounterEnemyIds'],
  yanwu: ['yanwuDatasetSource', 'yanwuLegalityAudit', 'yanwuS16Reference', 'yanwuSummary', 'yanwuSummaries', 'yanwuTargetSeasons', 'yanwuTargetDatasets', 'yanwuEntityEvidence', 'yanwuSynergies', 'yanwuBuilds'],
  guides: ['openingGuides', 'promotionCommonRules', 'promotionGuides', 'promotionSources', 'notice'],
};

const used = new Set<string>(['metadata']);
for (const [file, keys] of Object.entries(groups)) {
  const obj: Record<string, unknown> = {};
  for (const k of keys) if (k in raw) { obj[k] = raw[k]; used.add(k); }
  writeJson(join(out, `${file}.json`), obj);
}
const leftover = Object.keys(raw).filter(k => !used.has(k));
writeJson(join(out, 'index.json'), { attribution, metadata: meta, files: Object.keys(groups), unclassifiedKeys: leftover });

// 해외 출처 URL 목록 → data/sources/overseas-sites.json (중복 제거, 도메인별 집계)
const urls = new Set<string>();
JSON.stringify(raw, (_k, v) => {
  if (typeof v === 'string' && /^https?:\/\//.test(v)) urls.add(v);
  return v;
});
const byHost: Record<string, number> = {};
urls.forEach(u => { const h = new URL(u).host; byHost[h] = (byHost[h] || 0) + 1; });
writeJson(join(SOURCES, 'overseas-sites.json'), {
  note: 'deck-lab 에 인용된 해외 원출처. 수집 시 이 목록을 우선 참고한다.',
  hosts: Object.entries(byHost).sort((a, b) => b[1] - a[1]).map(([host, count]) => ({ host, count })),
});

console.log(`deck-lab: ${Object.keys(groups).length}개 파일, 출처 도메인 ${Object.keys(byHost).length}개, 미분류 키 ${leftover.length}개`);
