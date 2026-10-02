// 전보 녹화 검증 전투 짜기 (R-007)
//   검증 대기 항목마다 "무엇이 내 덱에 있어야 관찰되는가"를 정하고,
//   보유 무장·전법으로 가장 적은 전투 수에 최대한 많은 항목을 담는다(욕심쟁이 집합 덮기).
//   한 부대 안에서는 무장·전법이 겹치면 안 되고, 금병법은 무장당 1개(R-005).
import type { GameBundle } from '@cheonha/engine';

export interface VerifyItem { id: string; kind: string; refs: string[]; title: string; assumption: string; howToVerify: string; status: string; priority?: number }

/** 이 중 하나가 덱에 있으면 관찰 가능 */
type Need = { generalId?: string; manualId?: string; skillId?: string };

export interface PlannedUnit { generalId: string; manualId?: string; skillIds: string[] }
export interface PlannedBattle {
  units: PlannedUnit[];
  items: Array<{ id: string; title: string; howToVerify: string; via: string }>;
}
export interface VerifyPlan {
  battles: PlannedBattle[];
  /** 보유 카드로는 관찰할 수 없는 항목과 필요한 카드 */
  blocked: Array<{ id: string; title: string; needs: string[] }>;
  covered: number;
  total: number;
}

const ENGINE_FIRST: Record<string, number> = { engine: 0, manual: 1, skill: 2, rate: 3, clause: 4 };

