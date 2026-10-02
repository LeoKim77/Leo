// 보유 무장·전법으로 1~5덱 추천
//   - 기준: 시즌 전쟁 티어덱 (티어 가중치 × 보유 충족도)
//   - 없는 카드는 비슷한 보유 카드로 대체 (무장: 병종·위치·성향·진영·스탯 / 전법: 유형·특성·deck-lab 대체 평가)
//   - 제약 R-006: 전법은 전체 부대를 통틀어 1번만, 무장도 한 부대에만
//   - 빔 서치로 덱 묶음 전체 점수를 최대화한 뒤, 메타 덱 상대 시뮬로 검증
import { Simulator, type GameBundle, type DeckSpec, type General, type Skill } from '@cheonha/engine';

export interface AltRating { requiredTacticId: string; alternativeTacticId: string; rating: string; note?: string }

export interface RecommendInput {
  owned: { generals: string[]; skills: string[] };
  count: number;
  /** 무장 대체 허용 (기본 true). false 면 무장은 보유 원본만 */
  allowGeneralSub?: boolean;
  /** deck-lab 대체 전법 평가 (참고 근거) */
  alternatives?: AltRating[];
  /** 시뮬 검증: 메타 상대 수, 상대당 판 수 (0 이면 생략), 검증할 후보 조합 수 */
  validate?: { opponents: number; runs: number; seed?: string; candidates?: number };
  onProgress?: (done: number, total: number) => void;
}

export interface Substitution { slot: string; from: string; to: string; score: number; reason: string }
export interface UnitPlan { generalId: string; originalGeneralId: string; skillIds: string[]; originalSkillIds: string[]; manualId?: string; subs: Substitution[]; missing: string[] }
export interface DeckPlan {
  tierDeckId: string; tier: string; name: string; season: string;
  units: UnitPlan[];
  fidelity: number;
  score: number;
  validation?: { opponents: Array<{ id: string; name: string; winRate: number }>; avgWinRate: number; runs: number };
}
export interface RecommendResult { decks: DeckPlan[]; unusedNotes: string[]; tierDeckCount: number }

const planKey = (p: DeckPlan) => `${p.tierDeckId}:${p.units.map(u => `${u.generalId}/${u.skillIds.join('+')}/${u.manualId}`).join(',')}`;
const TIER_W: Record<string, number> = { 'T0+': 1.0, T0: 0.92, 'T1+': 0.84, T1: 0.76, 'T1-': 0.68 };
const tierWeight = (t: string) => TIER_W[t] ?? 0.6;
const ALT_W: Record<string, number> = { 최상: 0.3, 양호: 0.2, 조건부: 0.1, 비추천: -0.35 };

function generalSim(a: General, b: General): { score: number; reason: string } {
  const parts: string[] = [];
  let s = 0;
  if (a.unitType === b.unitType) { s += 0.3; parts.push('병종'); }
  if (a.row === b.row) { s += 0.2; parts.push('위치'); }
  if (a.role && a.role === b.role) { s += 0.25; parts.push('성향'); }
  if (a.faction === b.faction) { s += 0.1; parts.push('진영'); }
  const keys = ['무력', '지력', '통솔', '선공'] as const;
  const va = keys.map(k => a.stats[k] || 0), vb = keys.map(k => b.stats[k] || 0);
  const dot = va.reduce((x, v, i) => x + v * vb[i], 0), na = Math.hypot(...va), nb = Math.hypot(...vb);
  const cos = na && nb ? dot / (na * nb) : 0;
  s += 0.15 * Math.max(0, (cos - 0.85) / 0.15);
  return { score: Math.min(1, s), reason: parts.length ? `같은 ${parts.join('·')}` : '스탯 유사' };
}

export class Recommender {
  private gById: Map<string, General>;
  private sById: Map<string, Skill>;
  private alt = new Map<string, AltRating>();

  constructor(readonly bundle: GameBundle) {
    this.gById = new Map(bundle.generals.map(g => [g.id, g]));
    this.sById = new Map(bundle.skills.map(s => [s.id, s]));
  }

