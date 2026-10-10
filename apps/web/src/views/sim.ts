// 시뮬레이션 — 티어덱/내가 짠 덱 아무 조합이나 붙여 본다. 한 판 전보에는 감사 결과를 붙인다.
import { h, mount, select, lv, pct, fmt } from '../dom.ts';
import { app, generalById, designLink } from '../state.ts';
import { armies, armyName, rowsOf, defaultRows } from './armies.ts';
import { showSkill, showManual } from './detail.ts';
import { winBar, troopLines, hBars, SIDE_A, SIDE_B } from '../charts.ts';
import { call } from '../sim-client.ts';
import type { DeckSpec, MonteCarloResult } from '@cheonha/engine';

// 덱 고르기: 내 부대(부대 편성) · 티어덱 · 다른 화면에서 보낸 덱(custom)
type Choice = { kind: 'army' | 'tier' | 'custom'; id: string; spec?: DeckSpec };
const choice: Record<'A' | 'B', Choice> = { A: { kind: 'tier', id: '' }, B: { kind: 'tier', id: '' } };
let runs = 20;
let seed = '';
let mcResult: MonteCarloResult | null = null;
let battleList: any[] | null = null;
let battle: any = null;
let busy = '';
let progress = 0;
let error = '';

/** 추천 등에서 만든 덱을 그대로 시뮬에 넣는다 */
export function setSimCustom(side: 'A' | 'B', spec: DeckSpec) {
  choice[side] = { kind: 'custom', id: 'custom', spec };
  mcResult = null; battle = null; battleList = null;
}
export function setSimDeck(side: 'A' | 'B', d: { tierId: string }) {
  choice[side] = { kind: 'tier', id: d.tierId };
  mcResult = null; battle = null; battleList = null;
}

function specOf(side: 'A' | 'B'): DeckSpec {
  const c = choice[side];
  if (c.kind === 'custom' && c.spec) return c.spec;
  if (c.kind === 'army') {
    const list = armies();
    const a = list.find(x => x.id === c.id);
    if (a) {
      const rows = rowsOf(a);
      return { name: armyName(a, list.indexOf(a)), formation: a.formation || '기형진',
        units: a.units.map((u, i) => ({ u, i })).filter(x => x.u.generalId).map(({ u, i }) => ({ generalId: u.generalId, skillIds: u.skillIds.filter(Boolean), manualId: u.manualId, position: rows[i] })) };
    }
  }
  const td = app.bundle.tierDecks.find(t => t.id === c.id) || app.bundle.tierDecks[side === 'A' ? 0 : 1];
  return { name: `${td.tier} ${td.name}`, formation: td.formation || '기형진', units: td.units.map(u => ({ generalId: u.generalId, skillIds: u.skillIds.filter(x => !x.startsWith('?')), manualId: u.manualId, ...(u.unitType ? { unitType: u.unitType } : {}) })) };
}
const deckName = (side: 'A' | 'B') => specOf(side).name || side;

const usableManual = (m: { status?: string }) => m.status === 'ok' || m.status === 'approx';
/** 덱 표시용: 실제로 장착되는 금병법 */
function manualOf(generalId: string, manualId?: string) {
  const ms = generalById(generalId)?.manuals || [];
  if (manualId === 'none') return null;
  const m = manualId ? ms.find(x => x.id === manualId) : ms.find(usableManual);
  return m && usableManual(m) ? m : null;
}

