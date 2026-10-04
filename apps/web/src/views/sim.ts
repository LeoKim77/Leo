// 시뮬레이션 — 티어덱/내가 짠 덱 아무 조합이나 붙여 본다. 한 판 전보에는 감사 결과를 붙인다.
import { h, mount, select, lv, pct, fmt } from '../dom.ts';
import { app, inSeason, generalById, loadUser, saveUser } from '../state.ts';
import { winBar, troopLines, hBars, SIDE_A, SIDE_B } from '../charts.ts';
import { call } from '../sim-client.ts';
import type { DeckSpec, MonteCarloResult } from '@cheonha/engine';

interface SideState { mode: 'tier' | 'custom'; tierId: string; formation: string; units: Array<{ generalId: string; skillIds: [string, string]; manualId?: string; unitType?: string }> }
const blankUnits = () => [0, 1, 2].map(() => ({ generalId: '', skillIds: ['', ''] as [string, string], manualId: undefined as string | undefined }));
const sides: Record<'A' | 'B', SideState> = {
  A: { mode: 'tier', tierId: '', formation: '기형진', units: blankUnits() },
  B: { mode: 'tier', tierId: '', formation: '기형진', units: blankUnits() },
};
let runs = 500;
let seed = '';
let mcResult: MonteCarloResult | null = null;
let battle: any = null;
let busy = '';
let progress = 0;
let error = '';

/** 추천 등에서 만든 덱을 직접 편성 칸에 넣는다 */
export function setSimCustom(side: 'A' | 'B', spec: DeckSpec) {
  const s = sides[side];
  s.mode = 'custom';
  s.formation = spec.formation || s.formation;
  s.units = blankUnits();
  spec.units.forEach((u, i) => { s.units[i] = { generalId: u.generalId, skillIds: [u.skillIds[0] || '', u.skillIds[1] || ''], manualId: u.manualId }; });
  mcResult = null; battle = null;
}

export function setSimDeck(side: 'A' | 'B', d: { tierId: string }) {
  sides[side].mode = 'tier';
  sides[side].tierId = d.tierId;
  const td = app.bundle.tierDecks.find(t => t.id === d.tierId);
  if (td?.formation) sides[side].formation = td.formation;   // 시트에 적힌 진형
  mcResult = null; battle = null;
}

function specOf(side: 'A' | 'B'): DeckSpec {
  const s = sides[side];
  if (s.mode === 'tier') {
    const td = app.bundle.tierDecks.find(t => t.id === s.tierId) || app.bundle.tierDecks[side === 'A' ? 0 : 1];
    return { name: `${td.tier} ${td.name}`, formation: s.formation, units: td.units.map(u => ({ generalId: u.generalId, skillIds: u.skillIds.filter(x => !x.startsWith('?')), manualId: u.manualId, ...(u.unitType ? { unitType: u.unitType } : {}) })) };
  }
  return { name: '직접 편성', formation: s.formation, units: s.units.filter(u => u.generalId).map(u => ({ generalId: u.generalId, skillIds: u.skillIds.filter(Boolean), manualId: u.manualId, ...(u.unitType ? { unitType: u.unitType } : {}) })) };
}
const deckName = (side: 'A' | 'B') => specOf(side).name || side;

const usableManual = (m: { status?: string }) => m.status === 'ok' || m.status === 'approx';
/** 덱 표시용: 실제로 장착되는 금병법 이름 */
function manualLabel(generalId: string, manualId?: string) {
  const ms = generalById(generalId)?.manuals || [];
  if (manualId === 'none') return '';
  const m = manualId ? ms.find(x => x.id === manualId) : ms.find(usableManual);
  return m && usableManual(m) ? `〈${m.name}〉` : '';
}
function manualSelect(u: { generalId: string; manualId?: string }) {
  const ms = generalById(u.generalId)?.manuals || [];
  const opts = [{ value: 'none', label: '금병법 없음' }, ...ms.map(m => ({ value: m.id!, label: `〈${m.name}〉${m.status === 'approx' ? ' 근사' : m.status === 'unsupported' ? ' 미지원' : m.status === 'missing' ? ' 정의없음' : ''}` }))];
  const cur = u.manualId || ms.find(usableManual)?.id || 'none';
  return select(opts, cur, v => { u.manualId = v; }, { title: '금병법' });
}

