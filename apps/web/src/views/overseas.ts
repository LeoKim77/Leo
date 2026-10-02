// 해외 참고 자료 — 천덱랩(deck-lab)이 모은 중국·대만 덱. 한국판 용어로 바꿔서 보여준다.
import { h, mount, select } from '../dom.ts';
import { app, loadDecklab, ko } from '../state.ts';

let tier = '전체';
let q = '';

export async function renderOverseas(root: HTMLElement) {
  mount(root, h('div', { class: 'empty' }, '해외 자료 불러오는 중…'));
  const dl = await loadDecklab();
  const gName = (id: string) => app.bundle.generals.find(g => g.id === id)?.name.ko || dl.generals.find((g: any) => g.id === id)?.name || id;
  const tName = (id: string) => app.bundle.skills.find(s => s.id === id)?.name.ko || dl.tactics.find((t: any) => t.id === id)?.name || id;
  const krReleased = (id: string) => app.bundle.generals.some(g => g.id === id);
  const decks = [...dl.decks, ...dl.aiDecks].filter((d: any) => (tier === '전체' || d.tier === tier) && (!q || d.name.includes(q) || d.members.some((m: any) => gName(m.generalId).includes(q))));
  const tiers = ['전체', ...new Set<string>([...dl.decks, ...dl.aiDecks].map((d: any) => d.tier).filter(Boolean))];
  const redraw = () => renderOverseas(root);
  mount(root, 
    h('div', { class: 'section-head' }, h('h2', null, '해외 참고 덱'), h('span', { class: 'sub' }, `${decks.length}개 · ${dl.attribution.label}`)),
    h('div', { class: 'notice' }, `${dl.attribution.note} 회색 이름은 한국 서버에 아직 없는 무장입니다.`),
    h('div', { class: 'toolbar' }, select(tiers, tier, v => { tier = v; redraw(); }),
      h('input', { type: 'text', placeholder: '덱·무장 검색', value: q, onchange: (e: Event) => { q = (e.target as HTMLInputElement).value; redraw(); } })),
    h('div', { class: 'grid cols-2' }, decks.slice(0, 120).map((d: any) => h('div', { class: 'panel' },
      h('div', { class: 'section-head' },
        h('div', null, d.tier ? h('span', { class: 'badge tier' }, d.tier) : null, ' ', h('b', null, d.name), ' ', h('span', { class: 'muted' }, d.originalName || '')),
        h('span', { class: 'sub' }, (d.seasons || []).join(', '))),
      h('div', { class: 'sub', style: { marginBottom: '6px' } }, ko(`${d.purpose || ''} · ${d.style || ''} · ${d.formation || ''}`)),
      h('table', null, h('tbody', null, d.members.map((m: any) => h('tr', null,
        h('td', { style: { width: '90px', color: krReleased(m.generalId) ? 'var(--text)' : 'var(--text-mute)' } }, gName(m.generalId)),
        h('td', null, (m.tactics || []).map((t: string) => h('span', { class: 'badge' }, tName(t))),
          h('div', { class: 'muted', style: { fontSize: '12.5px' } }, ko(`병법 ${(m.manuals || []).join(' · ')} · ${m.role || ''}`))))))),
      d.formationNote ? h('div', { class: 'dim', style: { fontSize: '13px', marginTop: '6px' } }, ko(d.formationNote)) : null,
    ))),
  );
}