  private skillSim(from: Skill, to: Skill): { score: number; reason: string } {
    const parts: string[] = [];
    let s = 0;
    if (from.kind === to.kind) { s += 0.4; parts.push(`같은 ${to.kind}`); }
    if (from.trait && from.trait === to.trait) { s += 0.3; parts.push(`${to.trait}`); }
    if (from.grade === to.grade) s += 0.05;
    const eng = to.engine as any;
    if (!eng) s -= 0.5;
    else if (eng.authoredStatus !== 'approx') s += 0.05;
    const a = this.alt.get(`${from.id}>${to.id}`);
    if (a && ALT_W[a.rating] != null) { s += ALT_W[a.rating]; parts.push(`해외 대체 평가 '${a.rating}'`); }
    return { score: Math.max(0, Math.min(1, s)), reason: parts.join(' · ') || '유형 다름' };
  }

  /** 티어덱 하나를 남은 보유 카드로 채운다. 불가능하면 null */
  private fill(td: GameBundle['tierDecks'][number], ownG: Set<string>, ownS: Set<string>, usedG: Set<string>, usedS: Set<string>, allowGSub: boolean) {
    const takenG = new Set(usedG), takenS = new Set(usedS);
    const units: UnitPlan[] = [];
    let total = 0;
    for (const u of td.units) {
      const orig = this.gById.get(u.generalId);
      if (!orig) return null;
      const subs: Substitution[] = [];
      let gid = u.generalId, gScore = 1;
      if (!ownG.has(gid) || takenG.has(gid)) {
        if (!allowGSub) return null;
        let best: { id: string; score: number; reason: string } | null = null;
        for (const id of ownG) {
          if (takenG.has(id)) continue;
          const c = this.gById.get(id);
          if (!c) continue;
          const sim = generalSim(orig, c);
          if (!best || sim.score > best.score) best = { id, ...sim };
        }
        if (!best || best.score < 0.35) return null;
        gid = best.id; gScore = 0.55 * best.score;
        subs.push({ slot: '무장', from: orig.name.ko, to: this.gById.get(gid)!.name.ko, score: best.score, reason: `${best.reason} (고유 전법이 바뀜)` });
      }
      takenG.add(gid);
      const skillIds: string[] = [];
      const missing: string[] = [];
      let sScore = 0;
      for (const sid of u.skillIds) {
        const sk = this.sById.get(sid);
        if (!sk) continue;
        if (ownS.has(sid) && !takenS.has(sid)) { skillIds.push(sid); takenS.add(sid); sScore += 1; continue; }
        let best: { id: string; score: number; reason: string } | null = null;
        for (const id of ownS) {
          if (takenS.has(id) || u.skillIds.includes(id)) continue;
          const c = this.sById.get(id);
          if (!c || c.isUnique) continue;
          const sim = this.skillSim(sk, c);
          if (!best || sim.score > best.score) best = { id, ...sim };
        }
        if (best && best.score >= 0.3) {
          skillIds.push(best.id); takenS.add(best.id); sScore += 0.8 * best.score;
          subs.push({ slot: '전법', from: sk.name.ko, to: this.sById.get(best.id)!.name.ko, score: best.score, reason: best.reason });
        } else missing.push(sk.name.ko);
      }
      // 금병법: 원래 무장이면 티어덱 지정, 대체 무장이면 시뮬 가능한 첫 금병법 (R-005: 1개)
      const g = this.gById.get(gid)!;
      const usable = (m: any) => m.status === 'ok' || m.status === 'approx';
      const named = gid === u.generalId && u.manualId ? g.manuals.find(m => m.id === u.manualId) : undefined;
      const manualId = (named && usable(named) ? named : g.manuals.find(usable))?.id;
      units.push({ generalId: gid, originalGeneralId: u.generalId, skillIds, originalSkillIds: u.skillIds, manualId, subs, missing });
      total += (2 * gScore + sScore) / (2 + Math.max(1, u.skillIds.length));
    }
    const fidelity = total / td.units.length;
    return { units, fidelity, takenG, takenS };
  }

