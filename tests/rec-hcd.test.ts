// 녹화 2026-10-13 화타·초선·대교 vs 서서·여몽·노숙 (녹화 계획 8판) — FIX-031·032
import { describe, it, expect } from 'vitest';
import { buildBundle } from '../packages/data-tools/src/bundle.ts';
import { Simulator } from '../packages/engine/src/index.ts';

const bundle: any = buildBundle();
const sim = new Simulator(bundle);
const man = (id: string, n: string) => (bundle.generals.find((g: any) => g.id === id).manuals || []).find((m: any) => m.name === n)?.id;
const A = { formation: '안형진', units: [
  { generalId: 'hua-tuo', skillIds: ['unexpected', 'five-thunder'], manualId: man('hua-tuo', '청낭경') },
  { generalId: 'diao-chan', skillIds: ['calamity', 'good-plan'], manualId: man('diao-chan', '화수') },
  { generalId: 'da-qiao', skillIds: ['fresh-breeze', 'strategize'], manualId: man('da-qiao', '상사문부') }] } as any;
const B = { formation: '기형진', units: [
  { generalId: 'xu-shu', skillIds: ['civil-military', 'flood-seven'], manualId: 'none' },
  { generalId: 'lü-meng', skillIds: ['direct-world', 'fresh-breeze'], manualId: 'none' },
  { generalId: 'lu-su', skillIds: ['foresight', 'strategize'], manualId: 'none' }] } as any;
const logs = Array.from({ length: 30 }, (_, s) => sim.simulate(A, B, { seed: s + 1 }).log as string[]);

describe('녹화 2026-10-13 (화타·초선·대교)', () => {
  it('FIX-032 화수·폐월은 자신(초선)을 빼고 무력이 가장 높은 우군에게', () => {
    for (const log of logs) {
      expect(log.some(l => /\[초선\]의 【연타확률】이\(가\)/.test(l))).toBe(false);
      expect(log.some(l => /\[(대교|화타)\]의 【연타확률】이\(가\) 30\.00%/.test(l))).toBe(true);
    }
  });
  it('FIX-032 마비산은 화타 자신이 아닌 병력이 가장 낮은 우군에게 (정신 회복 → 회복 순서)', () => {
    let n = 0;
    for (const log of logs) {
      expect(log.some(l => /\[화타\]의 「정신 회복」 효과가 .*화타의 【마비산】/.test(l))).toBe(false);
      n += log.filter(l => /\[(초선|대교)\]의 「정신 회복」 효과가 .*화타의 【마비산】/.test(l)).length;
    }
    expect(n).toBeGreaterThan(30);
  });
  it('FIX-031 준비 중 전법은 침묵에 걸리는 순간 취소되고 다음 차례에 터지지 않는다', () => {
    let cancelled = 0;
    for (const log of logs) {
      log.forEach((l, i) => {
        const m = l.match(/^(\d+)턴:\s+\[(.+?)\]이\(가\) 전법【(.+?)】을\(를\) 발동할 수 없습니다/);
        if (!m) return;
        cancelled++;
        const fired = log.slice(i + 1).find(x => x.includes(`[${m[2]}]이(가) 【${m[3]}】 준비를 마치고 발동합니다`));
        if (fired) expect(Number(fired.match(/^(\d+)턴/)![1])).toBeGreaterThan(Number(m[1]) + 1);   // 그 예약분은 터지지 않는다(새로 준비한 것만)
      });
    }
    expect(cancelled).toBeGreaterThan(0);
  });
});
