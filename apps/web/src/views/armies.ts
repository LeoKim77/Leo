// 부대 편성 — 예전 시뮬(v1.12b) 화면처럼: 부대 최대 5개, 진형 고르기 + 전열/후열 칸을 눌러 배치, 무장 3명 카드(고유 전법·전법 2칸·금병법 + 상세)
// 진형은 전열·후열 둘뿐이다(R-048). 무장 카드를 누르면 전열 ↔ 후열.
import { h, mount, select } from '../dom.ts';
import { app, inSeason, generalById, loadUser, saveUser, type UserData } from '../state.ts';
import { showSkill, showManual } from './detail.ts';
import type { DeckSpec } from '@cheonha/engine';

export type Row = 'front' | 'back';
export interface ArmyUnit { generalId: string; skillIds: [string, string]; manualId?: string; position?: Row }
export type Army = Omit<DeckSpec, 'units'> & { id: string; savedAt: string; name?: string; units: ArmyUnit[] };
const MAX_ARMIES = 5;
const open = new Set<string>();

const usableManual = (m: { status?: string }) => m.status === 'ok' || m.status === 'approx';

/** 칸을 정하지 않은 무장의 기본 열: 진형 전열 칸 수만큼 성향(전열 → 균형 → 후열) 순으로 전열 (엔진 slotPositions 와 같은 규칙) */
export function defaultRows(formationName: string, units: Array<{ generalId: string }>): Row[] {
  const f = app.bundle.formations.find(x => x.name === formationName);
  const hr = (f?.hitRate || { front: 0.6, mid: 0.2, back: 0.2 }) as Record<string, number>;
  const slots: Row[] = ['front', hr.mid >= hr.front - 1e-9 ? 'front' : 'back', hr.back >= hr.front - 1e-9 ? 'front' : 'back'];
  const pref = (row?: string) => (row === '전열' ? 0 : row === '후열' ? 2 : 1);
  const order = units.map((u, i) => ({ i, p: pref(generalById(u.generalId)?.row) })).sort((a, b) => a.p - b.p || a.i - b.i);
  const out: Row[] = [];
  order.forEach((o, k) => { out[o.i] = slots[Math.min(k, 2)]; });
  return out;
}
export const rowsOf = (a: { formation?: string; units: ArmyUnit[] }) => {
  const def = defaultRows(a.formation || '기형진', a.units);
  return a.units.map((u, i) => u.position || def[i]);
};

export function armies(user = loadUser()): Army[] { return user.decks as Army[]; }
export function armyName(a: Army, i: number) { return a.name || `${i + 1}군`; }

/** 다른 화면(티어덱·덱 추천)에서 부대로 저장 */
export function saveAsArmy(spec: DeckSpec & { name?: string }): string | null {
  const user = loadUser();
  if (user.decks.length >= MAX_ARMIES) return null;
  const id = `army-${Date.now()}`;
  user.decks.push({ ...spec, id, savedAt: new Date().toISOString(), units: spec.units.map(u => ({ generalId: u.generalId, skillIds: [u.skillIds[0] || '', u.skillIds[1] || ''], manualId: u.manualId, position: (u.position as Row) || undefined })) } as any);
  saveUser(user);
  open.add(id);
  return id;
}

