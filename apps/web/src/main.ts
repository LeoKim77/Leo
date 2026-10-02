import './styles.css';
import { h, select } from './dom.ts';
import { app, loadData } from './state.ts';
import { renderBoard } from './views/board.ts';
import { renderCodex } from './views/codex.ts';
import { renderTierDecks } from './views/tierdecks.ts';
import { renderRoster } from './views/roster.ts';
import { renderSim } from './views/sim.ts';
import { renderRecommend } from './views/recommend.ts';
import { renderAudit } from './views/audit.ts';
import { renderOverseas } from './views/overseas.ts';

const TABS: Array<[string, string, (root: HTMLElement, p: URLSearchParams) => void]> = [
  ['board', '게시판', renderBoard],
  ['codex', '도감', renderCodex],
  ['tier', '티어덱', renderTierDecks],
  ['roster', '보유', renderRoster],
  ['recommend', '덱 추천', renderRecommend],
  ['sim', '시뮬레이션', renderSim],
  ['audit', '감사', renderAudit],
  ['overseas', '해외 자료', renderOverseas],
];

function route() {
  const [path, query] = location.hash.replace(/^#\/?/, '').split('?');
  const tab = TABS.find(t => t[0] === path) || TABS[0];
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', (b as HTMLElement).dataset.tab === tab[0]));
  const view = document.getElementById('view')!;
  tab[2](view, new URLSearchParams(query || ''));
}

async function main() {
  const nav = document.getElementById('tab-nav')!;
  nav.replaceChildren(...TABS.map(([id, label]) => h('button', { class: 'tab-btn', 'data-tab': id, onclick: () => { location.hash = `#/${id}`; } }, label)));
  try {
    await loadData();
  } catch (e: any) {
    document.getElementById('view')!.replaceChildren(h('div', { class: 'empty' }, `데이터를 불러오지 못했습니다: ${e.message}. pnpm build:bundle 을 실행했는지 확인하세요.`));
    return;
  }
  const b = app.bundle;
  document.getElementById('version-line')!.textContent = `데이터 ${b.dataVersion} · 무장 ${b.generals.length} · 전법 ${b.skills.length}${app.audit ? ` · 감사 ${app.audit.generatedAt.slice(0, 10)}` : ''}`;
  const sel = document.getElementById('season-select')!;
  sel.replaceWith(select(b.seasons.map(s => ({ value: s.id, label: `${s.label}${s.status === 'live' ? ' (현재)' : s.status === 'upcoming' ? ' (예정)' : ''}` })), app.season, v => { app.season = v; route(); }, { id: 'season-select' }));
  window.addEventListener('hashchange', route);
  route();
}
main();
