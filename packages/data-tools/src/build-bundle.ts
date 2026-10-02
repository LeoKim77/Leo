// GameBundle 을 파일로 쓴다 → 웹(apps/web/public/data)이 읽는다.
import { join } from 'node:path';
import { ROOT, DATA, readJson, writeJson } from './paths.ts';
import { buildBundle } from './bundle.ts';

const bundle = buildBundle();
const outDir = join(ROOT, 'apps', 'web', 'public', 'data');
writeJson(join(outDir, 'bundle.json'), bundle);

// 해외 참고 자료(deck-lab)는 용량이 커서 따로 둔다. 웹에서 필요할 때만 불러온다.
const catalog = readJson<any>(join(DATA, 'reference', 'decklab', 'catalog.json'));
const decks = readJson<any>(join(DATA, 'reference', 'decklab', 'decks.json'));
const matchups = readJson<any>(join(DATA, 'reference', 'decklab', 'matchups.json'));
const index = readJson<any>(join(DATA, 'reference', 'decklab', 'index.json'));
writeJson(join(outDir, 'reference-decklab.json'), {
  attribution: index.attribution,
  generals: catalog.generals,
  tactics: catalog.tactics,
  generalSkills: catalog.generalSkills,
  tacticDetails: catalog.tacticDetails,
  balancePatch: catalog.balancePatch,
  decks: decks.decks,
  aiDecks: decks.aiDecks,
  verifiedCounters: matchups.verifiedCounters,
});

const cov = bundle.skills.flatMap(s => s.clauses).reduce<Record<string, number>>((m, c) => { m[c.status] = (m[c.status] || 0) + 1; return m; }, {});
console.log(`bundle ${bundle.dataVersion}: 무장 ${bundle.generals.length}, 전법 ${bundle.skills.length}, 절 상태`, cov);
