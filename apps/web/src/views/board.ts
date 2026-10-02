// 업데이트 게시판 — 게임에서 확인한 정보·데이터/엔진 변경 내역 (MCP board_post 로 쌓인다)
import { h, mount } from '../dom.ts';
import { app, skillById, generalById } from '../state.ts';

const CATS = ['전체', '신규 무장', '신규 전법', '밸런스 조정', '티어덱', '전투 규칙', '데이터 수정', '엔진', '기타'];
let cat = '전체';
let seasonOnly = false;

export function renderBoard(root: HTMLElement) {
  const posts = app.bundle.changelog.filter(p => (cat === '전체' || p.category === cat) && (!seasonOnly || p.season === app.season));
  const refLink = (id: string) => {
    const s = skillById(id), g = generalById(id);
    if (s) return h('a', { href: `#/codex?kind=skill&id=${id}`, class: 'badge gold' }, s.name.ko);
    if (g) return h('a', { href: `#/codex?kind=general&id=${id}`, class: 'badge gold' }, g.name.ko);
    return h('span', { class: 'badge' }, id);
  };
  mount(root, 
    h('div', { class: 'section-head' },
      h('h2', null, '업데이트 게시판'),
      h('span', { class: 'sub' }, `${app.bundle.changelog.length}건 · Claude 에게 게임 정보를 알려주면 MCP 로 여기에 기록됩니다`)),
    h('div', { class: 'toolbar' },
      CATS.map(c => h('button', { class: `chip ${c === cat ? 'on' : ''}`, onclick: () => { cat = c; renderBoard(root); } }, c)),
      h('label', { class: 'chip' + (seasonOnly ? ' on' : '') }, h('input', { type: 'checkbox', checked: seasonOnly, style: { display: 'none' }, onchange: () => { seasonOnly = !seasonOnly; renderBoard(root); } }), `${app.season}만`)),
    posts.length ? h('div', { class: 'grid' }, posts.map(p => h('article', { class: `panel post cat-${p.category}` },
      h('div', { class: 'meta' },
        h('span', { class: 'mono' }, p.date),
        h('span', { class: 'badge gold' }, p.season),
        h('span', { class: 'badge' }, p.category),
        p.author ? h('span', { class: 'muted' }, p.author) : null),
      h('h3', null, p.title),
      h('div', { class: 'body' }, p.body),
      (p.refs?.length || p.source) ? h('div', { class: 'meta', style: { marginTop: '8px' } },
        (p.refs || []).map(refLink),
        p.source ? h('span', { class: 'muted' }, `출처: ${p.source}`) : null) : null,
    ))) : h('div', { class: 'empty' }, '게시글이 없습니다.'),
  );
}
