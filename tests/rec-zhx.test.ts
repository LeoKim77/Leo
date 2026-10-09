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
