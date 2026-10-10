import './styles.css';
import { h, select } from './dom.ts';
import { app, loadData, syncUserFromCloud } from './state.ts';
import { renderTierDecks } from './views/tierdecks.ts';
import { renderRoster } from './views/roster.ts';
import { renderSim } from './views/sim.ts';
import { renderRecommend } from './views/recommend.ts';
import { renderArmies } from './views/armies.ts';

// 시뮬 사이트: 예전 시뮬(v1.12b) 화면 순서 — 보유 관리·부대 편성·티어덱·덱 추천·시뮬레이션 (도감·감사·게시판은 설계서 — site.designUrl)
const TABS: Array<[string, string, (root: HTMLElement, p: URLSearchParams) => void]> = [
  ['roster', '보유 관리', renderRoster],
  ['armies', '부대 편성', renderArmies],
  ['tier', '티어덱', renderTierDecks],
  ['recommend', '덱 추천', renderRecommend],
  ['sim', '시뮬레이션', renderSim],
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
  const design = (b as any).design, site = (b as any).site || {};
  document.getElementById('version-line')!.replaceChildren(
    `데이터 ${b.dataVersion} · 무장 ${b.generals.length} · 전법 ${b.skills.length}`,
    design ? ` · 규정 ${design.total}개(잠정 ${design.provisional.length}) ` : ' ',
    site.designUrl ? h('a', { href: site.designUrl, target: '_blank', rel: 'noopener' }, '설계서 보기') : '');
  const sel = document.getElementById('season-select')!;
  sel.replaceWith(select(b.seasons.map(s => ({ value: s.id, label: `${s.label}${s.status === 'live' ? ' (현재)' : s.status === 'upcoming' ? ' (예정)' : ''}` })), app.season, v => { app.season = v; route(); }, { id: 'season-select' }));
  window.addEventListener('hashchange', route);
  route();
  // 보유 정보는 아티팩트 데이터베이스에서 불러온다 (휴대폰에서 다시 열어도 유지)
  syncUserFromCloud().then(changed => { if (changed) route(); });
}
main();
