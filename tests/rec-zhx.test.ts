// 녹화 2026-10-08 주태·하후돈·황개 vs 여몽·채문희·소교 (녹화 계획 2판) — FIX-024 저능력 하한, 맹렬한 화염 목표별 순서
import { describe, it, expect } from 'vitest';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { Simulator } from '../packages/engine/src/index.ts';
import { loadReplays, checkReplay } from '../packages/data-tools/src/replay-check.ts';

const bundle: any = buildBundle();
const sim = new Simulator(bundle);
const gid = (n: string) => bundle.generals.find((g: any) => g.name.ko === n).id;
const U = (n: string, s: string[] = []) => ({ generalId: gid(n), skillIds: s, manualId: 'none' });
const ally = { formation: '기형진', units: [U('주태', ['supply-cut', 'blazing-sky']), U('황개', ['golden-fortress', 'prepare-armor']), U('하후돈', ['see-truth', 'choose-momentum'])] } as any;
const foe = { formation: '안형진', units: [U('여몽'), U('채문희'), U('소교')] } as any;

describe('녹화 2판(주태·하후돈·황개) 역재현', () => {
  const rows = checkReplay(loadReplays().find(r => r.id === '2026-10-08-zhoutai-xiahoudun-huanggai')!);
  it('FIX-024 낮은 무력의 평타·낮은 지력의 책략이 실측과 25% 안 (예전 −50~−70%)', () => {
    const pick = (re: RegExp) => rows.filter(x => re.test(x.label));
    const low = [...pick(/채문희→(주태|황개) 일반 공격/), ...pick(/주태→\S+ 보급 차단/)];
    expect(low.length).toBe(5);
    for (const x of low) expect(Math.abs(x.errPct)).toBeLessThan(0.25);
  });
  it('이번 판 피해 표본 RMS 20% 이내', () => {
    const d = rows.filter(x => x.kind === 'damage');
    const rms = Math.sqrt(d.reduce((a, x) => a + Math.log(x.predicted / x.observed) ** 2, 0) / d.length);
    expect(rms).toBeLessThan(0.2);
  });
});

describe('맹렬한 화염 목표별 처리', () => {
  it('목표마다 화공 → 책략 → 병기 후 다음 목표', () => {
    let log: string[] = [];
    for (let seed = 1; seed < 40 && !log.length; seed++) {
      const r = sim.simulate(ally, foe, { seed });
      const i = r.log.findIndex((l: string) => /전법 \[맹렬한 화염\]을\(를\) 발동했/.test(l));
      if (i >= 0) log = r.log.slice(i, i + 40);
    }
    expect(log.length).toBeGreaterThan(0);
    // 첫 목표의 피해 두 줄이 두 번째 목표의 화공 줄보다 먼저 나온다
    const fire = log.map((l, k) => [l, k] as const).filter(([l]) => /「화공」 효과가 (발동|갱신)됐습니다/.test(l)).map(([, k]) => k);
    const hits = log.map((l, k) => [l, k] as const).filter(([l]) => /【맹렬한 화염】 효과로 병력이/.test(l)).map(([, k]) => k);
    expect(fire.length).toBeGreaterThanOrEqual(2);
    expect(hits.filter(k => k < fire[1]).length).toBeGreaterThanOrEqual(1);
  });
});

// 녹화 2026-10-09 주하황 3~8턴 — FIX-025 병력 계수, FIX-026 대신 받기 통솔 영향, FEAT-031 강렬 통솔 가중치
describe('녹화 2판 3~8턴', () => {
  const E: any = (sim as any).engine;
  const mk = (gid: string, side: string) => sim.buildArmy({ formation: '기형진', units: [{ generalId: gid, skillIds: [] }] } as any, side)[0] as any;
  it('FIX-025 병력이 적을수록 피해가 크게 준다 — 병력 645 주태 보급 차단이 실측(104·121)과 40% 안 (예전 +130%)', () => {
    const rows = checkReplay(loadReplays().find(r => r.id === '2026-10-09-zhoutai-xiahoudun-huanggai-t3-8')!);
    const low = rows.filter(x => x.turn === 8 && /주태→(채문희|소교) 보급 차단/.test(x.label));
    expect(low.length).toBe(2);
    for (const x of low) expect(Math.abs(x.errPct)).toBeLessThan(0.4);
  });
  it('FIX-025 1만을 넘는 병력은 피해를 더 늘리지 않는다', () => {
    const a = mk(gid('여몽'), 'A'), d = mk(gid('주태'), 'B');
    a.troops = 10000; const x = E.calcDamage(a, d, 1, '책략', (sim as any).coeffs, null, 1, 'active').dmg;
    a.troops = 16000; const y = E.calcDamage(a, d, 1, '책략', (sim as any).coeffs, null, 1, 'active').dmg;
    expect(Math.abs(x - y)).toBeLessThan(x * 0.02);   // 피해 편차(±1%)만큼만 다름
    a.troops = 2500; const z = E.calcDamage(a, d, 1, '책략', (sim as any).coeffs, null, 1, 'active').dmg;
    expect(z / x).toBeCloseTo(Math.pow(0.25, 0.35), 1);
  });
  it('FIX-026 주태 대신 받기: 감소율 50% × 통솔 영향(325.57 → 약 67%)', () => {
    const foe2 = { formation: '안형진', units: [U('여몽'), U('채문희', ['unexpected']), U('소교')] } as any;
    const ev: any[] = [];
    for (let seed = 1; seed < 80 && !ev.length; seed++) ev.push(...(sim.simulate(ally, foe2, { seed, trace: true }).trace || []).filter((e: any) => e.e === 'guard'));
    expect(ev.length).toBeGreaterThan(0);
    const tong = mk(gid('주태'), 'A').stats.통솔;   // 시뮬은 진영·건물 보너스가 없어 녹화(325.57)보다 낮다
    const cut = 0.5 * (1 + (tong - 100) * 0.00148);
    for (const e of ev) expect(e.amount / e.before).toBeCloseTo(1 - cut, 1);
  });
  it('FEAT-031 강렬은 통솔 영향 가중치 0.46%, 무열황제 0.25%', () => {
    const sk = (id: string) => bundle.skills.find((s: any) => s.id === id) || bundle.uniqueSkills?.find((s: any) => s.id === id);
    const xd: any = (sim as any).skillDefs?.['u-xiahou-dun'] ?? null;
    const src = require('node:fs').readFileSync('packages/engine/src/skills/u-xiahou-dun.ts', 'utf8');
    expect(src).toMatch(/"weight": 0\.0046/);
    expect(require('node:fs').readFileSync('packages/engine/src/skills/u-sun-jian.ts', 'utf8')).toMatch(/"weight": 0\.0025/);
    void sk; void xd;
  });
});
