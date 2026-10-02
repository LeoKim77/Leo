// 시즌별 전쟁 티어덱 + 내 보유 기준 충족도
import { h, mount, pct } from '../dom.ts';
import { app, loadUser, skillById, generalById } from '../state.ts';
import { setSimDeck } from './sim.ts';

export function renderTierDecks(root: HTMLElement) {
  const user = loadUser();
  const ownG = new Set(user.ownedGenerals), ownS = new Set(user.ownedSkills);
  const hasRoster = ownG.size + ownS.size > 0;
  const decks = app.bundle.tierDecks.filter(t => t.season === app.season || app.bundle.tierDecks.every(x => x.season !== app.season));
  const seasonNote = decks.length && decks[0].season !== app.season ? `${app.season} 티어덱이 아직 없어 ${decks[0].season} 티어덱을 보여줍니다.` : '';
  mount(root, 
    h('div', { class: 'section-head' }, h('h2', null, '전쟁 티어덱'), h('span', { class: 'sub' }, `${decks.length}개 · 출처: 한국판 DB 엑셀`)),
    seasonNote ? h('div', { class: 'notice' }, seasonNote) : null,
    !hasRoster ? h('div', { class: 'notice' }, '보유 탭에서 가진 무장·전법을 체크하면 덱마다 충족도가 표시됩니다.') : null,
    h('div', { class: 'grid cols-2' }, decks.map(t => {
      const need = t.units.length * 3;
      const have = t.units.reduce((a, u) => a + (ownG.has(u.generalId) ? 1 : 0) + u.skillIds.filter(s => ownS.has(s)).length, 0);
      return h('div', { class: 'panel' },
        h('div', { class: 'section-head' },
          h('div', null, h('span', { class: 'badge tier' }, t.tier), ' ', h('b', null, t.name)),
          hasRoster ? h('span', { class: 'mono', style: { color: have / need >= 0.8 ? 'var(--ok)' : have / need >= 0.4 ? 'var(--warn)' : 'var(--text-dim)' } }, `보유 ${pct(have / need, 0)}`) : null),
        t.note ? h('div', { class: 'sub', style: { marginBottom: '6px' } }, t.note) : null,
        h('table', null, h('tbody', null, t.units.map(u => h('tr', null,
          h('td', { style: { width: '74px' } }, h('a', { href: `#/codex?kind=general&id=${u.generalId}`, style: { color: ownG.has(u.generalId) || !hasRoster ? 'var(--text)' : 'var(--text-mute)' } }, u.generalName)),
          h('td', null,
            u.skillIds.map((sid, i) => h('a', { href: `#/codex?kind=skill&id=${sid}`, class: 'badge', style: { color: !hasRoster || ownS.has(sid) ? 'var(--text)' : 'var(--text-mute)' } }, skillById(sid)?.name.ko || u.skillNames[i])),
            h('div', { class: 'muted', style: { fontSize: '12.5px' } },
              (() => { const m = generalById(u.generalId)?.manuals.find(x => x.id === u.manualId); return m ? `금병법〈${m.name}〉${m.status === 'unsupported' ? '(미지원)' : ''} · ` : ''; })(),
              `세팅 병법 ${u.manualSlots.map(s => s.join('/')).join(' · ')} · ${u.statPriority}`)))))),
        h('div', { style: { marginTop: '8px', display: 'flex', gap: '6px' } },
          h('button', { class: 'btn small', onclick: () => { setSimDeck('A', { tierId: t.id }); location.hash = '#/sim'; } }, '내 덱으로 시뮬'),
          h('button', { class: 'btn small', onclick: () => { setSimDeck('B', { tierId: t.id }); location.hash = '#/sim'; } }, '상대로 시뮬')));
    })),
  );
}
