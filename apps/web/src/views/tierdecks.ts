// 시즌별 전쟁 티어덱 + 내 보유 기준 충족도
import { h, mount, pct } from '../dom.ts';
import { app, loadUser, skillById, generalById, tentative, laterSeasonWithData, setSeason, seasonLabel } from '../state.ts';
import { setSimDeck } from './sim.ts';
import type { TierDeck, TierDeckUnit } from '@cheonha/engine';

/** 시트에서 색칠된 칸인가 (색의 뜻은 시트 작성자 확인 전 — '시트 강조'로만 표시) */
const marked = (t: TierDeck, unit: number, field: string) => (t.highlight || []).some(x => x.unit === unit && x.field === field);
const hlAttrs = (on: boolean) => (on ? { class: 'hl', title: '시트에서 색칠된 칸' } : {});

function unitRow(t: TierDeck, u: TierDeckUnit, i: number, own: { g: Set<string>; s: Set<string>; any: boolean }) {
  const g = generalById(u.generalId);
  const m = g?.manuals.find(x => x.id === u.manualId);
  const tmp = tentative(g?.dataStatus);
  const dim = (ok: boolean) => (!own.any || ok ? 'var(--text)' : 'var(--text-mute)');
  return h('tr', null,
    h('td', { style: { width: '92px', verticalAlign: 'top' } },
      h('a', { href: `#/codex?kind=general&id=${u.generalId}`, style: { color: dim(own.g.has(u.generalId)) }, ...hlAttrs(marked(t, i, '무장')) }, u.generalName),
      u.unitType ? h('div', null, h('span', { class: 'badge', title: '덱에서 병종 변경' }, `→ ${u.unitType}`)) : null,
      tmp.length ? h('div', null, h('span', { class: 'badge tmp', title: tmp.map(x => x.join(': ')).join('\n') }, '임시 자료')) : null),
    h('td', null,
      u.skillIds.map((sid, k) => h('span', hlAttrs(marked(t, i, `전법${k + 1}`)),
        h('a', { href: `#/codex?kind=skill&id=${sid}`, class: 'badge', style: { color: dim(own.s.has(sid)) } }, skillById(sid)?.name.ko || u.skillNames[k]),
        u.skillAlternatives?.[k]?.length ? h('span', { class: 'muted', style: { fontSize: '12px', marginRight: '6px' } }, `또는 ${u.skillAlternatives[k].map(a => a.name).join(', ')}`) : null)),
      h('div', { class: 'muted', style: { fontSize: '12.5px' } },
        m ? `금병법〈${m.name}〉${m.status === 'unsupported' ? '(미지원)' : m.status === 'missing' ? '(원문 미확인 — 시뮬 제외)' : ''} · ` : '',
        u.manualSlots.flat().every(x => x === '연의') ? '연의 무장 — 병법 칸 없음' : `세팅 병법 ${u.manualSlots.map(s => s.join('/')).join(' · ')}`),
      h('div', { class: 'muted', style: { fontSize: '12.5px' } },
        [u.statCombo && `장비 ${u.statCombo}`, u.gear?.trait && `장비 특성 ${u.gear.trait}`, u.gear?.mount && `탈것 ${u.gear.mount}`].filter(Boolean).join(' · '),
        u.statPriority ? [' · ', h('span', hlAttrs(marked(t, i, '능력치 분배')), `능력치 ${u.statPriority}`)] : null)));
}

export function renderTierDecks(root: HTMLElement) {
  const user = loadUser();
  const own = { g: new Set(user.ownedGenerals), s: new Set(user.ownedSkills), any: user.ownedGenerals.length + user.ownedSkills.length > 0 };
  const decks = app.bundle.tierDecks.filter(t => t.season === app.season || app.bundle.tierDecks.every(x => x.season !== app.season));
  const seasonNote = decks.length && decks[0].season !== app.season ? `${app.season} 티어덱이 아직 없어 ${decks[0].season} 티어덱을 보여줍니다.` : '';
  const later = laterSeasonWithData();
  const sources = [...new Set(decks.map(t => t.source?.label).filter(Boolean))];
  mount(root,
    later ? h('div', { class: 'notice' }, `${seasonLabel(later)} 티어덱이 들어와 있습니다. `, h('button', { class: 'btn small', onclick: () => setSeason(later) }, `${seasonLabel(later)} 보기`)) : null,
    h('div', { class: 'section-head' }, h('h2', null, '전쟁 티어덱'), h('span', { class: 'sub' }, `${decks.length}개 · 출처: ${sources.join(', ') || '한국판 DB 엑셀'}`)),
    seasonNote ? h('div', { class: 'notice' }, seasonNote) : null,
    !own.any ? h('div', { class: 'notice' }, '보유 탭에서 가진 무장·전법을 체크하면 덱마다 충족도가 표시됩니다.') : null,
    decks.some(t => t.highlight?.length) ? h('div', { class: 'notice' }, h('span', { class: 'hl' }, '밑줄 칸'), '은 시트에서 색칠된 칸입니다(색의 뜻은 시트 작성자 확인 전).') : null,
    h('div', { class: 'grid cols-2' }, decks.map(t => {
      const need = t.units.length * 3;
      const have = t.units.reduce((a, u) => a + (own.g.has(u.generalId) ? 1 : 0) + u.skillIds.filter(s => own.s.has(s)).length, 0);
      return h('div', { class: 'panel' },
        h('div', { class: 'section-head' },
          h('div', null, h('span', { class: 'badge tier' }, t.tier), ' ', h('b', null, t.name), t.formation ? h('span', { class: 'badge', style: { marginLeft: '6px' } }, t.formation) : null),
          own.any ? h('span', { class: 'mono', style: { color: have / need >= 0.8 ? 'var(--ok)' : have / need >= 0.4 ? 'var(--warn)' : 'var(--text-dim)' } }, `보유 ${pct(have / need, 0)}`) : null),
        t.note ? h('div', { class: 'sub', style: { marginBottom: '6px' } }, t.note) : null,
        h('table', null, h('tbody', null, t.units.map((u, i) => unitRow(t, u, i, own)))),
        h('div', { style: { marginTop: '8px', display: 'flex', gap: '6px' } },
          h('button', { class: 'btn small', onclick: () => { setSimDeck('A', { tierId: t.id }); location.hash = '#/sim'; } }, '내 덱으로 시뮬'),
          h('button', { class: 'btn small', onclick: () => { setSimDeck('B', { tierId: t.id }); location.hash = '#/sim'; } }, '상대로 시뮬')));
    })),
  );
}
