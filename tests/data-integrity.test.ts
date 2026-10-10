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

// 2026-10-10 도감 녹화 등급 (P-0047)
import { buildBundle as _bbG } from '../packages/data-tools/src/bundle.ts';
describe('무장·전법 등급', () => {
  const b: any = _bbG();
  it('등급은 전설·영웅·희귀 중 하나', () => {
    for (const g of b.generals) if (g.grade) expect(['전설', '영웅', '희귀']).toContain(g.grade);
    for (const s of b.skills.filter((x: any) => !x.isUnique && x.grade)) expect(['전설', '영웅', '희귀', '미확인']).toContain(s.grade);
  });
  it('S1·S2 무장은 모두 등급이 있다 (녹화로 확인)', () => {
    expect(b.generals.filter((g: any) => g.season !== 'S3' && !g.grade).map((g: any) => g.name.ko)).toEqual([]);
  });
  it('S1 엑셀의 희귀 전법은 실제로 영웅', () => {
    expect(b.skills.find((s: any) => s.id === 'valiant-form').grade).toBe('영웅');
    expect(b.skills.filter((s: any) => !s.isUnique && s.season !== 'S3' && s.grade === '희귀').length).toBe(0);
  });
});