function armyCard(user: UserData, a: Army, idx: number, redraw: () => void) {
  const b = app.bundle;
  const save = () => { a.savedAt = new Date().toISOString(); saveUser(user); };
  while (a.units.length < 3) a.units.push({ generalId: '', skillIds: ['', ''] });
  const owned = new Set(user.ownedGenerals), ownedS = new Set(user.ownedSkills);
  const usedG = new Set(a.units.map(u => u.generalId).filter(Boolean));
  // R-058 같은 인물(SP 등)은 한 부대에 함께 넣을 수 없다
  const personOf = (id: string) => ((generalById(id) as any)?.samePerson || id);
  const usedP = new Set([...usedG].map(personOf));
  const usedS = new Set(a.units.flatMap(u => u.skillIds).filter(Boolean));
  const gens = b.generals.filter(g => inSeason(g.season)).sort((x, y) => (owned.has(y.id) ? 1 : 0) - (owned.has(x.id) ? 1 : 0) || x.name.ko.localeCompare(y.name.ko, 'ko'));
  const skills = b.skills.filter(s => !s.isUnique && inSeason(s.season)).sort((x, y) => (ownedS.has(y.id) ? 1 : 0) - (ownedS.has(x.id) ? 1 : 0) || x.name.ko.localeCompare(y.name.ko, 'ko'));
  const rows = rowsOf(a);
  const f = b.formations.find(x => x.name === (a.formation || '기형진'));
  const isOpen = open.has(a.id);

  const unitCard = (u: ArmyUnit, i: number) => {
    const g = u.generalId ? generalById(u.generalId) : undefined;
    const uniq = g ? b.skills.find(s => s.id === g.uniqueSkillId) : undefined;
    const genOpts = [{ value: '', label: '— 무장 선택 —' }, ...gens.filter(x => x.id === u.generalId || (!usedG.has(x.id) && !usedP.has(personOf(x.id)))).map(x => ({ value: x.id, label: `${x.name.ko} (${x.faction}·${x.row})${(x as any).krRelease ? ' · 한국 미출시' : ''}${owned.size && !owned.has(x.id) ? ' · 미보유' : ''}` }))];
    const skOpts = (k: number) => [{ value: '', label: '— 전법 —' }, ...skills.filter(s => s.id === u.skillIds[k] || !usedS.has(s.id)).map(s => ({ value: s.id, label: `[${s.grade || '-'}·${s.kind}] ${s.name.ko}${(s as any).krRelease ? ' · 한국 미출시' : ''}${ownedS.size && !ownedS.has(s.id) ? ' · 미보유' : ''}` }))];
    const ms = g?.manuals || [];
    const curManual = u.manualId || ms.find(usableManual)?.id || 'none';
    const mOpts = [{ value: 'none', label: '금병법 없음' }, ...ms.map(m => ({ value: m.id!, label: `〈${m.name}〉${m.status === 'approx' ? ' 근사' : m.status === 'unsupported' ? ' 미지원' : m.status === 'missing' ? ' 원문 미확인' : ''}` }))];
    return h('div', { class: 'unit-card' },
      h('div', { class: 'unit-label' }, `무장 ${i + 1}`),
      select(genOpts, u.generalId, v => { u.generalId = v; u.manualId = undefined; u.position = undefined; save(); redraw(); }, { style: { width: '100%' }, 'aria-label': `무장 ${i + 1}` }),
      g ? h('div', { class: 'unique-row' }, h('span', null, `고유전법: ${uniq?.name.ko || '-'}`), uniq ? h('button', { class: 'btn small', onclick: () => showSkill(uniq.id) }, '상세') : null) : null,
      [0, 1].map(k => h('div', null,
        h('div', { class: 'unit-label' }, `전법 ${k + 1}`),
        h('div', { class: 'pick-row' },
          select(skOpts(k), u.skillIds[k], v => { u.skillIds[k] = v; save(); redraw(); }, { 'aria-label': `무장 ${i + 1} 전법 ${k + 1}` }),
          u.skillIds[k] ? h('button', { class: 'btn small', onclick: () => showSkill(u.skillIds[k]) }, '상세') : null))),
      g ? h('div', null, h('div', { class: 'unit-label' }, '금병법'),
        h('div', { class: 'pick-row' },
          select(mOpts, curManual, v => { u.manualId = v; save(); redraw(); }, { 'aria-label': `무장 ${i + 1} 금병법` }),
          curManual !== 'none' ? h('button', { class: 'btn small', onclick: () => showManual(u.generalId, curManual) }, '상세') : null)) : null);
  };

  const rowCol = (row: Row) => h('div', { class: 'fp-col' },
    h('div', { class: 'fp-col-label' }, row === 'front' ? '전열' : '후열'),
    a.units.map((u, i) => ({ u, i })).filter(x => x.u.generalId && rows[x.i] === row).map(({ u, i }) => {
      const g = generalById(u.generalId)!;
      return h('button', { class: `fp-card ${row}`, title: '누르면 전열 ↔ 후열', onclick: () => { u.position = row === 'front' ? 'back' : 'front'; save(); redraw(); } },
        h('div', { class: 'fp-card-name' }, g.name.ko),
        h('div', { class: 'fp-card-stats' }, `무 ${g.stats['무력']} · 지 ${g.stats['지력']} · 통 ${g.stats['통솔']} · 선 ${g.stats['선공']}`),
        h('div', { class: 'fp-card-stats' }, `${row === 'front' ? '전열' : '후열'} · 피격률 ${Math.round(((f?.hitRate as any)?.[row] ?? 0) * 100)}%`));
    }),
    a.units.some((u, i) => u.generalId && rows[i] === row) ? null : h('div', { class: 'fp-empty' }, '—'));

  return h('div', { class: 'panel army' },
    h('div', { class: 'army-head' },
      h('input', { type: 'text', value: armyName(a, idx), 'aria-label': '부대 이름', oninput: (e: Event) => { a.name = (e.target as HTMLInputElement).value; save(); } }),
      h('span', { class: 'sub' }, a.units.filter(u => u.generalId).map(u => generalById(u.generalId)?.name.ko).join(' · ') || '비어 있음'),
      h('span', { class: 'army-actions' },
        select([{ value: '', label: '티어덱 기준 배치 ▾' }, ...b.tierDecks.map(t => ({ value: t.id, label: `${t.season} ${t.tier} ${t.name}` }))], '', v => {
          const t = b.tierDecks.find(x => x.id === v); if (!t) return;
          a.formation = t.formation || a.formation;
          a.units = t.units.map(x => ({ generalId: x.generalId, skillIds: [x.skillIds.filter(s => !s.startsWith('?'))[0] || '', x.skillIds.filter(s => !s.startsWith('?'))[1] || ''] as [string, string], manualId: x.manualId }));
          if (!a.name) a.name = `${idx + 1}군 (${t.name})`;
          save(); redraw();
        }, { 'aria-label': '티어덱 기준 배치' }),
        h('button', { class: 'btn small', onclick: () => { location.hash = `#/sim?army=${a.id}`; } }, '이 부대로 시뮬'),
        h('button', { class: 'btn small', onclick: () => { user.decks.splice(idx, 1); saveUser(user); redraw(); } }, '삭제'),
        h('button', { class: 'btn small', onclick: () => { isOpen ? open.delete(a.id) : open.add(a.id); redraw(); } }, isOpen ? '접기 ▴' : '펼치기 ▾'))),
    isOpen ? h('div', null,
      h('div', { class: 'formation-picker' },
        h('div', { class: 'fp-left' },
          h('div', { class: 'unit-label' }, '진형'),
          select(b.formations.map(x => ({ value: x.name, label: x.name })), a.formation || '기형진', v => { a.formation = v; save(); redraw(); }, { style: { width: '100%' }, 'aria-label': '진형' }),
          h('div', { class: 'fp-effect' }, h('div', { class: 'fp-effect-label' }, '효과'),
            h('ul', { class: 'fp-effect-list' }, (f?.traits || []).map(t => h('li', null, t)),
              h('li', null, `일반 공격 피격률 전열 ${Math.round(((f?.hitRate as any)?.front ?? 0) * 100)}% · 후열 ${Math.round(((f?.hitRate as any)?.back ?? 0) * 100)}%`))),
          h('div', { class: 'sub', style: { marginTop: '8px' } }, '전열·후열 칸의 무장 카드를 누르면 반대쪽 열로 옮깁니다.')),
        h('div', { class: 'fp-right' }, rowCol('front'), rowCol('back'))),
      h('div', { class: 'unit-grid' }, a.units.slice(0, 3).map(unitCard))) : null);
}

