import { describe, it, expect } from 'vitest';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';

const b = buildBundle();
const ids = new Set([...b.generals.map(g => g.id), ...b.skills.map(s => s.id)]);

describe('데이터 무결성', () => {
  it('게시판 글의 refs 는 실제 무장·전법 id 를 가리킨다', () => {
    for (const p of b.changelog) for (const r of p.refs || []) expect(ids.has(r), `${p.id}: ${r}`).toBe(true);
  });
  it('티어덱의 무장·전법이 모두 연결된다', () => {
    for (const t of b.tierDecks) for (const u of t.units) {
      expect(ids.has(u.generalId), `${t.name}: ${u.generalName}`).toBe(true);
      u.skillIds.forEach((s, i) => expect(ids.has(s), `${t.name}: ${u.skillNames[i]}`).toBe(true));
    }
  });
  it('모든 무장에 고유 전법이 있다', () => {
    for (const g of b.generals) expect(ids.has(g.uniqueSkillId), g.name.ko).toBe(true);
  });
});
