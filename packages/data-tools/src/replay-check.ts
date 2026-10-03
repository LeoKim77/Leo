// 전보 역재현 검증: 녹화 영상의 툴팁 스탯을 그대로 무장에 세팅하고,
// 전보에 찍힌 피해·회복 한 건 한 건을 엔진 공식으로 다시 계산해 실측과 비교한다.
// 한 턴을 통째로 다시 돌리면 발동 확률·대상 선택·피신이 매번 달라 비교가 흐려지므로,
// "누가 누구에게 어떤 계수로" 는 전보 그대로 고정하고 숫자만 엔진에 맡긴다.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { buildBundle } from './bundle.ts';
import { DATA, readJson } from './paths.ts';
import { Simulator } from '../../engine/src/index.ts';

type Mods = Record<string, number>;
interface Tooltip { turn: number; unit: string; stats?: Record<string, number>; troops?: number; maxTroops?: number; mods?: Mods }
interface DamageSample { turn: number; attacker: string; defender: string; kind: string; dmgType: '병기' | '책략'; ratio: number; observed: number; crit?: boolean; tag?: string; note?: string }
/** "(스탯)의 영향 받음" 표본: 원문 기본값과 전보에 실제로 찍힌 값, 그 순간 시전자(또는 목표)의 해당 스탯 */
interface InfluenceSample { turn: number; skill: string; caster: string; base: number; observed: number; stat: string; statValue: number; note?: string }
interface HealSample { turn: number; healer: string; target?: string; skill: string; ratio: number; observed: number; healStat?: string; healerStats?: Record<string, number> }
export interface Replay {
  id: string; date: string; season: string;
  battle: { ally: { formation: string; units: Array<{ generalId: string; skills?: string[] }> }; enemy: { formation: string; units: string[] } };
  tooltips: Tooltip[]; damageSamples?: DamageSample[]; healSamples?: HealSample[]; influenceSamples?: InfluenceSample[];
}
export interface CheckRow { kind: 'damage' | 'heal' | 'influence'; turn: number; label: string; observed: number; predicted: number; errPct: number; snapshot: string }

/** 피해 계산에 쓰이는 증감 항목 — 툴팁에 없으면 0 으로 본다 */
const DMG_MODS = ['주는피해', '받는피해', '주는병기피해', '받는병기피해', '주는책략피해', '받는책략피해', '주는일반공격피해', '받는일반공격피해',
  '주는액티브피해', '받는액티브피해', '추격전법피해', '받는추격피해', '방어관통', '간파', '회심', '묘책', '피신', '받는회복량', '주는회복량', '병력우위대상피해'];

export function loadReplays(): Replay[] {
  const dir = join(DATA, 'replays');
  return readdirSync(dir).filter(f => f.endsWith('.json')).map(f => readJson<Replay>(join(dir, f)));
}

