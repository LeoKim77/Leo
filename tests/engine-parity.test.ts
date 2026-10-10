// 이식한 엔진(packages/engine/src/legacy/core-v1.12b.js, 고정본)이 원본 v1.12b HTML 엔진과
// 같은 시드에서 "글자 하나까지 같은 전보"를 내는지 확인한다.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { createLegacyEngine } from '../packages/engine/src/legacy/core-v1.12b.js';
import { createRng } from '../packages/engine/src/rng.ts';

const html = readFileSync(join(__dirname, '..', 'legacy', 'simulator-v1.12b.html'), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const dataScript = scripts.find(s => s.includes('window.GAME_DATA ='))!;
const engineScript = scripts.find(s => s.includes('window.ENGINE ='))!;

function originalEngine(seed: string) {
  const rng = createRng(seed);
  const math = Object.create(Math);
  math.random = rng;
  const ctx: any = { window: {}, console, Math: math };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(dataScript, ctx);
  vm.runInContext(engineScript, ctx);
  return { E: ctx.ENGINE, D: ctx.GAME_DATA };
}

function portedEngine(seed: string) {
  const ctx: any = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(dataScript, ctx);
  const D = JSON.parse(JSON.stringify(ctx.window.GAME_DATA));
  const E = createLegacyEngine(D);
  E.setRng(createRng(seed));
  return { E, D };
}

// v1.12b UI 의 tierDeckToUnits 와 같은 방식으로 부대를 만든다
function tierDeckUnits(E: any, D: any, td: any, side: string) {
  const generalByName = Object.fromEntries(D.generals.map((g: any) => [g.name, g]));
  const skillByName = Object.fromEntries(D.skills.map((s: any) => [s.name, s]));
  const uniqueByGeneralName = Object.fromEntries(D.uniqueSkills.map((s: any) => [s.usedByGeneral, s]));
  const formation = D.formations.find((f: any) => f.name === '기형진') || D.formations[0];
  const units = td.units.map((u: any, idx: number) => {
    const g = generalByName[u.general];
    const skills = [u.skill1, u.skill2].map((n: string) => skillByName[n]).filter(Boolean);
    const position = g.position === '후열' ? 'back' : g.position === '전열' ? 'front' : 'mid';
    return E.buildUnit(g, skills, uniqueByGeneralName[g.name], formation, position, side, idx);
  });
  const prepLog: string[] = [];
  E.applyFormationEffects(units, prepLog);
  E.applyTeamCompositionBonuses(units, prepLog);
  E.applyBondBonuses(units, D.bonds, prepLog);
  E.applyLoadoutSynergies(units);
  units.forEach((u: any) => { u.prepLog = prepLog; });
  return units;
}

function battle(which: 'orig' | 'port', seed: string, a: number, b: number) {
  const { E, D } = which === 'orig' ? originalEngine(seed) : portedEngine(seed);
  const A = tierDeckUnits(E, D, D.tierDecks[a], 'A');
  const B = tierDeckUnits(E, D, D.tierDecks[b], 'B');
  const res = E.simulateOneBattle(A, B, E.DEFAULT_COEFFS);
  return { log: res.log as string[], winner: res.winner, turns: res.turns };
}

describe('v1.12b 엔진 이식 동등성', () => {
  const pairs: Array<[number, number]> = [[0, 1], [2, 3], [4, 7], [10, 14], [20, 24], [5, 18]];
  for (const [a, b] of pairs) {
    it(`티어덱 ${a} vs ${b} — 같은 시드에서 전보 동일`, () => {
      for (const seed of ['s1', 's2', 's3']) {
        const o = battle('orig', `${seed}-${a}-${b}`, a, b);
        const p = battle('port', `${seed}-${a}-${b}`, a, b);
        expect(p.winner).toBe(o.winner);
        expect(p.turns).toBe(o.turns);
        expect(p.log).toEqual(o.log);
      }
    });
  }

  it('같은 시드 두 번 → 같은 결과 (결정성)', () => {
    const x = battle('port', 'fixed', 0, 1);
    const y = battle('port', 'fixed', 0, 1);
    expect(y.log).toEqual(x.log);
  });
});