/** 예전 시뮬처럼 양쪽 부대를 나란히: 무장 이름·열·능력치·전법(누르면 상세) */
function sideCard(side: 'A' | 'B') {
  const sp = specOf(side);
  const rows = sp.units.some(u => u.position) ? sp.units.map(u => u.position) : defaultRows(sp.formation || '기형진', sp.units);
  return h('div', { class: `side-card ${side === 'B' ? 'b' : ''}` },
    h('div', { class: 'side-title' }, `${side === 'A' ? '아군' : '적군'} — ${sp.name}`, h('span', { class: 'sub' }, ` · ${sp.formation}`)),
    sp.units.map((u, i) => {
      const g = generalById(u.generalId);
      if (!g) return null;
      const m = manualOf(u.generalId, u.manualId);
      const skill = (id: string) => { const x = app.bundle.skills.find(s => s.id === id); return x ? h('a', { href: 'javascript:void 0', class: 'skill-link', onclick: () => showSkill(id) }, `【${x.name.ko}】`) : null; };
      return h('div', { class: 'side-unit' },
        h('div', null, h('span', { class: 'gen-name' }, `[${g.name.ko}]`), h('span', { class: 'sub' }, ` ${rows[i] === 'back' ? '후열' : '전열'}`)),
        h('div', { class: 'sub' }, `무 ${g.stats['무력']} · 지 ${g.stats['지력']} · 통 ${g.stats['통솔']} · 선 ${g.stats['선공']}`),
        h('div', { class: 'skill-line' }, [g.uniqueSkillId, ...u.skillIds].map(skill).filter(Boolean).flatMap((x, k) => k ? [' · ', x] : [x]),
          m ? [' · ', h('a', { href: 'javascript:void 0', class: 'skill-link manual', onclick: () => showManual(u.generalId, m.id!) }, `〈${m.name}〉`)] : null));
    }));
}

function chooser(side: 'A' | 'B', redraw: () => void) {
  const list = armies();
  const tiers = app.bundle.tierDecks;
  const c = choice[side];
  if (!c.id) {
    if (side === 'A' && list.length) choice.A = { kind: 'army', id: list[0].id };
    else choice[side] = { kind: 'tier', id: tiers[side === 'A' ? 0 : 1]?.id || '' };
  }
  const opts = [
    ...(choice[side].kind === 'custom' ? [{ value: 'custom:custom', label: `보낸 덱 — ${choice[side].spec?.name || ''}` }] : []),
    ...list.map((a, i) => ({ value: `army:${a.id}`, label: `내 부대 · ${armyName(a, i)}` })),
    ...tiers.map(t => ({ value: `tier:${t.id}`, label: `티어덱 · ${t.season} ${t.tier} ${t.name}` })),
  ];
  return select(opts, `${choice[side].kind}:${choice[side].id}`, v => {
    const [kind, id] = v.split(':') as [Choice['kind'], string];
    choice[side] = kind === 'custom' ? choice[side] : { kind, id };
    mcResult = null; battle = null; battleList = null; redraw();
  }, { style: { width: '100%' }, 'aria-label': side === 'A' ? '내 부대' : '상대' });
}

/** 근사·미반영 효과가 섞인 결과임을 알린다 (R-007: 전보 녹화로 검증 대기) */
function approxNotice(m: MonteCarloResult) {
  const list = [...(m.approx?.A || []).map(x => ({ ...x, side: '내 덱' })), ...(m.approx?.B || []).map(x => ({ ...x, side: '상대' }))];
  if (!list.length) return h('div', { class: 'notice' }, lv('pass', '검증된 효과만'), ' 이 대전의 무장·전법·금병법은 모두 원문대로 구현된 효과입니다.');
  return h('details', { class: 'notice' },
    h('summary', null, lv('warn', `근사 효과 ${list.length}개 포함`), ' — 전보 녹화로 검증 대기 중인 효과가 결과에 섞여 있습니다'),
    h('div', { style: { marginTop: '6px' } }, list.map(x => h('div', { style: { fontSize: '13px' } }, h('span', { class: 'badge' }, x.side), h('b', null, `${x.owner} ${x.name}`), ` (${x.kind}) `, h('span', { class: 'muted' }, x.note)))));
}

/** 잠정·결정 필요 규정으로 돈 결과임을 알린다 (기획 플랫폼 OV3) */
function provisionalNotice() {
  const d = (app.bundle as any).design;
  if (!d?.provisional?.length) return null;
  return h('details', { class: 'notice' },
    h('summary', null, lv('warn', `잠정 규정 ${d.provisional.length}개 사용`), ' — 기획 플랫폼에서 아직 확정되지 않은 공용 규정은 잠정값으로 계산합니다'),
    h('div', { style: { marginTop: '6px', fontSize: '13px' } }, d.provisional.map((x: any) => h('div', null, h('span', { class: 'badge' }, x.id), ` ${x.title}`, x.status === '결정필요' ? h('span', { class: 'muted' }, ' (결정 필요)') : null)),
      h('a', { href: designLink('home'), target: '_blank' }, '설계서에서 보기')));
}

