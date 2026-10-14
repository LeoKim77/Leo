// OPS5 녹화 안내 — 녹화로 알아내야 할 모든 것을 가장 적은 판으로 덮는 편성
import { describe, it, expect } from 'vitest';
import { buildMissions } from '../packages/data-tools/src/missions.ts';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { designPosts } from '../packages/data-tools/src/design.ts';

const M: any = buildMissions({ simRuns: 4 });
const b: any = buildBundle();
const gen = new Map<string, any>(b.generals.map((g: any) => [g.id, g]));

describe('녹화 안내 (OPS5)', () => {
  it('판마다 서로 다른 인물 3명, 전법 중복 없음, 출시 무장만', () => {
    expect(M.decks.length).toBeGreaterThan(0);
    for (const d of M.decks) {
      expect(d.units.length, `${d.no}판`).toBe(3);
      const persons = d.units.map((u: any) => gen.get(u.generalId)?.samePerson || u.generalId);
      expect(new Set(persons).size, `${d.no}판`).toBe(3);
      const sk = d.units.flatMap((u: any) => u.skillIds);
      expect(new Set(sk).size, `${d.no}판`).toBe(sk.length);
      for (const u of d.units) {
        expect(gen.get(u.generalId).krRelease, u.generalId).not.toBe('미출시');
        expect(u.skillIds.length).toBeLessThanOrEqual(2);
        if (u.manualId) expect(gen.get(u.generalId).manuals.some((m: any) => m.id === u.manualId)).toBe(true);
      }
      expect(d.checks.length, `${d.no}판 — 전투 확인 항목 없는 판은 만들지 않는다`).toBeGreaterThan(0);
      expect(d.reward[0]).toBeGreaterThanOrEqual(100);
      expect(d.reward[1]).toBeLessThanOrEqual(1000);
    }
  });
  it('항목은 판·화면만·공통·못 덮음 가운데 정확히 한 곳에 있다', () => {
    const ids = [...M.decks.flatMap((d: any) => d.checks.map((c: any) => c.id)), ...M.screens.map((c: any) => c.id), ...M.uncovered.map((c: any) => c.id), ...M.common.map((c: any) => c.id), ...M.statsLeft.map((c: any) => c.id)];
    expect(new Set(ids).size).toBe(ids.length);
    const before = M.decks.reduce((a: number, d: any) => a + d.before.length, 0);
    expect(ids.length + before).toBe(M.totals.items);
  });
  it('원문 근사·미반영 전법 — 편성에 그 전법(또는 고유 전법의 무장)이 들어 있다', () => {
    for (const d of M.decks) for (const c of d.checks.filter((c: any) => c.id.startsWith('C-'))) {
      const sid = c.id.slice(2);
      const has = d.units.some((u: any) => u.skillIds.includes(sid) || gen.get(u.generalId).uniqueSkillId === sid);
      expect(has, `${d.no}판 ${c.id}`).toBe(true);
    }
  });
  it('능력치 미확인 무장은 50레벨 능력치 화면을 요구한다', () => {
    const all = [...M.decks.flatMap((d: any) => d.before), ...M.screens.map((c: any) => c.text)].join('\n');
    for (const g of b.generals.filter((g: any) => g.dataStatus?.stats && g.krRelease !== '미출시')) expect(all, g.id).toContain(`${g.name.ko} 무장 상세`);
  });
  it('열린 검증요청 글(옛 녹화 계획 판 글 제외)은 모두 녹화 안내에 들어 있다', () => {
    const all = [...M.decks.flatMap((d: any) => [...d.before, ...d.checks.map((c: any) => c.text)]), ...[...M.screens, ...M.common, ...M.uncovered, ...M.talk].map((c: any) => c.text)].join('\n');
    for (const p of designPosts().filter((p: any) => p.type === '검증요청' && p.status === '열림' && !/^녹화 (계획|안내)/.test(p.title))) expect(all, p.id).toContain(p.title);
  });
  it('잠정 스탯 영향 규정 J10 이 공통 확인에 있고, 편성의 "영향 받음" 전법은 그 판의 스탯 영향 값 표에 있다', () => {
    expect(M.common.some((c: any) => c.id === 'J-J10')).toBe(true);
    const sk = new Map<string, any>(b.skills.map((s: any) => [s.id, s]));
    for (const d of M.decks) for (const u of d.units) for (const sid of [gen.get(u.generalId).uniqueSkillId, ...u.skillIds]) {
      if (/의 영향(을)? 받/.test(sk.get(sid)?.text || '')) expect(d.stats.some((x: any) => x.skill === sk.get(sid).name.ko), `${d.no}판 ${sid}`).toBe(true);
    }
  });
  it('전설 우선: 앞 판일수록 전설 항목이 많고, 1판에는 영웅 항목이 전설보다 적다', () => {
    expect(M.decks[0].legend).toBeGreaterThan(M.decks[0].hero);
    const half = Math.ceil(M.decks.length / 2);
    const sum = (ds: any[], k: string) => ds.reduce((a, d) => a + d[k], 0);
    expect(sum(M.decks.slice(0, half), 'legend')).toBeGreaterThan(sum(M.decks.slice(half), 'legend'));
  });
  it('드라이브 공유 가이드에 "링크가 있는 모든 사용자"·뷰어 안내', () => {
    expect(M.driveGuide.join(' ')).toContain('링크가 있는 모든 사용자');
  });
});