export function checkReplay(r: Replay, coeffs: Record<string, unknown> = {}, sim = new Simulator(buildBundle(), { coeffs: { ...coeffs, damageVariance: 0 } })): CheckRow[] {
  const E: any = (sim as any).engine;
  E.setRng(() => 0.999);   // 피신·회심·2배 회복 판정이 일어나지 않게
  const a = sim.buildArmy({ formation: r.battle.ally.formation, units: r.battle.ally.units.map(u => ({ generalId: u.generalId, skillIds: [] })) } as any, 'A');
  const b = sim.buildArmy({ formation: r.battle.enemy.formation, units: r.battle.enemy.units.map(id => ({ generalId: id, skillIds: [] })) } as any, 'B');
  const all: any[] = [...a, ...b];
  const byGeneral = (gid: string) => {
    const u = all.find(x => x.generalId === gid);
    if (!u) throw new Error(`${r.id}: 전투에 없는 무장 ${gid}`);
    return u;
  };
  // 그 턴(없으면 가장 가까운 턴)의 툴팁을 무장에 덮어쓴다
  const apply = (gid: string, turn: number) => {
    const u = byGeneral(gid);
    const tips = r.tooltips.filter(t => t.unit === gid).sort((x, y) => Math.abs(x.turn - turn) - Math.abs(y.turn - turn) || x.turn - y.turn);
    const tip = tips[0];
    u.statuses = []; u.statBuffs = [];
    for (const k of DMG_MODS) u.mods[k] = 0;
    if (tip) {
      Object.assign(u.stats, tip.stats || {});
      Object.assign(u.mods, tip.mods || {});
      if (tip.troops != null) u.troops = tip.troops;
      if (tip.maxTroops != null) u.maxTroops = tip.maxTroops;
    }
    u.mods.피신 = 0; u.mods.회심 = 0; u.mods.묘책 = 0; u.alive = true;
    return { u, snap: tip ? `${tip.turn}턴 툴팁${tip.turn !== turn ? '(다른 턴)' : ''}${tip.stats ? '' : ' 스탯 없음'}` : '툴팁 없음' };
  };
  const rows: CheckRow[] = [];
  const crit = Number((sim as any).coeffs.critMult ?? 1.5);
  for (const s of r.damageSamples || []) {
    const A = apply(s.attacker, s.turn), D = apply(s.defender, s.turn);
    const tag = s.tag || (s.kind === '일반 공격' ? 'basic' : 'active');
    const { dmg } = E.calcDamage(A.u, D.u, s.ratio, s.dmgType, (sim as any).coeffs, null, s.turn, tag);
    const predicted = Math.round(dmg * (s.crit ? crit : 1));
    rows.push({ kind: 'damage', turn: s.turn, label: `${A.u.name}→${D.u.name} ${s.kind} ${Math.round(s.ratio * 100)}% ${s.dmgType}`, observed: s.observed, predicted, errPct: (predicted - s.observed) / s.observed, snapshot: `${A.snap} / ${D.snap}` });
  }
  for (const s of r.healSamples || []) {
    const H = apply(s.healer, s.turn);
    if (s.healerStats) Object.assign(H.u.stats, s.healerStats);
    const T = s.target ? apply(s.target, s.turn).u : H.u;
    T.troops = 1; T.wounded = T.maxTroops;   // 회복 상한에 걸리지 않게
    const { heal } = E.calcHeal(H.u, T, s.ratio, (sim as any).coeffs, s.healStat);
    rows.push({ kind: 'heal', turn: s.turn, label: `${H.u.name} ${s.skill} 치유율 ${Math.round(s.ratio * 100)}%${s.healStat ? ` (${s.healStat} 기준)` : ''}`, observed: s.observed, predicted: heal, errPct: (heal - s.observed) / s.observed, snapshot: s.healerStats ? '표본에 적힌 시전자 스탯' : H.snap });
  }
  // 스탯 영향: 기본값 × (1 + (스탯 − 100) × statScaleWeight) — v1.12b 잠정식(W08)
  const w = Number((sim as any).coeffs.statScaleWeight);
  for (const s of r.influenceSamples || []) {
    const predicted = s.base * Math.max(0, 1 + (s.statValue - 100) * w);
    rows.push({ kind: 'influence', turn: s.turn, label: `${s.caster} ${s.skill} 기본 ${s.base} (${s.stat} ${s.statValue})`, observed: s.observed, predicted: Math.round(predicted * 100) / 100, errPct: (predicted - s.observed) / s.observed, snapshot: '전보 표기값' });
  }
  return rows;
}

/** 계수 하나를 범위 안에서 훑어 표본 오차(로그 제곱합)가 가장 작은 값을 찾는다 */
export function fitCoeff(replays: Replay[], key: string, values: number[], filter: (r: CheckRow) => boolean) {
  const bundle = buildBundle();
  return values.map(v => {
    const sim = new Simulator(bundle, { coeffs: { [key]: v, damageVariance: 0 } });
    const rows = replays.flatMap(r => checkReplay(r, { [key]: v }, sim)).filter(filter);
    const loss = rows.reduce((acc, x) => acc + Math.log(x.predicted / x.observed) ** 2, 0) / Math.max(1, rows.length);
    return { value: v, rmsPct: Math.sqrt(loss) * 100, n: rows.length };
  }).sort((x, y) => x.rmsPct - y.rmsPct);
}

if (process.argv[1]?.endsWith('replay-check.ts')) {
  const replays = loadReplays();
  for (const r of replays) {
    console.log(`\n■ ${r.id}`);
    for (const x of checkReplay(r)) console.log(`  ${x.kind === 'damage' ? '피해' : x.kind === 'heal' ? '회복' : '스탯 영향'} ${x.turn}턴 ${x.label}: 실측 ${x.observed} / 엔진 ${x.predicted} (${x.errPct >= 0 ? '+' : ''}${(x.errPct * 100).toFixed(1)}%) — ${x.snapshot}`);
  }
}
