// OPS5 검증 미션 — 구체적 요구사항이 빠짐없이 들어가는지
import { describe, it, expect } from 'vitest';
import { buildMissions } from '../packages/data-tools/src/missions.ts';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';

const M = buildMissions();
const b: any = buildBundle();

describe('검증 미션 (OPS5)', () => {
  it('미션마다 대상·체크리스트·촬영 순서·보상 범위·제출 3건', () => {
    expect(M.missions.length).toBeGreaterThan(0);
    for (const m of M.missions) {
      expect(m.targets.length, m.id).toBeGreaterThan(0);
      expect(m.checklist.length, m.id).toBeGreaterThan(0);
      expect(m.howTo.length, m.id).toBeGreaterThan(0);
      expect(m.reward[0]).toBeGreaterThanOrEqual(100);
      expect(m.reward[1]).toBeLessThanOrEqual(1000);
      expect(m.cap).toBe(3);
      if (m.kind === '전투') expect(m.setup?.units.length, m.id).toBeGreaterThan(0);
    }
  });
  it('능력치 미확인 무장은 50레벨 능력치 화면을 요구하고, 미출시 무장은 미션이 없다', () => {
    const g = b.generals.find((x: any) => x.id === 'yang-xiu');
    const m = M.missions.find(x => x.id === 'M-G-yang-xiu')!;
    expect(g.dataStatus.stats).toBeTruthy();
    expect(m.checklist.join(' ')).toContain('50레벨');
    for (const x of b.generals.filter((x: any) => x.krRelease === '미출시')) expect(M.missions.some(m => m.id === `M-G-${x.id}`)).toBe(false);
  });
  it('자료가 다 확인된 무장에는 무장 화면 미션이 없다', () => {
    const done = b.generals.filter((x: any) => !x.dataStatus && x.grade && (x.manuals || []).length && !(x.manuals || []).some((m: any) => m.textUnknown));
    const skill = new Map(b.skills.map((s: any) => [s.id, s]));
    for (const g of done) {
      const u: any = skill.get(g.uniqueSkillId);
      if (u && (u.dataStatus || (u.clauses || []).some((c: any) => c.status !== 'ok'))) continue;
      expect(M.missions.some(m => m.id === `M-G-${g.id}`), g.id).toBe(false);
    }
  });
  it('드라이브 공유 가이드에 "링크가 있는 모든 사용자"·뷰어 안내', () => {
    expect(M.driveGuide.join(' ')).toContain('링크가 있는 모든 사용자');
  });
});