export function planVerification(bundle: GameBundle, queue: VerifyItem[], owned: { generals: string[]; skills: string[] }, opts: { maxBattles?: number } = {}): VerifyPlan {
  const ownG = new Set(owned.generals), ownS = new Set(owned.skills);
  const gName = (id: string) => bundle.generals.find(g => g.id === id)?.name.ko || id;
  const sById = new Map(bundle.skills.map(s => [s.id, s]));

  // 항목 → 필요한 카드 후보
  const needsOf = (it: VerifyItem): Need[] => {
    if (it.kind === 'manual') {
      const mid = it.id.replace(/^V-manual-/, '');
      const g = bundle.generals.find(x => x.manuals?.some(m => m.id === mid));
      return g ? [{ generalId: g.id, manualId: mid }] : [];
    }
    return it.refs.flatMap((r): Need[] => {
      const s = sById.get(r);
      if (s?.isUnique && s.ownerGeneralId) return [{ generalId: s.ownerGeneralId }];
      if (s) return [{ skillId: r }];
      if (bundle.generals.some(g => g.id === r)) return [{ generalId: r }];
      return [];
    });
  };
  const ownedNeed = (n: Need) => (!n.generalId || ownG.has(n.generalId)) && (!n.skillId || ownS.has(n.skillId));

  // capture(정보 화면 캡처로 확인) 항목은 전투가 필요 없어 계획에서 뺀다
  // 한국 서버에 아직 없는 시즌(예정)의 카드는 녹화할 수 없다
  const order = (x: string) => parseInt(x.replace(/\D/g, '') || '0', 10);
  const live = bundle.seasons?.find(x => x.status === 'live')?.id ?? bundle.season;
  const future = (r: string) => {
    const g = bundle.generals.find(x => x.id === r) || bundle.generals.find(x => x.id === sById.get(r)?.ownerGeneralId);
    const season = g?.season ?? sById.get(r)?.season;
    return !!season && !!live && order(season) > order(live);
  };
  const pending = queue.filter(q => q.status === 'pending' && q.kind !== 'capture' && !(q.refs.length && q.refs.every(future))).sort((a, b) => (ENGINE_FIRST[a.kind] ?? 9) - (ENGINE_FIRST[b.kind] ?? 9) || (b.priority ?? 0) - (a.priority ?? 0));
  const blocked: VerifyPlan['blocked'] = [];
  const todo: Array<{ it: VerifyItem; needs: Need[] }> = [];
  // 특정 카드가 필요 없는 엔진 가정(재교전 등)은 아무 전투에서나 보인다 → 첫 전투에 붙인다
  const anyBattle = pending.filter(it => it.kind === 'engine' && !needsOf(it).length);
  for (const it of pending) {
    if (anyBattle.includes(it)) continue;
    const needs = needsOf(it);
    const ok = needs.filter(ownedNeed);
    if (ok.length) todo.push({ it, needs: ok });
    else blocked.push({ id: it.id, title: it.title, needs: needs.length ? needs.map(n => [n.generalId && gName(n.generalId), n.manualId && `금병법 ${bundle.generals.flatMap(g => g.manuals || []).find(m => m.id === n.manualId)?.name}`, n.skillId && sById.get(n.skillId)?.name.ko].filter(Boolean).join(' + ')) : ['관련 카드 없음'] });
  }

  const battles: PlannedBattle[] = [];
  const left = new Set(todo.map((_, i) => i));
  const maxBattles = opts.maxBattles ?? 20;

  // 덱이 need 를 만족하는가
  const sat = (units: PlannedUnit[], n: Need) => {
    if (n.generalId) {
      const u = units.find(x => x.generalId === n.generalId);
      if (!u) return false;
      if (n.manualId && u.manualId !== n.manualId) return false;
    }
    if (n.skillId && !units.some(u => u.skillIds.includes(n.skillId!))) return false;
    return true;
  };

  while (left.size && battles.length < maxBattles) {
    const units: PlannedUnit[] = [];
    const via = new Map<number, string>();
    // 한 칸씩: 무장 추가(금병법 지정 포함) 또는 빈 전법 칸에 전법 추가 — 새로 덮는 항목이 가장 많은 것
    for (let step = 0; step < 9; step++) {
      type Move = { apply: (u: PlannedUnit[]) => PlannedUnit[]; gain: number[] };
      const moves: Move[] = [];
      const gainOf = (next: PlannedUnit[]) => [...left].filter(i => !via.has(i) && todo[i].needs.some(n => sat(next, n)));
      if (units.length < 3) {
        const cands = new Map<string, string | undefined>();
        for (const i of left) if (!via.has(i)) for (const n of todo[i].needs) if (n.generalId && !units.some(u => u.generalId === n.generalId)) {
          const key = `${n.generalId}|${n.manualId || ''}`;
          cands.set(key, n.manualId);
        }
        for (const [key, manualId] of cands) {
          const gid = key.split('|')[0];
          const next = [...units, { generalId: gid, manualId, skillIds: [] }];
          moves.push({ apply: () => next, gain: gainOf(next) });
        }
      }
      // 전법은 빈 칸이 있는 무장에게 (무장이 없으면 전법 전용 칸을 위해 아무 보유 무장이나 나중에 채운다)
      const free = units.findIndex(u => u.skillIds.length < 2);
      if (free >= 0) {
        const used = new Set(units.flatMap(u => u.skillIds));
        const cands = new Set<string>();
        for (const i of left) if (!via.has(i)) for (const n of todo[i].needs) if (n.skillId && !n.generalId && !used.has(n.skillId)) cands.add(n.skillId);
        for (const sid of cands) {
          const next = units.map((u, j) => (j === free ? { ...u, skillIds: [...u.skillIds, sid] } : u));
          moves.push({ apply: () => next, gain: gainOf(next) });
        }
      } else if (units.length < 3) {
        // 전법만 필요한 항목이 남았는데 칸이 없으면 보유 무장 하나를 '전법 운반용'으로 넣는다
        const needSkill = [...left].some(i => !via.has(i) && todo[i].needs.some(n => n.skillId && !n.generalId));
        const carrier = needSkill ? owned.generals.find(g => !units.some(u => u.generalId === g)) : undefined;
        if (carrier) moves.push({ apply: () => [...units, { generalId: carrier, skillIds: [] }], gain: [] });
      }
      if (!moves.length) break;
      // 우선순위가 높은 항목(승패 영향이 큰 계수·상위 티어덱 카드)을 많이 담는 수를 먼저 고른다
      const weight = (g: number[]) => g.reduce((s, i) => s + 1 + (todo[i].it.priority ?? 0) / 10, 0);
      moves.sort((a, b) => weight(b.gain) - weight(a.gain));
      const best = moves[0];
      if (!best.gain.length && !(units.length < 3 && units.every(u => u.skillIds.length >= 2))) break;
      const next = best.apply(units);
      units.splice(0, units.length, ...next);
      for (const i of best.gain) {
        const n = todo[i].needs.find(x => sat(units, x))!;
        via.set(i, [n.generalId && gName(n.generalId), n.skillId && sById.get(n.skillId)?.name.ko].filter(Boolean).join(' · '));
      }
    }
    if (!via.size) break;
    // 남은 덱의 모든 항목을 다시 판정 (나중 칸이 앞 항목도 덮을 수 있음)
    for (const i of left) if (!via.has(i) && todo[i].needs.some(n => sat(units, n))) via.set(i, '덱 구성');
    battles.push({ units, items: [...via.entries()].map(([i, v]) => ({ id: todo[i].it.id, title: todo[i].it.title, howToVerify: todo[i].it.howToVerify, via: v })) });
    for (const i of via.keys()) left.delete(i);
  }
  for (const i of left) blocked.push({ id: todo[i].it.id, title: todo[i].it.title, needs: ['전투 수 한도 초과'] });
  if (battles.length) battles[0].items.push(...anyBattle.map(it => ({ id: it.id, title: it.title, howToVerify: it.howToVerify, via: '아무 전투' })));
  else anyBattle.forEach(it => blocked.push({ id: it.id, title: it.title, needs: ['아무 전투나 녹화하면 확인 가능'] }));
  return { battles, blocked, covered: todo.length - left.size + (battles.length ? anyBattle.length : 0), total: pending.length };
}