export function renderArmies(root: HTMLElement) {
  const user = loadUser();
  const list = armies(user);
  if (list.length && !open.size) open.add(list[0].id);
  const redraw = () => renderArmies(root);
  mount(root,
    h('div', { class: 'section-head' }, h('h2', null, '부대 편성'), h('span', { class: 'sub' }, `최대 ${MAX_ARMIES}부대 · ${list.length}/${MAX_ARMIES}`)),
    h('div', { class: 'toolbar' },
      h('button', { class: 'btn primary', disabled: list.length >= MAX_ARMIES, onclick: () => {
        const id = `army-${Date.now()}`;
        user.decks.push({ id, savedAt: new Date().toISOString(), name: `${list.length + 1}군`, formation: '기형진', units: [0, 1, 2].map(() => ({ generalId: '', skillIds: ['', ''] })) } as any);
        saveUser(user); open.add(id); redraw();
      } }, '+ 부대 추가'),
      h('span', { class: 'sub' }, '부대를 추가한 뒤 무장·전법·금병법을 고르고, 진형 칸에서 전열/후열을 정하세요. 티어덱 기준 배치로 시작해도 됩니다.')),
    list.length ? h('div', { class: 'grid' }, list.map((a, i) => armyCard(user, a, i, redraw)))
      : h('div', { class: 'empty' }, '아직 부대가 없습니다. [+ 부대 추가]로 첫 부대를 만드세요.'));
}
