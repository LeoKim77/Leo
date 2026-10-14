// 스탯 영향 표본 ↔ 전법 연결 (FEAT-034, 사용자 지정 2026-10-14: 인게임 수치 우선)
//   역재현 influenceSamples 의 skill 문구("난세의 간웅 받는 피해 감소")에서 전법을 찾고,
//   기본값(base, 10레벨 표기 %)과 묶어 "<skillId>@<base>" 키를 만든다.
import { join } from 'node:path';
import { DATA, readJson } from './paths.ts';

export interface InfluenceWeight { weight: number; n: number; errGlobal: number; errFit: number; samples: string[] }
export interface InfluenceFit { generatedAt: string; globalWeight: number; weights: Record<string, InfluenceWeight>; requests: Array<{ key: string; skill: string; why: string; ask: string }>; skipped: Array<{ sample: string; why: string }> }

export const FIT_FILE = join(DATA, 'engine', 'influence-fit.json');
export function loadInfluenceFit(): InfluenceFit | null { return readJson<InfluenceFit | null>(FIT_FILE, null); }

const sq = (x: string) => x.replace(/\s+/g, '');
/** 표본 문구에 이름이 들어 있는 전법 중 가장 긴 이름 (금병법 표본은 제외) */
export function matchSkill(sampleSkill: string, skills: Array<{ id: string; name: { ko: string } }>) {
  if (/금병법|〈/.test(sampleSkill)) return null;
  const t = sq(sampleSkill);
  let best: any = null;
  for (const s of skills) { const n = sq(s.name.ko); if (n.length >= 2 && t.startsWith(n) && (!best || n.length > sq(best.name.ko).length)) best = s; }
  return best;
}
export const weightKey = (skillId: string, base: number) => `${skillId}@${Math.round(base * 100) / 100}`;

/** 엔진이 이 표본에 쓰는 가중치: 실측 맞춤(influence-fit) → 전법 파일의 녹화 맞춤(inf/statScale.weight) → 공용 */
export function engineWeight(sk: any, base: number, fit: InfluenceFit | null, global: number): { w: number; src: '실측 맞춤' | '전법 파일' | '공용' } {
  if (!sk) return { w: global, src: '공용' };
  const f = fit?.weights[weightKey(sk.id, base)];
  if (f) return { w: f.weight, src: '실측 맞춤' };
  const eff = sk.engine?.effects || {};
  const items = ['damage', 'buffs', 'statMods', 'heal'].flatMap(k => eff[k] || []).concat(sk.engine?.alwaysOnBuffs || []);
  const withW = items.filter((it: any) => it?.inf?.weight != null || it?.statScale?.weight != null);
  const near = withW.find((it: any) => Math.abs(Math.abs(it.max ?? it.min ?? 0) * 100 - base) < 0.6) || (withW.length === 1 ? withW[0] : null);
  if (near) return { w: near.inf?.weight ?? near.statScale.weight, src: '전법 파일' };
  return { w: global, src: '공용' };
}
