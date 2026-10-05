// 설계서 점검 대시보드 데이터 (첫 화면 카드·녹화할 덱)
import { describe, it, expect } from 'vitest';
import { collectDesignData } from '../packages/data-tools/src/build-design.ts';

const D: any = collectDesignData();
const B = D.dashboard;

describe('점검 대시보드', () => {
  it('카드 4장과 심각도', () => {
    for (const k of ['engine', 'clauses', 'questions', 'quality']) {
      expect(['bad', 'warn', 'good']).toContain(B.cards[k].sev);
      expect(B.cards[k].count).toBeGreaterThanOrEqual(0);
    }
    expect(B.cards.clauses.count).toBe(B.clauseRows.length);
  });
  it('녹화할 덱: 남은 확인이 많은 판부터(선택 판은 뒤), 무장마다 전열/후열', () => {
    const main = B.decks.filter((d: any) => !d.optional);
    for (let i = 1; i < main.length; i++) expect(main[i - 1].open).toBeGreaterThanOrEqual(main[i].open);
    for (const d of B.decks) for (const u of d.units) expect(['전열', '후열']).toContain(u.position);
    expect(B.totals.openChecks).toBe(B.decks.reduce((a: number, d: any) => a + d.open, 0));
  });
  it('녹화로 끝낸 확인 항목은 검증완료 글과 드라이브 링크가 붙는다', () => {
    const d1 = B.decks.find((d: any) => d.no === 1);
    const done = d1.checks.filter((c: any) => c.done);
    expect(done.length).toBeGreaterThan(0);
    expect(done.every((c: any) => c.donePost === 'P-0029' && c.links.length === 2)).toBe(true);
  });
});