function resultView() {
  if (!mcResult) return null;
  const m = mcResult;
  const contrib = (list: MonteCarloResult['contribution'], color: string) => hBars(list.slice(0, 8).map(c => ({ label: c.name, value: c.pct, display: `${pct(c.pct)} · 판당 ${c.procsPerRun.toFixed(1)}회`, color })), { max: Math.max(...list.slice(0, 8).map(c => c.pct), 0.01), labelWidth: 130, width: 560 });
  return h('div', { class: 'grid' },
    h('div', { class: 'tiles' },
      h('div', { class: 'tile' }, h('div', { class: 'k' }, '내 덱 승률'), h('div', { class: 'v', style: { color: SIDE_A } }, pct(m.winRateA)), h('div', { class: 'sub' }, `${fmt(m.winA)}승 ${fmt(m.winB)}패${m.draw ? ` ${fmt(m.draw)}무` : ''}`)),
      h('div', { class: 'tile' }, h('div', { class: 'k' }, '상대 승률'), h('div', { class: 'v', style: { color: SIDE_B } }, pct(m.winRateB))),
      h('div', { class: 'tile' }, h('div', { class: 'k' }, '평균 턴'), h('div', { class: 'v' }, m.avgTurns.toFixed(2), h('small', null, ' 턴')),
        m.avgRounds && m.avgRounds > 1.001 ? h('div', { class: 'sub', title: '8턴 무승부면 생존 무장끼리 다시 싸운다(R-009)' }, `판당 교전 ${m.avgRounds.toFixed(2)}차`) : null),
      h('div', { class: 'tile' }, h('div', { class: 'k' }, '시뮬'), h('div', { class: 'v' }, fmt(m.runs), h('small', null, ` 판 · 시드 ${m.seed}`)))),
    approxNotice(m),
    provisionalNotice(),
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
  // 게임 전보 글씨 색: 아군 이름 파랑 · 적군 이름 빨강 · 손실 병력 빨강 · 회복 병력 초록 · 증감 수치·스택·회심/묘책 배율 노랑
  const sideOfName = new Map<string, string>();
  (battle.units || []).forEach((u: any) => sideOfName.set(u.name, sideOfName.has(u.name) && sideOfName.get(u.name) !== u.side ? 'both' : u.side));
  const nameSide = (name: string, i: number) => snaps[i]?.[name]?.side || sideOfName.get(name) || '';
  const colorNums = (t: string) => t.split(/(병력이 [\d,]+(?=\()|병력을 [\d,]+(?=\()|[\d.]+%?(?=\([^)]*\)\s*(?:증가|감소|중첩))|\d+(?=스택)|\d+(?:\.\d+)?%(?=입니다))/).map((part, k) => {
    if (k % 2 === 0) return part;
    if (part.startsWith('병력이 ')) return ['병력이 ', h('span', { class: 'lg-dmg' }, part.slice(4))];
    if (part.startsWith('병력을 ')) return ['병력을 ', h('span', { class: 'lg-heal' }, part.slice(4))];
    return h('span', { class: 'lg-num' }, part);
  });
  const lineEl = (l: string, i: number) => {
    const text = l.replace(/^\d+턴: /, '');
    return text.split(/(\[[^\]]+\])/).map(part => {
      const m = part.match(/^\[([^\]]+)\]$/);
      if (!m) return colorNums(part);
      const side = nameSide(m[1], i);
      const cls = side === 'A' ? 'lg-ally' : side === 'B' ? 'lg-enemy' : '';
      return snaps[i]?.[m[1]] ? h('a', { class: `snap-name ${cls}`, href: 'javascript:void 0', onclick: (ev: MouseEvent) => { ev.stopPropagation(); showSnap(m[1], i, ev); } }, part) : h('span', { class: cls }, part);
    });
  };
  // 게임처럼 왼쪽에 준비 턴·1~8턴 — 누르면 그 턴 전보로 이동
  const turnMarks = rows.filter(({ l }) => /── \d+번째 턴 ──|── 포진 ──/.test(l)).map(({ l, i }) => ({ i, label: /포진/.test(l) ? '준비' : `${l.match(/(\d+)번째 턴/)![1]}턴` }));
  const goTurn = (i: number) => {
    const box = document.getElementById('battle-log'), el = document.getElementById(`turn-${i}`);
    if (box && el) box.scrollTo({ top: el.offsetTop - box.offsetTop, behavior: 'smooth' });
    document.querySelectorAll('.turn-nav button').forEach(b => b.classList.toggle('on', b.getAttribute('data-i') === String(i)));
  };
  const a = battle.audit;
  const bad = a.skills.filter((s: any) => s.worst === 'fail' || s.worst === 'warn');
  return h('div', { class: 'grid cols-2' },
    h('div', { class: 'panel' },
      h('div', { class: 'section-head' }, h('h3', { style: { fontSize: '15px' } }, `전보 — ${battle.winner === 'A' ? '내 덱 승' : battle.winner === 'B' ? '상대 승' : '무승부'} (${battle.turns}턴${(battle as any).rounds > 1 ? ` · ${(battle as any).rounds}차 교전` : ''})`), h('span', { class: 'sub' }, `시드 ${battle.seed}`)),
      snaps.length ? h('div', { class: 'sub', style: { marginBottom: '6px' } }, '전보의 무장 이름을 누르면 그 시점의 툴팁이 게임처럼 뜹니다.') : null,
      h('div', { class: 'log-wrap' },
        h('div', { class: 'turn-nav' }, turnMarks.map(t => h('button', { 'data-i': String(t.i), onclick: () => goTurn(t.i) }, t.label))),
        h('div', { class: 'log', id: 'battle-log' }, rows.map(({ l, i }) => /── \d+번째 턴 ──|── 포진 ──/.test(l)
          ? h('div', { class: 'turn', id: `turn-${i}` }, /포진/.test(l) ? '◇ 준비 턴 ◇' : `◇ ${l.match(/(\d+)번째 턴/)![1]}번째 턴 ◇`)
          : h('div', null, lineEl(l, i)))))),
    h('div', { class: 'panel' },
      h('h3', { style: { fontSize: '15px', marginBottom: '8px' } }, '이 전투의 규칙 감사'),
      h('table', null, h('tbody', null, a.engineRules.map((r: any) => h('tr', null, h('td', { style: { width: '74px' } }, lv(r.level)), h('td', null, h('div', null, r.title), h('div', { class: 'dim', style: { fontSize: '12.5px' } }, r.message), r.evidence?.length ? h('div', { class: 'muted', style: { fontSize: '12px' } }, r.evidence.slice(0, 3).join(' / ')) : null))))),
      h('h3', { style: { fontSize: '15px', margin: '12px 0 6px' } }, `발동한 전법 ${a.skills.length}개`),
      bad.length ? h('div', null, bad.map((s: any) => h('div', { style: { marginBottom: '6px' } }, lv(s.worst), ' ', h('a', { href: designLink('skills'), target: '_blank' }, s.name), h('div', { class: 'dim', style: { fontSize: '12.5px' } }, s.checks.filter((c: any) => c.level !== 'pass').map((c: any) => `${c.title}: ${c.message}`).join(' / ')))))
        : h('div', { class: 'dim' }, '원문 시점·효과와 어긋난 전법 없음'),
      h('div', { class: 'muted', style: { fontSize: '12px', marginTop: '6px' } }, a.skills.map((s: any) => `${s.name}×${s.fired}`).join(' · '))),
  );
}