function deckEditor(side: 'A' | 'B', redraw: () => void) {
  const s = sides[side];
  const b = app.bundle;
  const tierOpts = b.tierDecks.map(t => ({ value: t.id, label: `${t.season} ${t.tier} ${t.name}` }));
  if (!s.tierId) s.tierId = b.tierDecks[side === 'A' ? 0 : 1]?.id || '';
  const genOpts = [{ value: '', label: '— 무장 —' }, ...b.generals.filter(g => inSeason(g.season)).sort((x, y) => x.name.ko.localeCompare(y.name.ko, 'ko')).map(g => ({ value: g.id, label: `${g.name.ko} (${g.faction}·${g.unitType})` }))];
  const skillOpts = [{ value: '', label: '— 전법 —' }, ...b.skills.filter(x => !x.isUnique && inSeason(x.season)).sort((x, y) => x.name.ko.localeCompare(y.name.ko, 'ko')).map(x => ({ value: x.id, label: `${x.name.ko} (${x.kind}${x.engine ? '' : ' · 미구현'})` }))];
  const user = loadUser();
  return h('div', { class: `panel deck-box ${side === 'B' ? 'b' : ''}` },
    h('div', { class: 'section-head' }, h('h3', { style: { fontSize: '16px', color: side === 'A' ? SIDE_A : SIDE_B } }, side === 'A' ? '내 덱 (A)' : '상대 덱 (B)'),
      h('span', null,
        h('button', { class: `chip ${s.mode === 'tier' ? 'on' : ''}`, onclick: () => { s.mode = 'tier'; redraw(); } }, '티어덱'),
        ' ',
        h('button', { class: `chip ${s.mode === 'custom' ? 'on' : ''}`, onclick: () => { if (s.mode === 'tier') { const sp = specOf(side); s.units = blankUnits(); sp.units.forEach((u, i) => { s.units[i] = { generalId: u.generalId, skillIds: [u.skillIds[0] || '', u.skillIds[1] || ''], manualId: u.manualId, unitType: u.unitType }; }); } s.mode = 'custom'; redraw(); } }, '직접 편성'))),
    s.mode === 'tier'
      ? h('div', null, select(tierOpts, s.tierId, v => { s.tierId = v; const td = b.tierDecks.find(t => t.id === v); if (td?.formation) s.formation = td.formation; redraw(); }, { style: { width: '100%' } }),
        h('div', { class: 'sub', style: { marginTop: '6px' } }, specOf(side).units.map(u => `${generalById(u.generalId)?.name.ko}${manualLabel(u.generalId, u.manualId)}`).join(' · ')))
      : h('div', null, s.units.map((u, i) => h('div', { class: 'unit-row' },
        select(genOpts, u.generalId, v => { u.generalId = v; u.unitType = undefined; redraw(); }),
        select(skillOpts, u.skillIds[0], v => { u.skillIds[0] = v; }),
        select(skillOpts, u.skillIds[1], v => { u.skillIds[1] = v; }),
        manualSelect(u))),
        h('div', { class: 'toolbar', style: { marginTop: '4px', marginBottom: 0 } },
          h('button', { class: 'btn small', onclick: () => { const d = { ...specOf(side), id: `deck-${Date.now()}`, savedAt: new Date().toISOString() }; user.decks.push(d); saveUser(user); redraw(); } }, '내 덱으로 저장'),
          user.decks.length ? select([{ value: '', label: `저장한 덱 ${user.decks.length}개` }, ...user.decks.map(d => ({ value: d.id, label: `${d.units.map(u => generalById(u.generalId)?.name.ko).join('·')}` }))], '', v => {
            const d = user.decks.find(x => x.id === v); if (!d) return;
            s.units = blankUnits(); d.units.forEach((u, i) => { s.units[i] = { generalId: u.generalId, skillIds: [u.skillIds[0] || '', u.skillIds[1] || ''], manualId: u.manualId }; }); s.formation = d.formation || s.formation; redraw();
          }) : null)),
    h('div', { style: { marginTop: '8px' } }, h('span', { class: 'sub' }, '진형 '), select(b.formations.map(f => ({ value: f.name, label: `${f.name} — ${f.traits.join(', ')}` })), s.formation, v => { s.formation = v; })),
  );
}

