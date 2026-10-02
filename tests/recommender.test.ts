import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { Recommender } from '../packages/recommender/src/index.ts';

const b = buildBundle();
const rec = new Recommender(b);
const alternatives = JSON.parse(readFileSync('data/reference/decklab/decks.json', 'utf8')).tacticAlternativeAssessments;
const allG = b.generals.map(g => g.id), allS = b.skills.filter(s => !s.isUnique).map(s => s.id);

function noDup(decks: ReturnType<Recommender['recommend']>['decks']) {
  const g = decks.flatMap(d => d.units.map(u => u.generalId));
  const s = decks.flatMap(d => d.units.flatMap(u => u.skillIds));
  expect(new Set(g).size, '무장 중복').toBe(g.length);
  expect(new Set(s).size, '전법 중복 (R-006)').toBe(s.length);
}

describe('덱 추천', () => {
  it('전부 보유: 5덱, 무장·전법 중복 없음, 상위 티어 우선', () => {
    const r = rec.recommend({ owned: { generals: allG, skills: allS }, count: 5, alternatives });
    expect(r.decks).toHaveLength(5);
    noDup(r.decks);
    expect(r.decks[0].tier.startsWith('T0')).toBe(true);
  });

  it('일부 보유: 없는 카드는 대체하고 사유를 남긴다', () => {
    const owned = { generals: allG.filter((_, i) => i % 3 !== 0), skills: allS.filter((_, i) => i % 2 === 0) };
    const r = rec.recommend({ owned, count: 3, alternatives });
    expect(r.decks.length).toBeGreaterThan(0);
    noDup(r.decks);
    for (const d of r.decks) for (const u of d.units) {
      expect(owned.generals).toContain(u.generalId);
      u.skillIds.forEach(s => expect(owned.skills).toContain(s));
    }
    expect(r.decks.some(d => d.units.some(u => u.subs.length))).toBe(true);
  });

  it('메타 상대 시뮬 검증 결과를 붙인다', () => {
    const r = rec.recommend({ owned: { generals: allG, skills: allS }, count: 1, validate: { opponents: 2, runs: 20, seed: 't' } });
    expect(r.decks[0].validation!.opponents).toHaveLength(2);
  });
});

import { planVerification } from '../packages/recommender/src/index.ts';
import { buildQueue } from '../packages/data-tools/src/verification.ts';

describe('검증 전투 짜기', () => {
  const queue = buildQueue(b as any);
  it('전부 보유하면 모든 대기 항목을 담고, 부대마다 무장·전법이 겹치지 않는다', () => {
    const p = planVerification(b, queue, { generals: allG, skills: allS }, { maxBattles: 60 });
    expect(p.covered).toBe(p.total);
    for (const bt of p.battles) {
      expect(bt.units.length).toBeLessThanOrEqual(3);
      const g = bt.units.map(u => u.generalId), s = bt.units.flatMap(u => u.skillIds);
      expect(new Set(g).size).toBe(g.length);
      expect(new Set(s).size).toBe(s.length);
      bt.units.forEach(u => expect(u.skillIds.length).toBeLessThanOrEqual(2));
    }
  });
  it('보유하지 않은 카드가 필요한 항목은 따로 알려 준다', () => {
    const p = planVerification(b, queue, { generals: allG.slice(0, 10), skills: allS.slice(0, 10) });
    expect(p.blocked.length).toBeGreaterThan(0);
    for (const bt of p.battles) for (const u of bt.units) expect(allG.slice(0, 10)).toContain(u.generalId);
  });
});
