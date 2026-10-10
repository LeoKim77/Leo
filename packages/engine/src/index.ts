// 전투 시뮬레이터 공개 API.
// GameBundle(한국판 데이터 + 엔진 정의) → v1.12b 엔진 형식으로 바꿔 실행한다.
import { SKILL_MODULES } from './skills/index.ts';
import { MANUAL_MODULES } from './manuals/index.ts';
import { createLegacyEngine } from './legacy/core.js';
import { createRng } from './rng.ts';
import type { GameBundle, General, Skill, Manual } from './model.ts';

export * from './model.ts';
export { createRng } from './rng.ts';

/** 진형 열 — 게임에는 전열·후열 둘뿐(R-048). 예전 덱의 'mid' 는 전열로 읽는다 */
export type Position = 'front' | 'back';

export interface DeckUnitSpec {
  generalId: string;
  skillIds: string[];
  position?: Position;
  /** 금병법 id (m-<무장id>-<순번>). 생략하면 시뮬 가능한 첫 금병법, 'none' 이면 미장착 */
  manualId?: string;
  /** 병종 바꾸기 (병종 변경 아이템 등). 생략하면 무장 기본 병종 */
  unitType?: string;
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
  e: 'battle' | 'turn' | 'action' | 'skill' | 'roll' | 'damage' | 'evade' | 'heal' | 'status' | 'blocked' | 'basic' | 'end' | 'guard' | 'resist';
  turn: number;
  phase: string;
  [k: string]: unknown;
}

export interface SimOptions {
  /** 전법 함수를 쓰지 않고 예전 고정 순서 해석기로 실행(동등성 검사용) */
  noSkillFns?: boolean;
  /** 무장 스탯 출처: 한국 DB 엑셀(기본) 또는 v1.12b 보정 실험 당시 값 */
  statsSource?: 'kr' | 'legacy';
  skillLevel?: number;
  coeffs?: Record<string, unknown>;
}

/** 전보 툴팁(게임 툴팁과 같은 항목) — stats 는 [무력, 지력, 통솔, 선공], mods 는 [이름, 값], effects 는 [전법·상태, 남은 턴, 시전자, 시전자 편] */
export interface UnitSnap { side: string; unitType: string; troops: number; maxTroops: number; wounded: number; dead: number; alive: boolean; stats: number[]; mods: Array<[string, number]>; effects: Array<[string, number, string, string]> }

export interface BattleResult {
  winner: 'A' | 'B' | 'draw';
  turns: number;
  /** 교전 수 — 8턴 무승부면 생존 무장끼리 재교전 (R-009) */
  rounds?: number;
  log: string[];
  /** FEAT-016: 전보 줄마다 그 줄에 나온 무장의 그 순간 상태 (detail 옵션일 때) */
  lineSnaps?: Array<Record<string, UnitSnap> | null>;
  /** 이 전투에 근사·미반영으로 들어간 효과 (무장별) */
  approx?: { A: ApproxEffect[]; B: ApproxEffect[] };
  trace?: TraceEvent[];
  troopHistory: Array<{ turn: number; A: number; B: number }>;
  units: Array<{ id: string; side: string; name: string; generalId: string; troops: number; maxTroops: number; dmgDealt: number; healDone: number }>;
}

export interface ApproxEffect { owner: string; name: string; kind: '근사' | '일부 미반영' | '미구현' | '임시 자료'; note: string }

