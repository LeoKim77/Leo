// 영웅 무장 23명·고유 전법 (녹화 2026-10-11 무장_영웅.mp4) — FEAT-033
import { describe, it, expect } from 'vitest';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { Simulator } from '../packages/engine/src/index.ts';
import { SKILL_MODULES } from '../packages/engine/src/skills/index.ts';

const bundle: any = buildBundle();
const sim = new Simulator(bundle);
const HERO_IDS = ['yang-xiu', 'liu-ye', 'wen-pin', 'cao-hong', 'zhong-yao', 'cao-zhen', 'zang-ba', 'guo-huai', 'jian-yong', 'ma-su', 'ma-liang',
  'shamoke', 'chen-wu', 'han-dang', 'dong-xi', 'jiang-qin', 'ding-feng', 'pan-zhang', 'kong-rong', 'zhang-mancheng', 'huangfu-song-hero', 'lu-zhi', 'guo-tu'];
const g = (id: string) => bundle.generals.find((x: any) => x.id === id);
const U = (id: string, s: string[] = []) => ({ generalId: id, skillIds: s, manualId: 'none' });
// 상대는 시즌1 티어덱(액티브 전법 보유 — 양수 민첩한 대응은 적군 액티브에 반응)
const foe = sim.tierDeckSpec(bundle.tierDecks.find((t: any) => t.season === 'S1').id);

describe('영웅 무장 (녹화 2026-10-11)', () => {
  it('23명 모두 등급 영웅·고유 전법 함수 파일이 있다', () => {
    for (const id of HERO_IDS) {
      expect(g(id), id).toBeTruthy();
      expect(g(id).grade).toBe('영웅');
      expect(SKILL_MODULES[g(id).uniqueSkillId], id).toBeTruthy();
    }
  });
  it('50레벨 환산 = 5레벨 + 45×성장 (조진 통솔 101 + 45×1.73)', () => {
    expect(g('cao-zhen').stats.통솔).toBeCloseTo(101 + 45 * 1.73, 2);
  });
  it('영웅 황보숭(반란 평정)은 시즌3 황보숭과 다른 카드, 같은 인물이라 한 부대에 함께 못 넣는다', () => {
    expect(g('huangfu-song-hero').uniqueSkillId).not.toBe(g('huangfu-song').uniqueSkillId);
    expect(g('huangfu-song-hero').samePerson).toBe('huangfu-song');
    expect(g('huangfu-song').grade).toBeUndefined();
  });
  it('23명 각각 시뮬에서 고유 전법이 오류 없이 발동한다', () => {
    for (const id of HERO_IDS) {
      const name = bundle.skills.find((s: any) => s.id === g(id).uniqueSkillId).name.ko;
      let hits = 0;
      for (let k = 0; k < 6; k++) {
        const r = sim.simulate({ formation: '일자진', units: [U(id), U('cao-cao'), U('xun-yu')] } as any, foe, { seed: k });
        hits += r.log.filter((l: string) => l.includes(name) && !l.includes('대기')).length;
      }
      expect(hits, id).toBeGreaterThan(0);
    }
  });
  it('유현정책·투혼의 추격 원문 갱신', () => {
    const s = (id: string) => bundle.skills.find((x: any) => x.id === id);
    expect(s('know-people').text).toContain('랜덤 아군 2명');
    expect(s('relentless-chase').name.ko).toBe('투혼의 추격');
  });
});
