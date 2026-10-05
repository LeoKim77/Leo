// GameBundle 을 파일로 쓴다 → 웹(apps/web/public/data)이 읽는다.
import { join } from 'node:path';
import { existsSync, copyFileSync } from 'node:fs';
import { ROOT, DATA, readJson, writeJson } from './paths.ts';
import { buildBundle } from './bundle.ts';
import { buildQueue } from './verification.ts';

const bundle: any = buildBundle();
bundle.verification = buildQueue(bundle);
bundle.confirmedRules = readJson<any>(join(DATA, 'common', 'confirmed-rules.json')).rules;
bundle.site = readJson<any>(join(DATA, 'common', 'site.json'));
// 기획 플랫폼 규정 요약 — 시뮬 결과에 '잠정 규정 사용'을 표시한다(OV3)
const spec = readJson<any>(join(DATA, 'design', 'spec.json')).items as any[];
bundle.design = {
  total: spec.length,
  provisional: spec.filter(s => s.status === '잠정' || s.status === '결정필요').map(s => ({ id: s.id, cat: s.cat, title: s.title, status: s.status })),
};
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
  tacticAlternatives: decks.tacticAlternativeAssessments.filter((a: any) => a.rating !== '미평가').map((a: any) => ({ requiredTacticId: a.requiredTacticId, alternativeTacticId: a.alternativeTacticId, rating: a.rating })),
});

// 최근 감사 결과도 웹에 함께 싣는다
const auditSrc = join(DATA, 'audit', 'latest.json');
if (existsSync(auditSrc)) copyFileSync(auditSrc, join(outDir, 'audit.json'));

const cov = (bundle.skills as any[]).flatMap((s: any) => s.clauses).reduce((m: Record<string, number>, c: any) => { m[c.status] = (m[c.status] || 0) + 1; return m; }, {} as Record<string, number>);
console.log(`bundle ${bundle.dataVersion}: 무장 ${bundle.generals.length}, 전법 ${bundle.skills.length}, 절 상태`, cov);