export interface MonteCarloResult {
  runs: number;
  winA: number;
  winB: number;
  draw: number;
  winRateA: number;
  winRateB: number;
  avgTurns: number;
  /** 판당 평균 교전 수 (8턴 무승부면 생존 무장끼리 재교전, R-009) */
  avgRounds?: number;
  contribution: Array<{ id: string; name: string; value: number; pct: number; procs: number; procsPerRun: number }>;
  contributionB: MonteCarloResult['contribution'];
  troopCurveAll: Array<{ turn: number; A: number; B: number }>;
  seed: string;
  /** 근사·미반영 효과 (A·B 덱별) — 결과 신뢰도 표시용 */
  approx?: { A: ApproxEffect[]; B: ApproxEffect[] };
}


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
      // 전법 함수(packages/engine/src/skills/<id>.ts) — 엔진이 효과 실행 순서를 이 함수에 맡긴다
      run: opts.noSkillFns ? undefined : SKILL_MODULES[s.id]?.run,
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
      samePerson: (g as any).samePerson,   // R-058
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
    // R-013(2026-10-03 정정): 진형 효과 반영 — 진형 칸별 전열·후열 피격률과 진형 특성. formationEffects=false 면 피격률 균등·효과 없음
    const realFormation = this.data.formations.find(f => f.name === deck.formation) || this.data.formations.find(f => f.name === '기형진') || this.data.formations[0];
    const useFormation = !!this.coeffs.formationEffects;
    const formation = useFormation ? realFormation : { ...realFormation, name: '진형 없음', traits: [], effects: [], hitRate: { front: 1, mid: 1, back: 1 } };
    const manualsUsed: Array<{ unit: any; manual: Manual }> = [];
    const skillStatics: Array<{ unit: any; name: string; st: any }> = [];
    // R-058 같은 인물(SP 등 다른 판)은 한 부대에 함께 출전할 수 없다
    const persons = deck.units.map(u => { const g: any = this.generalById.get(u.generalId); return g ? (g.samePerson || g.id) : u.generalId; });
    const dupP = persons.find((p, i) => persons.indexOf(p) !== i);
    if (dupP) throw new Error(`같은 인물은 한 부대에 함께 출전할 수 없습니다: ${deck.units.filter((u, i) => persons[i] === dupP).map(u => (this.generalById.get(u.generalId) as any)?.name || u.generalId).join(' · ')} (R-058)`);
    const slotPos = this.slotPositions(deck, useFormation ? formation : { hitRate: { front: 0.6, mid: 0.2, back: 0.2 } });
    const units = deck.units.map((u, idx) => {
      const g0 = this.generalById.get(u.generalId);
      // R-015: 병종 전환(덱별 병종 바꾸기)은 병종 효과를 켤 때만
      const g = g0 && u.unitType && this.coeffs.troopEffects ? { ...g0, unitType: u.unitType } : g0;
      if (!g) throw new Error(`무장 없음: ${u.generalId}`);
      const skills = u.skillIds.map(id => this.skillById.get(id)).filter(Boolean);
      let uskill = this.uniqueById.get(g.uniqueSkillId);
      const manual = this.pickManual(g, u.manualId);
      const eng = manual?.engine;
      // 금병법이 고유 전법을 고치면 이 무장에게만 사본을 만들어 적용한다
      if (uskill && eng?.uniquePatch) {
        const run = (uskill as any).run;
        uskill = { ...structuredClone({ ...uskill, run: undefined }), run };   // 함수는 복제하지 않고 그대로 붙인다
        for (const [path, v] of Object.entries(eng.uniquePatch)) if (path !== '_keepTiming') setPath(uskill, path, v);
        if (!eng.uniquePatch._keepTiming) delete uskill._timing;
      }
      // 전법 정의에 딸린 추가 효과(parts) — 한 전법에 계기가 둘 이상일 때 (S2 연전연승 등)
      const skillParts = [uskill, ...skills].filter(Boolean).flatMap((sk: any) => (sk.parts || []).map((part: any, i: number) => ({
        ...structuredClone(part), id: `${sk.id}#${i + 1}`, name: sk.name, type: sk.type === '액티브' || sk.type === '추격' ? '패시브' : sk.type,
        procRate: '100%', raw: sk.raw, isManual: true, isPart: true,
        // FEAT-030 전법 부속 효과도 함수로 실행(전법 파일의 partRuns[i])
        run: this.opts.noSkillFns ? undefined : (SKILL_MODULES as any)[sk.id]?.partRuns?.[i],
      })));
      const manualRuns = !this.opts.noSkillFns && eng?.fn ? MANUAL_MODULES[eng.fn]?.runs : undefined;
      const manualSkills = (eng?.parts || []).map((part, i) => ({
        ...structuredClone(part),
        run: manualRuns?.[i] || undefined,
        id: `${manual!.id}#${i + 1}`,
        name: `금병법〈${manual!.name}〉`,
        type: '패시브',
        procRate: '100%',
        raw: manual!.text,
        isManual: true,
      }));
      const unit = E.buildUnit(g, [...skills, ...skillParts, ...manualSkills], uskill, formation, (u.position === ('mid' as any) ? 'front' : u.position) || slotPos[idx], side, idx);
      for (const sk of [uskill, ...skills].filter(Boolean) as any[]) {
        if (sk.unit?.uniqueProcAddDelta) unit.uniqueProcAdd = (unit.uniqueProcAdd || 0) + sk.unit.uniqueProcAddDelta;
        // 도광양회 "(지력 영향)": 확률은 합연산 — 지력 1당 +0.02%p (툴팁 육손 325.55 → 12.50%, 여몽 323.15 → 12.46%), 전투 시작 스냅샷
        if (sk.unit?.uniqueProcAddPerInt) unit.uniqueProcAdd = (unit.uniqueProcAdd || 0) + sk.unit.uniqueProcAddPerInt * (unit.stats?.지력 || 0);
        if (sk.static) skillStatics.push({ unit, name: sk.name, st: sk.static });
      }
      if (manual && eng) {
        Object.assign(unit, eng.unit || {});
        unit.manual = { id: manual.id, name: manual.name, status: manual.status };
        manualsUsed.push({ unit, manual });
      }
      return unit;
    });
    const prepLog: string[] = [];
    if (useFormation) E.applyFormationEffects(units, prepLog);
    E.applyTeamCompositionBonuses(units, prepLog, { troopEffects: !!this.coeffs.troopEffects });
    E.applyBondBonuses(units, this.data.bonds, prepLog);
    E.applyLoadoutSynergies(units);
    // 전법의 고정 증감 (예: 난공불락 "통솔 15% 상승")
    for (const { unit, name, st } of skillStatics) {
      const parts: string[] = [];
      for (const [k, v] of Object.entries(st.statsPct || {}) as Array<[string, number]>) { const add = unit.stats[k] * v; unit.stats[k] += add; parts.push(`${k} +${add.toFixed(1)}`); }
      for (const [k, v] of Object.entries(st.mods || {}) as Array<[string, number]>) { unit.mods[k] = (unit.mods[k] || 0) + v; parts.push(`${k} ${v > 0 ? '+' : ''}${Math.round(v * 1000) / 10}%`); }
      if (parts.length) prepLog.push(`0턴: [${unit.name}] 【${name}】 상시 효과 — ${parts.join(', ')}`);
    }
    // 금병법 고정 증감 (편성 보너스 다음에 더한다)
    for (const { unit, manual } of manualsUsed) {
      const st = manual.engine?.static;
      const from = (manual.engine?.unit as any)?.statFromStat;
      const parts: string[] = [];
      // st.row: "자신이 전열이면" 처럼 진형 칸에 따라 붙는 증감 (장료〈기전〉)
      const rowOk = !st?.row || (st.row === 'back') === (unit.position === 'back');
      if (!rowOk) parts.push(`${st.row === 'back' ? '후열' : '전열'} 조건 불충족`);
      if (rowOk) for (const [k, v] of Object.entries(st?.mods || {})) { unit.mods[k] = (unit.mods[k] || 0) + v; parts.push(`${k} ${v > 0 ? '+' : ''}${Math.round(v * 1000) / 10}%`); }
      for (const [k, v] of Object.entries(st?.stats || {})) { unit.stats[k] = (unit.stats[k] || 0) + v; parts.push(`${k} ${v > 0 ? '+' : ''}${v}`); }
      if (from) { const add = unit.stats[from.from] * from.ratio; unit.stats[from.stat] += add; parts.push(`${from.stat} +${add.toFixed(1)}`); }
      // 서성〈의성〉: 아군 전원에게 "홍수 상태 적의 피해 감소" 표식
      const ward = (manual.engine?.unit as any)?.floodWard;
      if (ward) for (const a of units.filter((x: any) => x.side === unit.side)) a._floodWard = { by: unit, value: ward };
      // 아군 병종별 최고 속성 증가 (마운록〈풍속통의〉 "아군 기병의 최고 속성 5%")
      const boost = (manual.engine?.unit as any)?.allyTypeHighestPct;
      if (boost) for (const a of units.filter((x: any) => x.side === unit.side && x.unitType === boost.unitType)) {
        const k = (['무력', '지력', '통솔', '선공'] as const).reduce((m, x) => (a.stats[x] > a.stats[m] ? x : m), '무력' as string);
        const add = a.stats[k] * boost.pct; a.stats[k] += add; parts.push(`${a.name} ${k} +${add.toFixed(1)}`);
      }
      prepLog.push(`0턴: [${unit.name}] 금병법〈${manual.name}〉 장착${manual.status === 'approx' ? ' (근사)' : ''}${parts.length ? ' — ' + parts.join(', ') : ''}`);
    }
    units.forEach((u: any) => { u.prepLog = prepLog; });
    return units;
  }

  /** 한 판. trace=true 면 감사용 구조화 기록을 함께 돌려준다 */
  simulate(a: DeckSpec, b: DeckSpec, opt: { seed?: string | number; trace?: boolean; detail?: boolean } = {}): BattleResult {
    const seed = opt.seed ?? `${Date.now()}-${Math.random()}`;
    this.engine.setRng(createRng(seed));
    const trace: TraceEvent[] = [];
    this.engine.setTrace(opt.trace ? (ev: TraceEvent) => trace.push(ev) : null);
    this.engine.setDetail(!!opt.detail);
    try {
      const res = this.engine.simulateBattle(this.buildArmy(a, 'A'), this.buildArmy(b, 'B'), this.coeffs, this.rebuild(a, b));
      return {
        winner: res.winner, turns: res.turns, rounds: res.rounds, log: res.log, troopHistory: res.troopHistory,
        trace: opt.trace ? trace : undefined,
        lineSnaps: opt.detail ? res.lineSnaps : undefined,
        approx: opt.detail ? { A: this.approxIn(a), B: this.approxIn(b) } : undefined,
        units: res.units.map((u: any) => ({ id: u.id, side: u.side, name: u.name, generalId: u.generalId, troops: u.troops, maxTroops: u.maxTroops, dmgDealt: u.dmgDealt, healDone: u.healDone })),
      };
    } finally {
      this.engine.setTrace(null);
      this.engine.setDetail(false);
    }
  }

  /** 재교전(R-009): 생존 무장만으로 부대를 다시 만든다 — 진형·진영·인연·금병법은 남은 무장 기준으로 다시 적용 */
  private rebuild(a: DeckSpec, b: DeckSpec) {
    const only = (d: DeckSpec, ids: string[]): DeckSpec => ({ ...d, units: d.units.filter(u => ids.includes(u.generalId)) });
    return (aIds: string[], bIds: string[]) => [this.buildArmy(only(a, aIds), 'A'), this.buildArmy(only(b, bIds), 'B')];
  }

  /** 몬테카를로. 시드가 같으면 결과도 같다 */
  monteCarlo(a: DeckSpec, b: DeckSpec, opt: { runs?: number; seed?: string | number } = {}): MonteCarloResult {
    const runs = opt.runs ?? 500;
    const seed = String(opt.seed ?? Date.now());
    this.engine.setRng(createRng(seed));
    this.engine.setTrace(null);
    const mc = this.engine.runMonteCarlo(() => [this.buildArmy(a, 'A'), this.buildArmy(b, 'B')], this.coeffs, runs, this.rebuild(a, b));
    return {
      runs: mc.runs, winA: mc.winA, winB: mc.winB, draw: mc.draw,
      winRateA: mc.winRateA, winRateB: mc.winRateB, avgTurns: mc.avgTurns, avgRounds: mc.avgRounds,
      contribution: mc.contribution, contributionB: mc.contributionB,
      troopCurveAll: mc.troopCurveAll, seed,
      approx: { A: this.approxIn(a), B: this.approxIn(b) },
    };
  }

  /**
   * 진형 칸에 따른 전열·후열 (FEAT-006, 전보 2026-10-03 확인).
   * 기형진: 첫 칸만 전열(주태 받는 피해 −6%), 나머지는 후열(조운·악진 주는 피해 +12%).
   * 일자진: 셋 다 전열(대교·손책·견희 모두 받는 피해 −8%).
   * 안형진·방원진(전열·중군 피격률이 같음)은 두 칸이 전열로 가정 — 검증 대기.
   * 전열 칸에는 배치 성향이 전열인 무장이 먼저 들어가고, 같으면 덱 순서를 따른다.
   */
  slotPositions(deck: DeckSpec, formation: { hitRate?: Record<string, number> }): Position[] {
    const hr = formation?.hitRate || { front: 0.6, mid: 0.2, back: 0.2 };
    // R-048 열은 전열·후열 둘. 엑셀 피격률의 가운데 칸은 전열 값과 같으면 전열, 아니면 후열 (안형진 40/40/20 → 전열 2, 기형진 60/20/20 → 전열 1)
    const slots: Position[] = ['front',
      hr.mid >= hr.front - 1e-9 ? 'front' : 'back',
      hr.back >= hr.front - 1e-9 ? 'front' : 'back'];
    const pref = (row: string) => (row === '전열' ? 0 : row === '후열' ? 2 : 1);
    const order = deck.units.map((u, i) => ({ i, p: pref(String(this.generalById.get(u.generalId)?.position ?? '')) }))
      .sort((a, b) => a.p - b.p || a.i - b.i);
    const out: Position[] = [];
    order.forEach((o, k) => { out[o.i] = slots[Math.min(k, 2)]; });
    return out;
  }

  /** 덱에 지정한 금병법 → 없으면 시뮬 가능한 첫 금병법. 미지원·정의 없음은 장착하지 않는다 */
  pickManual(g: { manuals?: Manual[] }, manualId?: string): Manual | null {
    const ms = g.manuals || [];
    if (manualId === 'none') return null;
    const usable = (m?: Manual) => !!m && (m.status === 'ok' || m.status === 'approx');
    const chosen = manualId ? ms.find(m => m.id === manualId) : ms.find(usable);
    return usable(chosen) ? chosen! : null;
  }

  /** 이 덱에 들어간 근사 효과 (전보 녹화 검증 대기, R-007) */
  approxIn(deck: DeckSpec): ApproxEffect[] {
    const out: ApproxEffect[] = [];
    for (const u of deck.units) {
      const g = this.bundle.generals.find(x => x.id === u.generalId);
      if (!g) continue;
      // 공개 자료가 없어 임시값을 쓴 무장 정보 (능력치·병종·배치)
      const gs = g.dataStatus || {};
      const tmp = Object.entries(gs).filter(([k, v]) => k !== 'faction' && !(k === 'unitType' && (u.unitType || !/미확인/.test(v))) && /임시|미확인/.test(v));
      if (tmp.length) out.push({ owner: g.name.ko, name: '무장 정보', kind: '임시 자료', note: tmp.map(([k, v]) => `${({ stats: '능력치', unitType: '병종', row: '배치' } as any)[k] || k} ${v}`).join(', ') });
      if (gs.stats && /환산/.test(gs.stats) && !tmp.some(([k]) => k === 'stats')) out.push({ owner: g.name.ko, name: '능력치', kind: '환산 자료', note: gs.stats });
      if ((g as any).krRelease) out.push({ owner: g.name.ko, name: '무장', kind: '한국 미출시', note: '해외 자료로 시뮬 (R-061)' });
      for (const sid of [g.uniqueSkillId, ...u.skillIds]) {
        const sk = this.bundle.skills.find(x => x.id === sid);
        if (!sk) continue;
        if ((sk as any).krRelease) out.push({ owner: g.name.ko, name: sk.name.ko, kind: '한국 미출시', note: '해외 자료로 시뮬 (R-061)' });
        if (sk.dataStatus?.procRate) out.push({ owner: g.name.ko, name: sk.name.ko, kind: '임시 자료', note: `발동률 ${sk.dataStatus.procRate}` });
        const eng = sk.engine as any;
        const approxClauses = sk.clauses.filter(c => c.status === 'approx' || c.status === 'missing');
        if (!eng) out.push({ owner: g.name.ko, name: sk.name.ko, kind: '미구현', note: '엔진 정의 없음 — 효과 없이 시뮬' });
        else if (eng.authoredStatus === 'approx') out.push({ owner: g.name.ko, name: sk.name.ko, kind: '근사', note: eng.authoredNote || '' });
        else if (approxClauses.length) out.push({ owner: g.name.ko, name: sk.name.ko, kind: approxClauses.some(c => c.status === 'missing') ? '일부 미반영' : '근사', note: approxClauses.map(c => c.text).slice(0, 2).join(' / ') });
      }
      const m = this.pickManual(g, u.manualId);
      if (m?.status === 'approx') out.push({ owner: g.name.ko, name: `금병법〈${m.name}〉`, kind: '근사', note: m.note || '' });
    }
    return out;
  }

  /** 티어덱 → DeckSpec */
  tierDeckSpec(tierDeckId: string, formation?: string): DeckSpec {
    const td = this.bundle.tierDecks.find(t => t.id === tierDeckId);
    if (!td) throw new Error(`티어덱 없음: ${tierDeckId}`);
    return {
      name: `${td.tier} ${td.name}`,
      formation: formation || td.formation || '기형진',
      units: td.units.map(u => ({ generalId: u.generalId, skillIds: u.skillIds.filter(id => !id.startsWith('?')), manualId: u.manualId, ...(u.unitType ? { unitType: u.unitType } : {}) })),
    };
  }
}