function battleListView(run: (kind: 'battle', seed?: string) => void) {
  if (!battleList) return null;
  return h('div', { class: 'panel' },
    h('div', { class: 'section-head' }, h('h3', { style: { fontSize: '15px' } }, `전투 목록 — ${battleList.length}판`), h('span', { class: 'sub' }, '누르면 그 판의 전보를 봅니다')),
    h('div', { class: 'table-wrap' }, h('table', null,
      h('thead', null, h('tr', null, ['판', '결과', '종료 턴', '최종 병력(아군/적군)'].map(x => h('th', null, x)))),
      h('tbody', null, battleList.map(r => h('tr', { class: `click-row ${battle?.seed === r.seed ? 'sel' : ''}`, onclick: () => run('battle', r.seed) },
        h('td', { class: 'num' }, r.no),
        h('td', null, h('span', { class: `lv ${r.winner === 'A' ? 'pass' : r.winner === 'B' ? 'fail' : 'skip'}` }, r.winner === 'A' ? '승' : r.winner === 'B' ? '패' : '무')),
        h('td', { class: 'num' }, `${r.turns}턴${r.rounds > 1 ? ` · ${r.rounds}차` : ''}`),
        h('td', { class: 'num' }, `${fmt(r.troopsA)} / ${fmt(r.troopsB)}`)))))));
}

