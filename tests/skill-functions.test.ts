// 전법 함수(packages/engine/src/skills/<id>.ts) 구조 검사
import { describe, it, expect } from 'vitest';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { Simulator } from '../packages/engine/src/index.ts';
import { SKILL_MODULES } from '../packages/engine/src/skills/index.ts';

const bundle: any = buildBundle();

describe('전법 함수', () => {
  it('모든 전법·고유 전법에 함수 파일이 있다', () => {
    const missing = bundle.skills.filter((s: any) => !SKILL_MODULES[s.id]).map((s: any) => s.id);
    expect(missing).toEqual([]);
  });

  it('함수가 부르는 효과 항목 번호가 정의에 모두 있다', () => {
    const KEY: Record<string, string> = { statMod: 'statMods', damage: 'damage', heal: 'heal', buff: 'buffs', dispel: 'dispel', status: 'statusEffects', grant: 'grants' };
    const bad: string[] = [];
    for (const m of Object.values(SKILL_MODULES)) {
      if (!m.run || !m.def) continue;
      const eff = m.def.effects || {};
      const api: any = { has: () => false, chance: () => true, stat: () => 100, targets: () => [], guard: () => {}, tag: (_n: string, us: any[]) => us || [], tagged: () => [], pick: () => null, friendsOf: () => [], enemiesOf: () => [], infl: () => 1, unit: {}, skill: { effects: eff }, eventCtx: null };
      for (const [fn, key] of Object.entries(KEY)) api[fn] = (x: any) => { if (typeof x === 'number' && !(eff[key] || [])[x]) bad.push(`${m.id} c.${fn}(${x})`); };
      m.run(api);
    }
    expect(bad).toEqual([]);
  });

  it('함수 실행 = 예전 고정 순서 해석기 실행 (전보 동일, 티어덱 40판)', () => {
    const json: any = buildBundle({ fromJson: true });
    const A = new Simulator(bundle), B = new Simulator(json, { noSkillFns: true });
    const ids = bundle.tierDecks.map((t: any) => t.id);
    let diff = 0;
    for (let k = 0; k < 40; k++) {
      const i = k % ids.length, j = (k * 7 + 3) % ids.length;
      if (i === j) continue;
      // 원문대로 손본 전법(revised)이 들어간 판은 JSON 원천과 달라지는 게 정상이라 뺀다
      const uses = [ids[i], ids[j]].flatMap(id => { const d: any = A.tierDeckSpec(id); return d.units.flatMap((u: any) => [...u.skillIds, bundle.generals.find((g: any) => g.id === u.generalId)?.uniqueSkillId]); });
      if (uses.some((id: string) => SKILL_MODULES[id]?.revised)) continue;
      const a = A.simulate(A.tierDeckSpec(ids[i]), A.tierDeckSpec(ids[j]), { seed: 'fn' + k });
      const b = B.simulate(B.tierDeckSpec(ids[i]), B.tierDeckSpec(ids[j]), { seed: 'fn' + k });
      if (a.log.join('\n') !== b.log.join('\n')) diff++;
    }
    expect(diff).toBe(0);
  });
});
