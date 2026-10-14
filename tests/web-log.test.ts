// FIX-033 화면 전보 = 인게임 문구만 (검증용 줄·꼬리는 엔진 로그 내부 전용)
import { describe, it, expect } from 'vitest';
import { gameLine } from '../apps/web/src/log-format.ts';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { Simulator } from '../packages/engine/src/index.ts';

describe('화면 전보 표기 (FIX-033)', () => {
  it('회복 줄의 치유율·시전자 지력을 뗀다', () => {
    expect(gameLine('1턴: [순욱]이(가) 【청낭 치료】의 「청낭 치료」 효과를 발동합니다. (치유율 296.5%, 시전자 지력 266.20)'))
      .toBe('1턴: [순욱]이(가) 【청낭 치료】의 「청낭 치료」 효과를 발동합니다.');
  });
  it('검증·참고용 줄은 숨긴다', () => {
    for (const l of ['1턴:     [스택] 준비 완료·주는피해 3스택', '1턴:     [상태이상] 침묵 1턴—서서', '2턴:     주는피해 6.00% · 받는피해 -16.00%',
      '0턴:   [한당] 무 189 지 115 통 163 선 137 / 주는피해 12.00%', '0턴:     └ [명사수] (패시브) 대기 — 조건 발동형', '0턴: ※ 공급·건물기술·장비·병법·전법 승급은 계정별 변수라 시뮬에 반영되지 않습니다.',
      '0턴: [아군] 진영 기형진 / 제갈량(전열) · 황개(후열) · 대교(후열)', '1턴:   [대교]이(가) 「정신 회복」 상태를 획득했습니다. (마비산)', '1턴:   └[상태] 공융 — 병력 9765/10000'])
      expect(gameLine(l), l).toBeNull();
  });
  it('인게임 문구로 꼬리를 정리한다', () => {
    expect(gameLine('1턴:   [대교]의 「정신 회복」 효과가 발동됐습니다. (1턴 지속) — 화타의 【마비산】')).toBe('1턴:   [대교]의 「정신 회복」 효과가 발동했습니다.');
    expect(gameLine('1턴: [초선]이(가) 전법 [금병법〈화수〉]을(를) 발동했습니다. (턴 종료)')).toBe('1턴: [초선]이(가) 전법 [금병법〈화수〉]을(를) 발동했습니다.');
    expect(gameLine('1턴: [서서]이(가) 【천하평론】의 「천하평론」 효과를 발동합니다. (여몽의 [천하평론]으로 지시됨)')).toBe('1턴: [서서]이(가) 【천하평론】의 「천하평론」 효과를 발동합니다.');
    expect(gameLine('1턴:   [조조]의 병력이 120(9880) 손실됐습니다.')).toBe('1턴:   [조조]의 병력이 120(9880) 손실됐습니다.');
  });
  it('엔진: 디버프 제거는 상태 이름으로, [스택] 출처는 전법 이름으로', () => {
    const b = buildBundle(); const sim = new Simulator(b);
    const logs = b.tierDecks.slice(0, 8).flatMap((t, k) => sim.simulate(sim.tierDeckSpec(t.id), sim.tierDeckSpec(b.tierDecks[(k + 3) % b.tierDecks.length].id), { seed: k }).log as string[]);
    expect(logs.some(l => /디버프 \d+가지가 제거/.test(l))).toBe(false);
    expect(logs.some(l => /\[스택\].*\bready·/.test(l))).toBe(false);
  });
});
