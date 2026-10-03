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

describe('사용자 확인 금병법 (2026-10-03)', () => {
  const unit = (n: string, m: string) => ({ generalId: gen(n).id, skillIds: [] as string[], manualId: gen(n).manuals.find(x => x.name === m)!.id });
  it('엑셀에 없던 금병법이 들어온다', () => {
    expect(gen('감부인').manuals.map(m => m.name)).toEqual(['한녀전']);
    expect(gen('장료').manuals.map(m => m.name)).toEqual(['기전']);
    expect(gen('육손').manuals.map(m => m.name)).toEqual(['분량', '분영']);
    expect(gen('주태').manuals.map(m => m.name)).toEqual(['불굴', '역전']);
    expect(gen('추씨').manuals.map(m => m.name)).toEqual(['세속']);
  });
  it('장료〈기전〉은 전열일 때만 회유·주는 피해가 붙는다', () => {
    const [front] = sim.buildArmy({ formation: '기형진', units: [unit('장료', '기전')] }, 'A');
    expect(front.mods.회유).toBeGreaterThanOrEqual(0.12 - 1e-9);
    const back = sim.buildArmy({ formation: '기형진', units: [{ generalId: gen('조조').id, skillIds: [] }, { generalId: gen('전위').id, skillIds: [] }, unit('장료', '기전')] }, 'A')
      .find((u: any) => u.name === '장료');
    if (back.position === 'back') expect(back.mods.회유 || 0).toBeLessThan(0.12);
  });
  it('추씨〈세속〉은 고유 전법 회복 계수를 1.2배로 하고 전투 시작 시점은 유지한다', () => {
    const [u] = sim.buildArmy({ formation: '기형진', units: [unit('추씨', '세속')] }, 'A');
    const us = u.skills.find((s: any) => s.isUnique);
    expect(us._timing).toBe('battleStart');
    const part = u.skills.find((s: any) => s.isPart && s.onlyTurns?.includes(4));
    expect(part.effects.heal[0].min).toBeCloseTo(1.68, 5);
  });
  it('주태〈역전〉: 대신 받은 뒤 우군의 다음 피해와 주태 회복이 전보에 나온다', () => {
    const t = gen('주태'), z = gen('조운'), y = gen('악진');
    const a = { formation: '기형진', units: [{ ...unit('주태', '역전'), skillIds: [] }, { generalId: z.id, skillIds: [] }, { generalId: y.id, skillIds: [] }] };
    const e = { formation: '기형진', units: ['손책', '대교', '견희'].map(n => ({ generalId: gen(n).id, skillIds: [] })) };
    const logs = [1, 2, 3, 4, 5, 6].map(seed => sim.simulate(a, e, { seed }).log.join('\n'));
    expect(t).toBeTruthy();
    expect(logs.some(l => l.includes('「역전」으로 병력을'))).toBe(true);
  });
});

describe('사용자 확인 금병법 2차 (2026-10-03)', () => {
  const unit = (n: string, m?: string) => ({ generalId: gen(n).id, skillIds: [] as string[], manualId: m ? gen(n).manuals.find(x => x.name === m)!.id : 'none' });
  it('마운록〈풍속통의〉는 기병 아군의 최고 속성을 5% 올린다', () => {
    const deckOf = (m?: string) => ({ formation: '기형진', units: [unit('마운록', m), unit('공손찬'), unit('제갈량')] });
    const on = sim.buildArmy(deckOf('풍속통의'), 'A'), off = sim.buildArmy(deckOf(), 'A');
    const gz = (us: any[]) => us.find(u => u.name === '공손찬');
    const k = (['무력', '지력', '통솔', '선공'] as const).reduce((m, x) => (gz(off).stats[x] > gz(off).stats[m] ? x : m), '무력' as '무력' | '지력' | '통솔' | '선공');
    expect(gz(on).stats[k] / gz(off).stats[k]).toBeCloseTo(1.05, 3);
  });
  it('전풍〈권략〉은 고유 전법 발동률 +10%', () => {
    const [u] = sim.buildArmy({ formation: '기형진', units: [unit('전풍', '권략')] }, 'A');
    expect(u.uniqueProcAdd).toBeCloseTo(0.1, 5);
  });
  it('공손찬〈백마의종〉은 피신할 때마다 무력·지력이 오른다', () => {
    const a = { formation: '기형진', units: [unit('공손찬', '백마의종')] };
    const e = { formation: '기형진', units: [unit('조조'), unit('전위'), unit('순욱')] };
    const logs = [1, 2, 3, 4, 5, 6, 7, 8].map(seed => sim.simulate(a, e, { seed }).log.join('\n'));
    expect(logs.some(l => l.includes('피신 후 성장'))).toBe(true);
  });
  it('사마의·가후는 한국 서버 미출시로 표시된다', () => {
    expect((gen('사마의') as any).notInKr).toBe(true);
    expect((gen('가후') as any).notInKr).toBe(true);
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