  recommend(input: RecommendInput): RecommendResult {
    this.alt = new Map((input.alternatives || []).map(a => [`${a.requiredTacticId}>${a.alternativeTacticId}`, a]));
    const ownG = new Set(input.owned.generals), ownS = new Set(input.owned.skills);
    const count = Math.max(1, Math.min(5, input.count));
    const allowGSub = input.allowGeneralSub !== false;
    const decks = this.bundle.tierDecks;
    type State = { plans: DeckPlan[]; usedG: Set<string>; usedS: Set<string>; total: number };
    let beam: State[] = [{ plans: [], usedG: new Set(), usedS: new Set(), total: 0 }];
    const BEAM = 40;
    for (let step = 0; step < count; step++) {
      const next: State[] = [];
      const seen = new Set<string>();
      for (const st of beam) {
        for (const td of decks) {
          if (st.plans.some(p => p.tierDeckId === td.id)) continue;
          const f = this.fill(td, ownG, ownS, st.usedG, st.usedS, allowGSub);
          if (!f || f.fidelity < 0.35) continue;
          const plan: DeckPlan = { tierDeckId: td.id, tier: td.tier, name: td.name, season: td.season, units: f.units, fidelity: f.fidelity, score: tierWeight(td.tier) * f.fidelity };
          const plans = [...st.plans, plan];
          const key = plans.map(p => p.tierDeckId).sort().join('|');
          if (seen.has(key)) continue;
          seen.add(key);
          next.push({ plans, usedG: f.takenG, usedS: f.takenS, total: st.total + plan.score });
        }
      }
      if (!next.length) break;
      next.sort((a, b) => b.total - a.total);
      beam = next.slice(0, BEAM);
    }
    let best = beam[0];
    if (input.validate && input.validate.runs > 0) {
      // 상위 후보 조합들을 메타 상대로 시뮬해 "티어 충족도 × 실제 승률" 합으로 다시 고른다
      const cands = beam.slice(0, input.validate.candidates ?? 6);
      const unique = new Map<string, DeckPlan>();
      cands.forEach(st => st.plans.forEach(p => unique.set(planKey(p), p)));
      this.validate([...unique.values()], input.validate, input.onProgress);
      const combined = (st: State) => st.plans.reduce((a, p) => a + 0.5 * p.score + 0.5 * (unique.get(planKey(p))!.validation!.avgWinRate), 0);
      best = cands.reduce((x, y) => (combined(y) > combined(x) ? y : x));
      best.plans.forEach(p => { p.validation = unique.get(planKey(p))!.validation; });
    }
    const rank = (p: DeckPlan) => (p.validation ? 0.5 * p.score + 0.5 * p.validation.avgWinRate : p.score);
    const result: RecommendResult = { decks: [...best.plans].sort((a, b) => rank(b) - rank(a)), unusedNotes: [], tierDeckCount: decks.length };
    if (best.plans.length < count) result.unusedNotes.push(`보유 카드로 만들 수 있는 덱이 ${best.plans.length}개뿐입니다. 무장·전법을 더 체크하거나 대체 허용을 켜 보세요.`);
    return result;
  }

  static toSpec(p: DeckPlan, formation = '기형진'): DeckSpec {
    return { name: `추천 · ${p.tier} ${p.name}`, formation, units: p.units.map(u => ({ generalId: u.generalId, skillIds: u.skillIds, manualId: u.manualId })) };
  }

  /** 메타(상위 티어덱) 상대 승률로 검증 */
  private validate(plans: DeckPlan[], v: NonNullable<RecommendInput['validate']>, onProgress?: (d: number, t: number) => void) {
    const sim = new Simulator(this.bundle);
    const meta = [...this.bundle.tierDecks].sort((a, b) => tierWeight(b.tier) - tierWeight(a.tier)).slice(0, v.opponents);
    const total = plans.length * meta.length;
    let done = 0;
    for (const p of plans) {
      const spec = Recommender.toSpec(p);
      const opps = meta.map(o => {
        const mc = sim.monteCarlo(spec, sim.tierDeckSpec(o.id), { runs: v.runs, seed: `${v.seed ?? 'rec'}:${p.tierDeckId}:${o.id}` });
        onProgress?.(++done, total);
        return { id: o.id, name: `${o.tier} ${o.name}`, winRate: mc.winRateA };
      });
      p.validation = { opponents: opps, avgWinRate: opps.reduce((a, o) => a + o.winRate, 0) / opps.length, runs: v.runs };
    }
  }
}