/** 근사·미반영 효과가 섞인 결과임을 알린다 (R-007: 전보 녹화로 검증 대기) */
function approxNotice(m: MonteCarloResult) {
  const list = [...(m.approx?.A || []).map(x => ({ ...x, side: '내 덱' })), ...(m.approx?.B || []).map(x => ({ ...x, side: '상대' }))];
  if (!list.length) return h('div', { class: 'notice' }, lv('pass', '검증된 효과만'), ' 이 대전의 무장·전법·금병법은 모두 원문대로 구현된 효과입니다.');
  return h('details', { class: 'notice' },
    h('summary', null, lv('warn', `근사 효과 ${list.length}개 포함`), ' — 전보 녹화로 검증 대기 중인 효과가 결과에 섞여 있습니다'),
    h('div', { style: { marginTop: '6px' } }, list.map(x => h('div', { style: { fontSize: '13px' } }, h('span', { class: 'badge' }, x.side), h('b', null, `${x.owner} ${x.name}`), ` (${x.kind}) `, h('span', { class: 'muted' }, x.note)))));
}

function resultView() {
  if (!mcResult) return null;
  const m = mcResult;
  const contrib = (list: MonteCarloResult['contribution'], color: string) => hBars(list.slice(0, 8).map(c => ({ label: c.name, value: c.pct, display: `${pct(c.pct)} · 판당 ${c.procsPerRun.toFixed(1)}회`, color })), { max: Math.max(...list.slice(0, 8).map(c => c.pct), 0.01), labelWidth: 130, width: 560 });
  return h('div', { class: 'grid' },
    h('div', { class: 'tiles' },
      h('div', { class: 'tile' }, h('div', { class: 'k' }, '내 덱 승률'), h('div', { class: 'v', style: { color: SIDE_A } }, pct(m.winRateA))),
      h('div', { class: 'tile' }, h('div', { class: 'k' }, '상대 승률'), h('div', { class: 'v', style: { color: SIDE_B } }, pct(m.winRateB))),
      h('div', { class: 'tile' }, h('div', { class: 'k' }, '평균 턴'), h('div', { class: 'v' }, m.avgTurns.toFixed(2), h('small', null, ' 턴')),
        m.avgRounds && m.avgRounds > 1.001 ? h('div', { class: 'sub', title: '8턴 무승부면 생존 무장끼리 다시 싸운다(R-009)' }, `판당 교전 ${m.avgRounds.toFixed(2)}차`) : null),
      h('div', { class: 'tile' }, h('div', { class: 'k' }, '시뮬'), h('div', { class: 'v' }, fmt(m.runs), h('small', null, ` 판 · 시드 ${m.seed}`)))),
    approxNotice(m),
    h('div', { class: 'panel' }, h('h3', { style: { fontSize: '15px', marginBottom: '8px' } }, '승패'), winBar(m.winA, m.draw, m.winB, [deckName('A'), deckName('B')])),
    h('div', { class: 'panel' }, h('h3', { style: { fontSize: '15px', marginBottom: '8px' } }, '턴별 평균 병력'), troopLines(m.troopCurveAll, [deckName('A'), deckName('B')])),
    h('div', { class: 'grid cols-2' },
      h('div', { class: 'panel' }, h('h3', { style: { fontSize: '15px', marginBottom: '8px' } }, `전법 기여도 — ${deckName('A')}`), contrib(m.contribution, SIDE_A)),
      h('div', { class: 'panel' }, h('h3', { style: { fontSize: '15px', marginBottom: '8px' } }, `전법 기여도 — ${deckName('B')}`), contrib(m.contributionB, SIDE_B))),
  );
}

