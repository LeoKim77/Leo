// 금병법 함수(packages/engine/src/manuals/<id>.ts) 구조 검사
import { describe, it, expect } from 'vitest';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { Simulator } from '../packages/engine/src/index.ts';
import { MANUAL_MODULES } from '../packages/engine/src/manuals/index.ts';

const bundle: any = buildBundle();
const allManuals = bundle.generals.flatMap((g: any) => (g.manuals || []).map((m: any) => ({ g, m })));

describe('금병법 함수', () => {
  it('엔진 정의가 있는 금병법은 모두 함수 파일에서 온다', () => {
    const json: any = buildBundle({ fromJson: true });
    const defined = json.generals.flatMap((g: any) => (g.manuals || []).filter((m: any) => m.engine).map((m: any) => m.id));
    const fromFile = new Set(allManuals.filter(({ m }: any) => m.engine?.fn).map(({ m }: any) => m.id));
    expect(defined.filter((id: string) => !fromFile.has(id))).toEqual([]);
    // 파일마다 번들의 금병법 하나에 연결된다(무장·이름이 원문과 맞음)
    const linked = new Set(allManuals.map(({ m }: any) => m.engine?.fn).filter(Boolean));
    expect(Object.keys(MANUAL_MODULES).filter(id => !linked.has(id))).toEqual([]);
  });

  it('runs 개수 = parts 개수, 부르는 효과 항목 번호가 정의에 있다', () => {
    const KEY: Record<string, string> = { statMod: 'statMods', damage: 'damage', heal: 'heal', buff: 'buffs', dispel: 'dispel', status: 'statusEffects', grant: 'grants' };
    const bad: string[] = [];
    for (const m of Object.values(MANUAL_MODULES)) {
      const parts = m.def.parts || [];
      if ((m.runs || []).length !== parts.length) bad.push(`${m.id} runs ${(m.runs || []).length} ≠ parts ${parts.length}`);
      (m.runs || []).forEach((run, i) => {
        if (!run) return;
        const eff = parts[i]?.effects || {};
        const api: any = { has: () => false, chance: () => true, stat: () => 100, targets: () => [], guard: () => {}, tag: (_n: string, us: any[]) => us || [], tagged: () => [], pick: () => null, friendsOf: () => [], enemiesOf: () => [], infl: () => 1, unit: {}, skill: { effects: eff }, eventCtx: null };
        for (const [fn, key] of Object.entries(KEY)) api[fn] = (x: any) => { if (typeof x === 'number' && !(eff[key] || [])[x]) bad.push(`${m.id} parts[${i}] c.${fn}(${x})`); };
        run(api);
      });
    }
    expect(bad).toEqual([]);
  });

  it('함수 실행 = 고정 순서 실행 (손보지 않은 금병법, 전보 동일)', () => {
    // 같은 번들에서 금병법 함수 연결(fn)만 뗀 쪽과 비교한다
    const plain: any = structuredClone({ ...bundle });
    for (const g of plain.generals) for (const m of g.manuals || []) if (m.engine) delete m.engine.fn;
    const A = new Simulator(bundle), B = new Simulator(plain);
    const withParts = allManuals.filter(({ m }: any) => m.engine?.fn && m.engine.parts?.length && (m.status === 'ok' || m.status === 'approx') && !MANUAL_MODULES[m.engine.fn]?.revised);
    const filler = ['zhuge-liang', 'zhou-yu', 'lu-xun'];
    let diff = 0, n = 0;
    for (const { g, m } of withParts) {
      const mates = filler.filter(id => id !== g.id).slice(0, 2);
      const units = (s: Simulator) => [g.id, ...mates].map(id => {
        return { generalId: id, skillIds: [], ...(id === g.id ? { manualId: m.id } : { manualId: 'none' }) };
      });
      // 상대 티어덱은 금병법을 빼고 쓴다(손본 금병법이 섞이면 함수 쪽이 원문대로 달라지는 게 정상)
      const foe = (s: Simulator) => { const d: any = s.tierDeckSpec(bundle.tierDecks[n % bundle.tierDecks.length].id); return { ...d, units: d.units.map((u: any) => ({ ...u, manualId: 'none' })) }; };
      const a = A.simulate({ formation: bundle.formations[0].id, units: units(A) } as any, foe(A), { seed: 'mf' + n });
      const b = B.simulate({ formation: bundle.formations[0].id, units: units(B) } as any, foe(B), { seed: 'mf' + n });
      if (a.log.join('\n') !== b.log.join('\n')) diff++;
      n++;
    }
    expect(n).toBeGreaterThan(20);
    expect(diff).toBe(0);
  });
});

describe('금병법 원문 대조 보정 (2026-10-05)', () => {
  const sim = new Simulator(bundle);
  const gen = (n: string) => bundle.generals.find((g: any) => g.name.ko === n);
  const unit = (n: string, m?: string) => ({ generalId: gen(n).id, skillIds: [] as string[], manualId: m ? gen(n).manuals.find((x: any) => x.name === m).id : 'none' });
  const foe = { formation: '기형진', units: [unit('손책'), unit('대교'), unit('주유')] };
  const logOf = (units: any[], seed: number) => sim.simulate({ formation: '기형진', units } as any, foe as any, { seed }).log.join('\n');

  it('황개〈견결〉: 고육지계로 우군에게 피해를 받으면 받는 피해 −12% (FIX-014: 피해는 황개가 받는다)', () => {
    const logs = [1, 2, 3, 4, 5, 6].map(s => logOf([unit('황개', '견결'), unit('제갈량'), unit('전위')], s));
    expect(logs.some(l => /\[황개\]은\(는\) \[제갈량\]의 【고육지계】 효과로 병력이/.test(l))).toBe(true);
    expect(logs.some(l => /\[제갈량\]은\(는\) \[제갈량\]의 【고육지계】/.test(l))).toBe(false);
    expect(logs.some(l => l.includes('금병법〈견결〉」 효과를 발동'))).toBe(true);
  });

  it('화타〈청낭경〉: 화타가 회복시킨 목표의 주는 피해 증가 (회복 이벤트)', () => {
    const l = logOf([unit('화타', '청낭경'), unit('조조'), unit('전위')], 1);
    expect(l).toMatch(/「금병법〈청낭경〉」이\(가\) \d스택 중첩/);
  });

  it('동탁〈왕신〉: 탈취 20 → 32, 적군·우군 모두와 자신 증가분에 반영', () => {
    const l = logOf([unit('동탁', '왕신'), unit('전위'), unit('화타')], 1);
    expect(l).toMatch(/^1턴:\s+\[전위\]의 【통솔】이\(가\) 32\.00\(/m);
    expect(l).toMatch(/^1턴:\s+\[동탁\]의 【통솔】이\(가\) 160\.00\(/m);
  });

  it('견희〈낙신부 하권〉: 낙수의 여신이 무력 최고 우군에게', () => {
    const l = logOf([unit('견희', '낙신부 하권'), unit('전위'), unit('화타')], 1);
    expect(l).toMatch(/^1턴:\s+\[전위\]의 【주는피해】이\(가\) 12\.25%/m);
  });
});
