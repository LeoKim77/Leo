// 덱 추천 — 내 보유 무장·전법으로 1~5덱 (R-006: 전법 전체 1회, 무장 한 부대)
import { h, mount, select, lv, pct } from '../dom.ts';
import { app, loadUser, loadDecklab, generalById, skillById } from '../state.ts';
import { hBars } from '../charts.ts';
import { call } from '../sim-client.ts';
import { setSimCustom } from './sim.ts';
import type { RecommendResult, DeckPlan } from '@cheonha/recommender';

let count = 5;
let allowSub = true;
let runs = 30;
let busy = false;
let progress = 0;
let result: RecommendResult | null = null;
let error = '';

const gName = (id: string) => generalById(id)?.name.ko || id;
const sName = (id: string) => skillById(id)?.name.ko || id;

function deckCard(d: DeckPlan, i: number) {
  const g = (id: string) => generalById(id);
  return h('div', { class: 'panel' },
    h('div', { class: 'section-head' },
      h('div', null, h('span', { class: 'badge gold' }, `${i + 1}덱`), ' ', h('span', { class: 'badge tier' }, d.tier), ' ', h('b', null, d.name), ' ', h('span', { class: 'muted' }, d.season)),
      h('span', { class: 'mono' }, `충족도 ${pct(d.fidelity, 0)}`)),
    h('table', null, h('tbody', null, d.units.map(u => {
      const m = g(u.generalId)?.manuals.find(x => x.id === u.manualId);
      return h('tr', null,
        h('td', { style: { width: '84px' } }, h('b', null, gName(u.generalId)), u.generalId !== u.originalGeneralId ? h('div', { class: 'muted', style: { fontSize: '12px' } }, `원래 ${gName(u.originalGeneralId)}`) : null),
        h('td', null,
          u.skillIds.map(s => h('span', { class: `badge ${u.originalSkillIds.includes(s) ? '' : 'gold'}` }, sName(s))),
          u.missing.length ? h('span', { class: 'badge', style: { color: 'var(--fail)' } }, `빈칸: ${u.missing.join(', ')}`) : null,
          m ? h('div', { class: 'muted', style: { fontSize: '12.5px' } }, `금병법〈${m.name}〉${m.status === 'approx' ? ' (근사)' : m.status === 'unsupported' ? ' (미지원)' : ''}`) : null,
          u.subs.length ? h('div', { class: 'dim', style: { fontSize: '12.5px' } }, u.subs.map(x => `${x.slot} ${x.from} → ${x.to}: ${x.reason}`).join(' / ')) : null));
    }))),
    d.validation ? h('div', { style: { marginTop: '8px' } },
      h('div', { class: 'sub' }, `메타 덱 상대 승률 (상대당 ${d.validation.runs}판) — 평균 ${pct(d.validation.avgWinRate)}`),
      hBars(d.validation.opponents.map(o => ({ label: o.name, value: o.winRate, display: pct(o.winRate), color: 'var(--side-a)' })), { max: 1, labelWidth: 110, width: 340 })) : null,
    h('div', { style: { marginTop: '8px' } },
      h('button', { class: 'btn small', onclick: () => { setSimCustom('A', { name: `추천 ${d.name}`, formation: '기형진', units: d.units.map(u => ({ generalId: u.generalId, skillIds: u.skillIds, manualId: u.manualId })) }); location.hash = '#/sim'; } }, '시뮬레이션으로 보내기')));
}

export function renderRecommend(root: HTMLElement) {
  const user = loadUser();
  const redraw = () => renderRecommend(root);
  const run = async () => {
    busy = true; error = ''; progress = 0; redraw();
    try {
      const dl = await loadDecklab().catch(() => null);
      const alternatives = dl?.tacticAlternatives || [];
      result = await call<RecommendResult>({ type: 'recommend', owned: { generals: user.ownedGenerals, skills: user.ownedSkills }, count, allowGeneralSub: allowSub, alternatives, validateRuns: runs },
        (d, t) => { progress = d / t; const bar = root.querySelector('.progress > div') as HTMLElement; if (bar) bar.style.width = `${progress * 100}%`; });
    } catch (e: any) { error = e.message; }
    busy = false; redraw();
  };
  const noRoster = !user.ownedGenerals.length;
  mount(root,
    h('div', { class: 'section-head' }, h('h2', null, '덱 추천'), h('span', { class: 'sub' }, `보유 무장 ${user.ownedGenerals.length} · 전법 ${user.ownedSkills.length} · 티어덱 ${app.bundle.tierDecks.length}개 기준`)),
    h('div', { class: 'notice' }, '티어덱을 기준으로 보유 카드를 채우고, 없는 카드는 비슷한 보유 카드로 대체합니다. 전법은 전체 부대를 통틀어 1번만(R-006), 무장도 한 부대에만 씁니다. 상위 후보 조합을 메타 덱(상위 티어 3개)과 붙여 보고 "티어 충족도 + 실제 승률"이 가장 높은 조합을 고릅니다. 스탯 배분·세팅 병법은 반영하지 않습니다.'),
    noRoster ? h('div', { class: 'notice', style: { color: 'var(--warn)' } }, '보유 탭에서 가진 무장·전법을 먼저 체크하세요.') : null,
    h('div', { class: 'toolbar' },
      h('label', { class: 'sub' }, '덱 수 ', select(['1', '2', '3', '4', '5'], String(count), v => { count = +v; })),
      h('label', { class: 'chip' + (allowSub ? ' on' : '') }, h('input', { type: 'checkbox', checked: allowSub, style: { display: 'none' }, onchange: () => { allowSub = !allowSub; redraw(); } }), '무장 대체 허용'),
      h('label', { class: 'sub' }, '검증 판 수 ', select([{ value: '0', label: '검증 안 함(빠름)' }, { value: '20', label: '20판' }, { value: '30', label: '30판' }, { value: '60', label: '60판(정밀)' }], String(runs), v => { runs = +v; })),
      h('button', { class: 'btn primary', disabled: busy || noRoster, onclick: run }, busy ? '추천 계산 중…' : '추천 받기')),
    busy ? h('div', { class: 'progress', style: { marginBottom: '12px' } }, h('div', { style: { width: `${progress * 100}%` } })) : null,
    error ? h('div', { class: 'notice', style: { color: 'var(--fail)' } }, error) : null,
    result ? h('div', null,
      result.unusedNotes.map(n => h('div', { class: 'notice' }, lv('warn', '안내'), ' ', n)),
      h('div', { class: 'grid cols-2' }, result.decks.map(deckCard))) : null,
  );
}