function battleView() {
  if (!battle) return null;
  // FEAT-016: 전보 줄마다 그 순간 무장 상태 — 이름을 누르면 게임 전보 툴팁처럼 보인다
  const rows = (battle.log as string[]).map((l, i) => ({ l, i })).filter(x => !/└\[상태\]|└\[계산\]|^\d+턴:\s+(무력|지력|\[상태이상\]|[가-힣]+ -?\d)/.test(x.l));
  const snaps: any[] = battle.lineSnaps || [];
  // 게임 전보 툴팁과 같은 모양: 누른 이름 옆에 뜨는 검은 상자, 같은 항목·같은 순서
  const approxOf = (name: string) => [...(battle.approx?.A || []), ...(battle.approx?.B || [])].filter((x: any) => x.owner === name);
  const fmt = (v: number) => (Math.round(v * 100) / 100).toFixed(2);
  const closeTip = () => document.querySelectorAll('.game-tip').forEach(e => e.remove());
  const showSnap = (name: string, i: number, ev: MouseEvent) => {
    closeTip();
    const sn = snaps[i]?.[name];
    if (!sn) return;
    const sideColor = (side: string) => (side === 'A' ? 'var(--tip-ally)' : 'var(--tip-enemy)');
    const ax = approxOf(name);
    const tipEl = h('div', { class: 'game-tip', onclick: (e: Event) => { e.stopPropagation(); closeTip(); } },
      sn.unitType ? h('div', null, `병종: ${sn.unitType}`) : null,
      ['무력', '지력', '통솔', '선공'].map((k, j) => h('div', null, `${k}: ${fmt(sn.stats[j])}`)),
      h('div', null, `현재 병력: ${sn.troops}`),
      h('div', null, `최대 병력: ${sn.maxTroops}`),
      sn.wounded ? h('div', null, `부상병: ${sn.wounded}`) : null,
      sn.dead ? h('div', null, `사망병: ${sn.dead}`) : null,
      sn.mods.map((m: any) => h('div', null, `${m[0]}: ${fmt(m[1] * 100)}%`)),
      sn.effects.map((e: any) => h('div', { style: { color: sideColor(e[3] || sn.side) } }, `[${e[0]}], ${e[1]}턴${e[2] ? '---' + e[2] : ''}`)),
      ax.length ? h('div', { class: 'game-tip-note' }, '시뮬 참고 · 근사·미반영', ax.map((x: any) => h('div', null, `${x.kind} ${x.name}`))) : null);
    document.body.appendChild(tipEl);
    const r = (ev.target as HTMLElement).getBoundingClientRect();
    const w = tipEl.offsetWidth, hgt = tipEl.offsetHeight;
    const left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
    const below = r.bottom + 6 + hgt < window.innerHeight;
    tipEl.style.left = `${left + window.scrollX}px`;
    tipEl.style.top = `${(below ? r.bottom + 6 : Math.max(8, r.top - hgt - 6)) + window.scrollY}px`;
    setTimeout(() => document.addEventListener('click', closeTip, { once: true }), 0);
  };
  const lineEl = (l: string, i: number) => {
    const text = l.replace(/^\d+턴: /, '');
    if (!snaps[i]) return text;
    return text.split(/(\[[^\]]+\])/).map(part => {
      const m = part.match(/^\[([^\]]+)\]$/);
      return m && snaps[i][m[1]] ? h('a', { class: 'snap-name', href: 'javascript:void 0', onclick: (ev: MouseEvent) => { ev.stopPropagation(); showSnap(m[1], i, ev); } }, part) : part;
    });
  };
  const a = battle.audit;
  const bad = a.skills.filter((s: any) => s.worst === 'fail' || s.worst === 'warn');
  return h('div', { class: 'grid cols-2' },
    h('div', { class: 'panel' },
      h('div', { class: 'section-head' }, h('h3', { style: { fontSize: '15px' } }, `전보 — ${battle.winner === 'A' ? '내 덱 승' : battle.winner === 'B' ? '상대 승' : '무승부'} (${battle.turns}턴${(battle as any).rounds > 1 ? ` · ${(battle as any).rounds}차 교전` : ''})`), h('span', { class: 'sub' }, `시드 ${battle.seed}`)),
      snaps.length ? h('div', { class: 'sub', style: { marginBottom: '6px' } }, '전보의 무장 이름을 누르면 그 시점의 툴팁이 게임처럼 뜹니다.') : null,
      h('div', { class: 'log' }, rows.map(({ l, i }) => /── \d+번째 턴 ──|── 포진 ──/.test(l) ? h('div', { class: 'turn' }, l.replace(/^\d+턴: /, '')) : h('div', null, lineEl(l, i))))),
    h('div', { class: 'panel' },
      h('h3', { style: { fontSize: '15px', marginBottom: '8px' } }, '이 전투의 규칙 감사'),
      h('table', null, h('tbody', null, a.engineRules.map((r: any) => h('tr', null, h('td', { style: { width: '74px' } }, lv(r.level)), h('td', null, h('div', null, r.title), h('div', { class: 'dim', style: { fontSize: '12.5px' } }, r.message), r.evidence?.length ? h('div', { class: 'muted', style: { fontSize: '12px' } }, r.evidence.slice(0, 3).join(' / ')) : null))))),
      h('h3', { style: { fontSize: '15px', margin: '12px 0 6px' } }, `발동한 전법 ${a.skills.length}개`),
      bad.length ? h('div', null, bad.map((s: any) => h('div', { style: { marginBottom: '6px' } }, lv(s.worst), ' ', h('a', { href: `#/codex?kind=skill&id=${s.id}` }, s.name), h('div', { class: 'dim', style: { fontSize: '12.5px' } }, s.checks.filter((c: any) => c.level !== 'pass').map((c: any) => `${c.title}: ${c.message}`).join(' / ')))))
        : h('div', { class: 'dim' }, '원문 시점·효과와 어긋난 전법 없음'),
      h('div', { class: 'muted', style: { fontSize: '12px', marginTop: '6px' } }, a.skills.map((s: any) => `${s.name}×${s.fired}`).join(' · '))),
  );
}

