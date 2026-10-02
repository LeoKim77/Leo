// 전투 시뮬레이터 공개 API.
// GameBundle(한국판 데이터 + 엔진 정의) → v1.12b 엔진 형식으로 바꿔 실행한다.
import { createLegacyEngine } from './legacy/core.js';
import { createRng } from './rng.ts';
import type { GameBundle, General, Skill, Manual } from './model.ts';

export * from './model.ts';
export { createRng } from './rng.ts';

export type Position = 'front' | 'mid' | 'back';

export interface DeckUnitSpec {
  generalId: string;
  skillIds: string[];
  position?: Position;
  /** 금병법 id (m-<무장id>-<순번>). 생략하면 시뮬 가능한 첫 금병법, 'none' 이면 미장착 */
  manualId?: string;
}

/** "a.b.0.c" 경로에 값을 넣는다 */
function setPath(obj: any, path: string, value: unknown) {
  const keys = path.split('.');
  let cur = obj;
  keys.slice(0, -1).forEach((k, i) => {
    if (cur[k] == null) cur[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    cur = cur[k];
  });
  cur[keys[keys.length - 1]] = value;
}
export interface DeckSpec {
  name?: string;
  formation?: string;
  units: DeckUnitSpec[];
}

/** 감사(audit)용 구조화 기록 한 건 */
export interface TraceEvent {
  e: 'battle' | 'turn' | 'action' | 'skill' | 'roll' | 'damage' | 'evade' | 'heal' | 'status' | 'blocked' | 'basic' | 'end';
  turn: number;
  phase: string;
  [k: string]: unknown;
}

export interface SimOptions {
  /** 무장 스탯 출처: 한국 DB 엑셀(기본) 또는 v1.12b 보정 실험 당시 값 */
  statsSource?: 'kr' | 'legacy';
  skillLevel?: number;
  coeffs?: Record<string, unknown>;
}

export interface BattleResult {
  winner: 'A' | 'B' | 'draw';
  turns: number;
  log: string[];
  trace?: TraceEvent[];
  troopHistory: Array<{ turn: number; A: number; B: number }>;
  units: Array<{ id: string; side: string; name: string; generalId: string; troops: number; maxTroops: number; dmgDealt: number; healDone: number }>;
}

export interface MonteCarloResult {
  runs: number;
  winA: number;
  winB: number;
  draw: number;
  winRateA: number;
  winRateB: number;
  avgTurns: number;
  contribution: Array<{ id: string; name: string; value: number; pct: number; procs: number; procsPerRun: number }>;
  contributionB: MonteCarloResult['contribution'];
  troopCurveAll: Array<{ turn: number; A: number; B: number }>;
  seed: string;
}

const legacyPosition = (row: string): Position => (row === '후열' ? 'back' : row === '전열' ? 'front' : 'mid');

/** GameBundle → v1.12b GAME_DATA 형태 */
export function toLegacyGameData(bundle: GameBundle & { engineGenerals?: Record<string, any> }, opts: SimOptions = {}) {
  const genById = new Map(bundle.generals.map(g => [g.id, g]));
  const legacySkill = (s: Skill) => {
    const eng = (s.engine || {}) as Record<string, any>;
    const owner = s.ownerGeneralId ? genById.get(s.ownerGeneralId) : undefined;
    return {
      ...eng,
      id: s.id,
      name: s.name.ko,
      type: s.kind,
      trait: s.trait,
      grade: s.grade,
      // 발동 확률은 한국판 10레벨 표기가 기준. 없으면 v1.12b 값
      procRate: s.procRateText || eng.legacyProcRate || '100%',
      raw: eng.raw || s.text,
      effects: eng.effects || { damage: [], heal: [], buffs: [], statMods: [], statusEffects: [], targets: [] },
      isUnique: s.isUnique,
      usedByGeneral: owner ? owner.name.ko : null,
    };
  };
  const generals = bundle.generals.map((g: General) => {
    const eg = bundle.engineGenerals?.[g.id];
    const stats = opts.statsSource === 'legacy' && eg?.legacyStats ? eg.legacyStats : g.stats;
    return {
      id: g.id,
      name: g.name.ko,
      gender: g.gender || eg?.gender || 'M',
      country: g.faction,
      position: g.row,
      role: g.role,
      unitType: g.unitType,
      stats: { 무력: 0, 지력: 0, 통솔: 0, 선공: 0, ...stats },
      maxTroops: g.maxTroops,
      uniqueSkillId: g.uniqueSkillId,
      manuals: g.manuals || [],
    };
  });
  return {
    generals,
    skills: bundle.skills.filter(s => !s.isUnique).map(legacySkill),
    uniqueSkills: bundle.skills.filter(s => s.isUnique).map(legacySkill),
    formations: bundle.formations.map(f => ({
      id: f.id, name: f.name, hitRate: f.hitRate, traits: f.traits,
      effects: (f.engine as any)?.effects || [],
    })),
    bonds: bundle.bonds.map(b => {
      const eng = (b.engine || {}) as any;
      return {
        name: b.name, required: b.required, members: b.memberNames,
        membersInRoster: b.memberNames.filter(n => bundle.generals.some(g => g.name.ko === n)),
        effect: b.text, parsed: eng.parsed || {}, simulatable: !!eng.simulatable,
      };
    }),
    tierDecks: [],
  };
}

export class Simulator {
  readonly data: ReturnType<typeof toLegacyGameData>;
  private engine: any;
  private generalById: Map<string, any>;
  private skillById: Map<string, any>;
  private uniqueById: Map<string, any>;

  constructor(readonly bundle: GameBundle, readonly opts: SimOptions = {}) {
    this.data = toLegacyGameData(bundle, opts);
    this.engine = createLegacyEngine(this.data);
    if (opts.skillLevel) this.engine.setSkillLevel(opts.skillLevel);
    this.generalById = new Map(this.data.generals.map(g => [g.id, g]));
    this.skillById = new Map(this.data.skills.map(s => [s.id, s]));
    this.uniqueById = new Map(this.data.uniqueSkills.map(s => [s.id, s]));
  }

  get coeffs() {
    return { ...this.engine.DEFAULT_COEFFS, ...(this.opts.coeffs || {}) };
  }

  /** 덱 구성이 시뮬 가능한지 검사. 문제 목록을 돌려준다 */
  validateDeck(deck: DeckSpec): string[] {
    const errs: string[] = [];
    if (!deck.units.length || deck.units.length > 3) errs.push('부대는 무장 1~3명이어야 합니다.');
    const seen = new Set<string>();
    deck.units.forEach((u, i) => {
      const g = this.generalById.get(u.generalId);
      if (!g) errs.push(`${i + 1}번 무장 id(${u.generalId})를 찾을 수 없습니다.`);
      if (seen.has(u.generalId)) errs.push(`${g?.name || u.generalId} 무장이 중복됩니다.`);
      seen.add(u.generalId);
      u.skillIds.forEach(sid => { if (!this.skillById.has(sid)) errs.push(`전법 id(${sid})를 찾을 수 없습니다.`); });
      if (new Set(u.skillIds).size !== u.skillIds.length) errs.push(`${g?.name} 의 전법이 중복됩니다.`);
    });
    return errs;
  }

  buildArmy(deck: DeckSpec, side: 'A' | 'B') {
    const E = this.engine;
    const formation = this.data.formations.find(f => f.name === deck.formation) || this.data.formations.find(f => f.name === '기형진') || this.data.formations[0];
    const manualsUsed: Array<{ unit: any; manual: Manual }> = [];
    const units = deck.units.map((u, idx) => {
      const g = this.generalById.get(u.generalId);
      if (!g) throw new Error(`무장 없음: ${u.generalId}`);
      const skills = u.skillIds.map(id => this.skillById.get(id)).filter(Boolean);
      let uskill = this.uniqueById.get(g.uniqueSkillId);
      const manual = this.pickManual(g, u.manualId);
      const eng = manual?.engine;
      // 금병법이 고유 전법을 고치면 이 무장에게만 사본을 만들어 적용한다
      if (uskill && eng?.uniquePatch) {
        uskill = structuredClone(uskill);
        for (const [path, v] of Object.entries(eng.uniquePatch)) setPath(uskill, path, v);
        delete uskill._timing;
      }
      const manualSkills = (eng?.parts || []).map((part, i) => ({
        ...structuredClone(part),
        id: `${manual!.id}#${i + 1}`,
        name: `금병법〈${manual!.name}〉`,
        type: '패시브',
        procRate: '100%',
        raw: manual!.text,
        isManual: true,
      }));
      const unit = E.buildUnit(g, [...skills, ...manualSkills], uskill, formation, u.position || legacyPosition(g.position), side, idx);
      if (manual && eng) {
        Object.assign(unit, eng.unit || {});
        unit.manual = { id: manual.id, name: manual.name, status: manual.status };
        manualsUsed.push({ unit, manual });
      }
      return unit;
    });
    const prepLog: string[] = [];
    E.applyFormationEffects(units, prepLog);
    E.applyTeamCompositionBonuses(units, prepLog);
    E.applyBondBonuses(units, this.data.bonds, prepLog);
    E.applyLoadoutSynergies(units);
    // 금병법 고정 증감 (편성 보너스 다음에 더한다)
    for (const { unit, manual } of manualsUsed) {
      const st = manual.engine?.static;
      const from = (manual.engine?.unit as any)?.statFromStat;
      const parts: string[] = [];
      for (const [k, v] of Object.entries(st?.mods || {})) { unit.mods[k] = (unit.mods[k] || 0) + v; parts.push(`${k} ${v > 0 ? '+' : ''}${Math.round(v * 1000) / 10}%`); }
      for (const [k, v] of Object.entries(st?.stats || {})) { unit.stats[k] = (unit.stats[k] || 0) + v; parts.push(`${k} ${v > 0 ? '+' : ''}${v}`); }
      if (from) { const add = unit.stats[from.from] * from.ratio; unit.stats[from.stat] += add; parts.push(`${from.stat} +${add.toFixed(1)}`); }
      prepLog.push(`0턴: [${unit.name}] 금병법〈${manual.name}〉 장착${manual.status === 'approx' ? ' (근사)' : ''}${parts.length ? ' — ' + parts.join(', ') : ''}`);
    }
    units.forEach((u: any) => { u.prepLog = prepLog; });
    return units;
  }

  /** 한 판. trace=true 면 감사용 구조화 기록을 함께 돌려준다 */
  simulate(a: DeckSpec, b: DeckSpec, opt: { seed?: string | number; trace?: boolean } = {}): BattleResult {
    const seed = opt.seed ?? `${Date.now()}-${Math.random()}`;
    this.engine.setRng(createRng(seed));
    const trace: TraceEvent[] = [];
    this.engine.setTrace(opt.trace ? (ev: TraceEvent) => trace.push(ev) : null);
    try {
      const res = this.engine.simulateOneBattle(this.buildArmy(a, 'A'), this.buildArmy(b, 'B'), this.coeffs);
      return {
        winner: res.winner, turns: res.turns, log: res.log, troopHistory: res.troopHistory,
        trace: opt.trace ? trace : undefined,
        units: res.units.map((u: any) => ({ id: u.id, side: u.side, name: u.name, generalId: u.generalId, troops: u.troops, maxTroops: u.maxTroops, dmgDealt: u.dmgDealt, healDone: u.healDone })),
      };
    } finally {
      this.engine.setTrace(null);
    }
  }

  /** 몬테카를로. 시드가 같으면 결과도 같다 */
  monteCarlo(a: DeckSpec, b: DeckSpec, opt: { runs?: number; seed?: string | number } = {}): MonteCarloResult {
    const runs = opt.runs ?? 500;
    const seed = String(opt.seed ?? Date.now());
    this.engine.setRng(createRng(seed));
    this.engine.setTrace(null);
    const mc = this.engine.runMonteCarlo(() => [this.buildArmy(a, 'A'), this.buildArmy(b, 'B')], this.coeffs, runs);
    return {
      runs: mc.runs, winA: mc.winA, winB: mc.winB, draw: mc.draw,
      winRateA: mc.winRateA, winRateB: mc.winRateB, avgTurns: mc.avgTurns,
      contribution: mc.contribution, contributionB: mc.contributionB,
      troopCurveAll: mc.troopCurveAll, seed,
    };
  }

  /** 덱에 지정한 금병법 → 없으면 시뮬 가능한 첫 금병법. 미지원·정의 없음은 장착하지 않는다 */
  pickManual(g: { manuals?: Manual[] }, manualId?: string): Manual | null {
    const ms = g.manuals || [];
    if (manualId === 'none') return null;
    const usable = (m?: Manual) => !!m && (m.status === 'ok' || m.status === 'approx');
    const chosen = manualId ? ms.find(m => m.id === manualId) : ms.find(usable);
    return usable(chosen) ? chosen! : null;
  }

  /** 티어덱 → DeckSpec */
  tierDeckSpec(tierDeckId: string, formation = '기형진'): DeckSpec {
    const td = this.bundle.tierDecks.find(t => t.id === tierDeckId);
    if (!td) throw new Error(`티어덱 없음: ${tierDeckId}`);
    return {
      name: `${td.tier} ${td.name}`,
      formation,
      units: td.units.map(u => ({ generalId: u.generalId, skillIds: u.skillIds.filter(id => !id.startsWith('?')), manualId: u.manualId })),
    };
  }
}