export function renderSim(root: HTMLElement, params?: URLSearchParams) {
  const armyParam = params?.get('army');
  if (armyParam && armies().some(a => a.id === armyParam)) { choice.A = { kind: 'army', id: armyParam }; history.replaceState(null, '', '#/sim'); mcResult = null; battle = null; battleList = null; }
  const redraw = () => renderSim(root);
  const run = async (kind: 'mc' | 'battle', battleSeed?: string) => {
    error = ''; busy = kind; progress = 0; redraw();
    const s = seed || String(Date.now() % 1e6);
    try {
      if (kind === 'mc') {
        mcResult = await call<MonteCarloResult>({ type: 'mc', a: specOf('A'), b: specOf('B'), runs, seed: s }, (d, t) => { progress = d / t; const bar = root.querySelector('.progress > div') as HTMLElement; if (bar) bar.style.width = `${progress * 100}%`; });
        battleList = await call<any[]>({ type: 'list', a: specOf('A'), b: specOf('B'), count: Math.min(runs, 20), seed: s });
        battle = null;
      } else {
        const bs = battleSeed || s;
        battle = { ...(await call({ type: 'battle', a: specOf('A'), b: specOf('B'), seed: bs })), seed: bs };
      }
    } catch (e: any) { error = e.message; }
    busy = ''; redraw();
    if (kind === 'battle') root.querySelector('.battle-anchor')?.scrollIntoView({ behavior: 'smooth' });
  };
  mount(root,
    h('div', { class: 'section-head' }, h('h2', null, '시뮬레이션'), h('a', { class: 'sub', href: designLink('home'), target: '_blank' }, '계산 규칙은 설계서에서')),
    h('div', { class: 'panel sim-setup' },
      h('div', { class: 'form-row' }, h('label', null, '내 부대'), chooser('A', redraw)),
      h('div', { class: 'form-row' }, h('label', null, '상대'), chooser('B', redraw)),
      h('div', { class: 'form-row' }, h('label', null, '시뮬 횟수'),
        h('div', { class: 'seg' }, [10, 20, 50, 100, 500].map(n => h('button', { class: runs === n ? 'on' : '', onclick: () => { runs = n; redraw(); } }, n)))),
      h('details', { class: 'sub' }, h('summary', null, '고급 설정'),
        h('label', null, '시드 ', h('input', { type: 'text', placeholder: '비우면 무작위', value: seed, style: { width: '140px' }, onchange: (e: Event) => { seed = (e.target as HTMLInputElement).value.trim(); } }))),
      h('button', { class: 'btn primary run-btn', disabled: !!busy, onclick: () => run('mc') }, busy === 'mc' ? '계산 중…' : '시뮬 실행'),
      busy === 'mc' ? h('div', { class: 'progress', style: { marginTop: '10px' } }, h('div', { style: { width: `${progress * 100}%` } })) : null,
      h('div', { class: 'grid cols-2', style: { marginTop: '14px' } }, sideCard('A'), sideCard('B'))),
    error ? h('div', { class: 'notice', style: { color: 'var(--fail)' } }, error) : null,
    resultView(),
    battleListView(run as any),
    h('div', { class: 'battle-anchor' }),
    busy === 'battle' ? h('div', { class: 'notice' }, '전보 불러오는 중…') : null,
    battle ? h('div', { style: { marginTop: '12px' } }, battleView()) : null,
  );
}