export function renderSim(root: HTMLElement) {
  const redraw = () => renderSim(root);
  const run = async (kind: 'mc' | 'battle') => {
    error = ''; busy = kind; progress = 0; redraw();
    const s = seed || String(Date.now() % 1e6);
    try {
      if (kind === 'mc') mcResult = await call<MonteCarloResult>({ type: 'mc', a: specOf('A'), b: specOf('B'), runs, seed: s }, (d, t) => { progress = d / t; const bar = root.querySelector('.progress > div') as HTMLElement; if (bar) bar.style.width = `${progress * 100}%`; });
      else battle = { ...(await call({ type: 'battle', a: specOf('A'), b: specOf('B'), seed: s })), seed: s };
    } catch (e: any) { error = e.message; }
    busy = ''; redraw();
  };
  mount(root, 
    h('div', { class: 'section-head' }, h('h2', null, '전투 시뮬레이션'), h('span', { class: 'sub' }, '엔진 v1.12b 이식 + 수정(FIX-001~005) · 기능 추가(FEAT-001~016) + 금병법 · 전보의 무장 이름을 누르면 그 순간 툴팁 · 진형(전열·후열 피격률·특성) 반영 · 병종·장비·건물 기술·일반 병법·부상병은 제외(R-011~R-016)')),
    h('div', { class: 'grid cols-2' }, deckEditor('A', redraw), deckEditor('B', redraw)),
    h('div', { class: 'toolbar', style: { marginTop: '12px' } },
      h('label', { class: 'sub' }, '판 수 ', h('input', { type: 'number', min: 20, max: 5000, step: 100, value: runs, style: { width: '90px' }, onchange: (e: Event) => { runs = Math.max(20, Math.min(5000, +(e.target as HTMLInputElement).value || 500)); } })),
      h('label', { class: 'sub' }, '시드 ', h('input', { type: 'text', placeholder: '비우면 무작위', value: seed, style: { width: '120px' }, onchange: (e: Event) => { seed = (e.target as HTMLInputElement).value.trim(); } })),
      h('button', { class: 'btn primary', disabled: !!busy, onclick: () => run('mc') }, busy === 'mc' ? '계산 중…' : '몬테카를로 실행'),
      h('button', { class: 'btn', disabled: !!busy, onclick: () => run('battle') }, busy === 'battle' ? '진행 중…' : '한 판 전보 + 감사')),
    busy === 'mc' ? h('div', { class: 'progress', style: { marginBottom: '12px' } }, h('div', { style: { width: `${progress * 100}%` } })) : null,
    error ? h('div', { class: 'notice', style: { color: 'var(--fail)' } }, error) : null,
    resultView(),
    battle ? h('div', { style: { marginTop: '12px' } }, battleView()) : null,
  );
}
