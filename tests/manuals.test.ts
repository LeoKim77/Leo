import { describe, it, expect } from 'vitest';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { Simulator } from '../packages/engine/src/index.ts';

const b = buildBundle();
const sim = new Simulator(b);
const gen = (name: string) => b.generals.find(g => g.name.ko === name)!;

describe('금병법 (R-003)', () => {
  it('엑셀의 모든 금병법에 엔진 정의가 연결된다', () => {
    const missing = b.generals.flatMap(g => g.manuals.filter(m => m.status === 'missing' && !(m as any).textUnknown).map(m => `${g.name.ko}〈${m.name}〉`));
    expect(missing).toEqual([]);
  });

  it('티어덱은 세팅 병법에 적힌 금병법을 고른다', () => {
    const td = b.tierDecks.find(t => t.units.some(u => u.generalName === '조조' && u.manualSlots.flat().includes('맹덕신서 하권')))!;
    const u = td.units.find(x => x.generalName === '조조')!;
    expect(gen('조조').manuals.find(m => m.id === u.manualId)!.name).toBe('맹덕신서 하권');
  });

  const deck = (name: string, manual: string | undefined, skills: string[]) => {
    const g = gen(name);
    return { formation: '기형진', units: [{ generalId: g.id, skillIds: skills, manualId: manual === undefined ? undefined : manual === 'none' ? 'none' : g.manuals.find(m => m.name === manual)!.id }] };
  };

  it('고정 증감 금병법은 편성 시 스탯·능력치에 더해진다', () => {
    const [withM] = sim.buildArmy(deck('전위', '절무', []), 'A');
    const [noM] = sim.buildArmy(deck('전위', 'none', []), 'A');
    expect(withM.stats.무력 - noM.stats.무력).toBeCloseTo(10, 5);
    expect(withM.mods.반격피해 - noM.mods.반격피해).toBeCloseTo(0.2, 5);
  });

  it('고유 전법을 고치는 금병법은 그 무장의 사본에만 적용된다', () => {
    const [a] = sim.buildArmy(deck('방덕', '초기', []), 'A');
    const [b2] = sim.buildArmy(deck('방덕', 'none', []), 'B');
    const ua = a.skills.find((s: any) => s.isUnique), ub = b2.skills.find((s: any) => s.isUnique);
    expect(ua.onlyTurns).toEqual([2, 4]);
    expect(ub.onlyTurns).toEqual([3, 5]);
  });

  it('국지한서: 진영 보너스가 없으면 3명 진영 보너스를 받는다', () => {
    const mk = (manual: string) => ({ formation: '기형진', units: [
      { generalId: gen('유비').id, skillIds: [], manualId: gen('유비').manuals.find(m => m.name === manual)!.id },
      { generalId: gen('조조').id, skillIds: [] },
      { generalId: gen('손권').id, skillIds: [] },
    ] });
    const withO = sim.buildArmy(mk('국지한서'), 'A');
    const without = sim.buildArmy(mk('인의론'), 'A');
    expect(withO[1].stats.통솔 / without[1].stats.통솔).toBeCloseTo(1.1, 3);
  });

  it('미지원 금병법은 장착되지 않는다', () => {
    const [u] = sim.buildArmy(deck('황충', '궁술', []), 'A');
    expect(u.manual).toBeUndefined();
  });
});

describe('전법 정의 수정 (S09·FEAT-003)', () => {
  it('레벨 보간이 뒤집힌 정의가 없다', () => {
    for (const s of b.skills) {
      const eff = (s.engine as any)?.effects || {};
      for (const k of ['statMods', 'buffs', 'damage', 'heal']) for (const d of eff[k] || []) {
        if (d && d.min != null && d.max != null) expect(Math.abs(d.max) + 1e-9 >= Math.abs(d.min), `${s.name.ko} ${k}`).toBe(true);
      }
    }
  });
  it('결사의 다짐: 결사·다짐을 받은 무장이 직접 발동한다', () => {
    const deck = { formation: '기형진', units: [{ generalId: gen('관우').id, skillIds: ['armor-edge'] }, { generalId: gen('조운').id, skillIds: [] }, { generalId: gen('유비').id, skillIds: [] }] };
    let 결사 = 0, 다짐 = 0;
    for (let i = 0; i < 10; i++) {
      const r = sim.simulate(deck, sim.tierDeckSpec('tier-s1-02'), { seed: i, trace: true });
      r.trace!.forEach((e: any) => { if (e.e === 'skill' && e.skill === 'armor-edge>결사') 결사++; if (e.e === 'skill' && e.skill === 'armor-edge>다짐') 다짐++; });
    }
    expect(결사).toBeGreaterThan(20);
    expect(다짐).toBeGreaterThan(5);
  });

  it('일반 공격 전 금병법(감녕〈산림탈기〉)은 평타 직전에 책략 피해를 준다 (FEAT-010)', () => {
    const one = (n: string, m: string) => ({ formation: '기형진', units: [{ generalId: gen(n).id, skillIds: [], manualId: m === 'none' ? 'none' : gen(n).manuals.find(x => x.name === m)!.id }] });
    const a = one('감녕', '산림탈기');
    const e = one('조조', 'none');
    const logs = [1, 2, 3, 4, 5].map(seed => sim.simulate(a, e, { seed }).log.join('\n'));
    expect(logs.some(l => l.includes('금병법〈산림탈기〉'))).toBe(true);
  });

  it('방통〈책략〉은 게임 확인 패치로 들어오고 미지원으로 표시된다', () => {
    const m = gen('방통').manuals.find(x => x.name === '책략')!;
    expect(m.status).toBe('unsupported');
  });
});

describe('진형 (R-013 정정)', () => {
  it('진형 효과가 기본으로 켜져 있고 언월진은 두 칸 전열이다', () => {
    const f = b.formations.find(x => x.name === '언월진')!;
    expect(f.hitRate).toEqual({ front: 0.4, mid: 0.4, back: 0.2 });
    const units = sim.buildArmy({ formation: '언월진', units: ['조조', '전위', '순욱'].map(n => ({ generalId: gen(n).id, skillIds: [] })) }, 'A');
    expect(units.map((u: any) => u.position).filter((p: string) => p !== 'back').length).toBe(2);
    const [k] = sim.buildArmy({ formation: '추형진', units: [{ generalId: gen('전위').id, skillIds: [] }] }, 'A');
    expect(k.mods.주는피해).toBeGreaterThanOrEqual(0.16 - 1e-9);
  });
});

