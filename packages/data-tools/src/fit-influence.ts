// 스탯 영향 전법별 가중치 (FEAT-034) — pnpm fit:influence → data/engine/influence-fit.json
//   사용자 지정 2026-10-14: 인게임 수치를 최우선으로. 공용 J10 가중치(기본값 × (1 + (스탯 − 100) × w))로
//   표본 오차가 10% 이내면 공용 값을 쓰고, 넘으면 그 전법(+기본값)에만 실측 가중치를 준다.
//   표본끼리 어긋나거나 가중치가 음수·비정상이면 가중치를 정하지 않고 세부 검증 요청(실행·발동 구간)으로 돌린다.
import { writeFileSync } from 'node:fs';
import { buildBundle } from './bundle.ts';
import { loadReplays } from './replay-check.ts';
import { engineWeight, FIT_FILE, matchSkill, weightKey, type InfluenceFit } from './influence.ts';
import { Simulator } from '../../engine/src/index.ts';
import { SKILL_MODULES } from '../../engine/src/skills/index.ts';

const TOL = 0.10, SPREAD = 0.35, W_MAX = 0.02;

export function fitInfluence(): InfluenceFit {
  const b: any = buildBundle();
  b.influenceWeights = {};   // 지난 맞춤 결과를 빼고 판단(엔진이 효과 항목에 가중치를 써 넣으므로 시뮬레이터를 만들기 전에)
  const gw = Number((new Simulator(b) as any).coeffs.statScaleWeight);
  // 손으로 맞춘 전법별 가중치(FEAT-031: statScale.weight)가 이미 있는 전법은 건드리지 않는다
  // 전법 함수가 원문 영향을 전용 공식으로 이미 맞춘 것(revised 에 'OO 영향 반영')도 제외 — 예: 도광양회 발동률 = 6% + 지력×0.02%p
  const ownFormula = (id: string) => ((SKILL_MODULES as any)[id]?.revised || []).some((r: any) => /(지력|통솔|무력|선공) 영향 반영/.test(r.note || ''));
  // 엔진이 실제로 읽는 전법 정의(전법 파일 def 포함)에서, 그 기본값 효과에 녹화로 맞춘 가중치가 이미 있는지
  const E: any = new Simulator({ ...b, influenceWeights: {} });   // 지난 맞춤 결과는 빼고 판단
  const legacy = new Map<string, any>([...E.data.skills, ...E.data.uniqueSkills].map((s: any) => [s.id, s]));
  const handFitKey = (id: string, base: number) => {
    if (ownFormula(id)) return true;
    const sk = legacy.get(id); if (!sk) return false;
    const items = ['damage', 'buffs', 'statMods'].flatMap(k => sk.effects?.[k] || []).concat(sk.alwaysOnBuffs || []);
    return items.some((it: any) => (it?.inf?.weight != null || it?.statScale?.weight != null) && (Math.abs(Math.abs(it.max ?? it.min ?? 0) * 100 - base) < 0.6 || it.statScale));
  };
  const groups = new Map<string, { skill: any; base: number; rows: Array<{ label: string; stat: number; obs: number }> }>();
  const skipped: InfluenceFit['skipped'] = [];
  const handOff: Array<{ key: string; skill: string; base: number; label: string; e: number }> = [];
  for (const r of loadReplays() as any[]) for (const s of r.influenceSamples || []) {
    const label = `${r.id} ${s.caster} ${s.skill} (${s.stat} ${s.statValue})`;
    const sk = matchSkill(s.skill, b.skills);
    if (!sk) { skipped.push({ sample: label, why: '전법을 찾지 못함(금병법 표본 등)' }); continue; }
    if (handFitKey(sk.id, s.base)) {
      // 이미 맞춘 전법도 표본이 15% 넘게 어긋나면 세부 검증 요청(실행·발동 구간)으로
      const { w } = engineWeight(legacy.get(sk.id) ? { ...sk, engine: { effects: legacy.get(sk.id).effects, alwaysOnBuffs: legacy.get(sk.id).alwaysOnBuffs } } : sk, s.base, null, gw);
      const e = s.base * Math.max(0, 1 + (s.statValue - 100) * w) / s.observed - 1;
      if (!ownFormula(sk.id) && Math.abs(e) > 0.15) handOff.push({ key: weightKey(sk.id, s.base), skill: sk.name.ko, base: s.base, label, e });
      skipped.push({ sample: label, why: '전법 파일에 이미 녹화로 맞춘 가중치·전용 공식이 있음(FEAT-031)' }); continue;
    }
    const key = weightKey(sk.id, s.base);
    if (!groups.has(key)) groups.set(key, { skill: sk, base: s.base, rows: [] });
    groups.get(key)!.rows.push({ label, stat: s.statValue, obs: s.observed });
  }
  const weights: InfluenceFit['weights'] = {}, requests: InfluenceFit['requests'] = [];
  for (const [key, g] of groups) {
    const pred = (w: number, x: { stat: number }) => g.base * Math.max(0, 1 + (x.stat - 100) * w);
    const err = (w: number) => g.rows.reduce((a, x) => a + Math.abs(pred(w, x) / x.obs - 1), 0) / g.rows.length;
    const errGlobal = err(gw);
    if (errGlobal <= TOL) continue;   // 공용 값으로 충분
    const ws = g.rows.map(x => (x.obs / g.base - 1) / (x.stat - 100));
    const mean = ws.reduce((a, v) => a + v, 0) / ws.length;
    const spread = ws.length > 1 ? (Math.max(...ws) - Math.min(...ws)) / Math.abs(mean || 1e-9) : 0;
    const name = g.skill.name.ko;
    if (ws.some(w => w <= 0 || w > W_MAX) || spread > SPREAD) {
      requests.push({ key, skill: name, why: `표본 ${g.rows.length}건이 서로 맞지 않음(실측 가중치 ${ws.map(w => (w * 100).toFixed(3) + '%').join(' / ')})`,
        ask: `「${name}」 기본 ${g.base} 효과가 걸리는 시점(턴 시작·행동·턴 종료)과 그 순간 시전자 스탯 툴팁, 효과가 바뀌는 구간(갱신·중첩·승품)을 발동할 때마다 연속으로` });
      continue;
    }
    // 여러 표본: 오차 제곱합 최소(격자 탐색), 한 표본: 실측 그대로
    let w = mean;
    if (g.rows.length > 1) { let best = Infinity; for (let v = mean * 0.6; v <= mean * 1.4; v += mean / 400) { const e = g.rows.reduce((a, x) => a + Math.log(pred(v, x) / x.obs) ** 2, 0); if (e < best) { best = e; w = v; } } }
    weights[key] = { weight: Math.round(w * 1e6) / 1e6, n: g.rows.length, errGlobal: Math.round(errGlobal * 1000) / 10, errFit: Math.round(err(w) * 1000) / 10, samples: g.rows.map(x => x.label) };
  }
  for (const key of new Set(handOff.map(x => x.key))) {
    const xs = handOff.filter(x => x.key === key);
    requests.push({ key, skill: xs[0].skill, why: `녹화로 맞춘 가중치와 다른 표본 ${xs.length}건(${xs.map(x => `${x.label.split(' ')[0]} ${(x.e * 100).toFixed(0)}%`).join(', ')})`,
      ask: `「${xs[0].skill}」 기본 ${xs[0].base} 효과가 걸리는 시점(턴 시작·행동·턴 종료)과 그 순간 시전자 스탯 툴팁, 효과가 바뀌는 구간(갱신·중첩·승품)을 발동할 때마다 연속으로` });
  }
  return { generatedAt: new Date().toISOString().slice(0, 10), globalWeight: gw, weights, requests, skipped };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const f = fitInfluence();
  writeFileSync(FIT_FILE, JSON.stringify(f, null, 2) + '\n');
  console.log(`스탯 영향 전법별 가중치 ${Object.keys(f.weights).length}개 · 세부 검증 요청 ${f.requests.length}개 · 제외 ${f.skipped.length}건`);
  for (const [k, v] of Object.entries(f.weights)) console.log(`  ${k} w=${(v.weight * 100).toFixed(3)}% (공용 오차 ${v.errGlobal}% → ${v.errFit}%, 표본 ${v.n})`);
  for (const r of f.requests) console.log(`  요청 ${r.key}: ${r.why}`);
}
