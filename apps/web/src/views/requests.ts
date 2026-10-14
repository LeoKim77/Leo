// 검증 요청 (OPS5·OPS6) — 설계서의 녹화 안내에서 나온 공개본(requests.json)을 보여 주고 녹화 링크를 받는다.
//   공개본에는 '무엇을 녹화할지'만 있다(엔진 공식·계수 없음, OPS15). 제출은 /api/submit (공개 서비스에서만 열림).
import { h, mount } from '../dom.ts';

let data: any = null;
let loadErr = '';
const sent: Record<number, string> = {};

async function load() {
  const el = document.getElementById('cheonha-requests');
  if (el?.textContent) { data = JSON.parse(el.textContent); return; }
  const r = await fetch('./data/requests.json');
  if (!r.ok) throw new Error(String(r.status));
  data = await r.json();
}

function submitForm(no: number) {
  const url = h('input', { type: 'url', placeholder: 'https://drive.google.com/…', 'aria-label': `${no}판 드라이브 링크`, style: { flex: '1 1 260px', minWidth: '0' } }) as HTMLInputElement;
  const memo = h('input', { type: 'text', placeholder: '메모 (선택) — 몇 판 녹화했는지 등', 'aria-label': '메모', style: { flex: '1 1 200px', minWidth: '0' } }) as HTMLInputElement;
  const msg = h('div', { class: 'sub', style: { marginTop: '6px' } }, sent[no] || '');
  const btn = h('button', { class: 'btn primary small' }, '제출') as HTMLButtonElement;
  btn.onclick = async () => {
    if (!__SERVER_ENGINE__) { msg.textContent = '제출은 공개 서비스에서 열립니다. 지금은 녹화 링크를 운영자에게 직접 보내 주세요.'; return; }
    btn.disabled = true; msg.textContent = '보내는 중…';
    try {
      const r = await fetch('/api/submit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ deck: no, url: url.value.trim(), memo: memo.value }) });
      const b = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(b.error || `제출 실패 (${r.status})`);
      sent[no] = `접수됨 (${b.id}) — 운영자 승인 뒤 분석합니다. 이 판에 ${b.left}건 더 낼 수 있습니다.`;
      msg.textContent = sent[no]; url.value = ''; memo.value = '';
    } catch (e: any) { msg.textContent = e.message; }
    btn.disabled = false;
  };
  return h('div', { class: 'panel', style: { background: 'var(--panel-2)' } },
    h('div', { style: { fontSize: '13.5px', marginBottom: '6px' } }, '녹화 링크 제출'),
    h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } }, url, memo, btn), msg);
}

function deckCard(d: any, open: boolean) {
  return h('details', { class: 'panel', open: open ? true : null, style: { marginBottom: '10px' } },
    h('summary', { style: { cursor: 'pointer' } },
      h('b', null, `${d.no}판`), ' ', d.units.map((u: any) => u.name).join(' · '),
      h('span', { class: 'badge gold', style: { marginLeft: '8px' } }, `보상 ${d.reward[0]}~${d.reward[1]}P`),
      h('span', { class: 'sub' }, ` · 확인 ${d.checks.length}건`)),
    h('div', { style: { marginTop: '10px', display: 'grid', gap: '10px' } },
      h('div', { class: 'sub' }, `${d.formation} · 상대: ${d.opponent} · 권장 ${d.runs}판`),
      h('div', { class: 'table-wrap' }, h('table', null,
        h('thead', null, h('tr', null, ['무장', '고유 전법', '전법', '금병법'].map(x => h('th', null, x)))),
        h('tbody', null, d.units.map((u: any) => h('tr', null, h('td', null, h('b', null, u.name)), h('td', null, u.unique),
          h('td', null, u.skills.length ? u.skills.join(' · ') : h('span', { class: 'muted' }, '자유')), h('td', null, u.manual ? `〈${u.manual}〉` : h('span', { class: 'muted' }, '자유'))))))),
      d.before.length ? h('div', null, h('div', { style: { fontWeight: '600', marginBottom: '4px' } }, '출전 전 화면 (1~2초씩 멈춰 녹화)'), h('ul', null, d.before.map((x: string) => h('li', null, x)))) : null,
      h('div', null, h('div', { style: { fontWeight: '600', marginBottom: '4px' } }, `전투에서 찍을 장면 ${d.checks.length}건`), h('ul', null, d.checks.map((x: string) => h('li', null, x)))),
      submitForm(d.no)));
}

export function renderRequests(root: HTMLElement) {
  if (!data && !loadErr) {
    mount(root, h('div', { class: 'empty' }, '불러오는 중…'));
    load().then(() => renderRequests(root)).catch(e => { loadErr = e.message; renderRequests(root); });
    return;
  }
  if (!data) { mount(root, h('div', { class: 'empty' }, '검증 요청을 불러오지 못했습니다.')); return; }
  mount(root,
    h('div', { class: 'section-head' }, h('h2', null, '검증 요청'), h('span', { class: 'sub' }, `녹화 ${data.decks.length}판 · 화면만 ${data.screens.length}건 · ${data.generatedAt}`)),
    h('div', { class: 'notice' }, '시뮬을 실제 게임과 똑같이 맞추려고 녹화를 부탁드립니다. 아래 편성 그대로 전투를 녹화해 구글 드라이브 링크를 제출하면, 분석해서 시뮬에 반영하고 기여도에 따라 포인트를 드립니다. 전설 무장·전법이 많은 판부터 먼저.'),
    h('div', { class: 'grid cols-2', style: { marginBottom: '12px' } },
      h('div', { class: 'panel' }, h('h3', { style: { fontSize: '15px', marginBottom: '6px' } }, '녹화 방법 (모든 판 공통)'), h('ol', null, data.howTo.map((x: string) => h('li', null, x)))),
      h('div', { class: 'panel' }, h('h3', { style: { fontSize: '15px', marginBottom: '6px' } }, '구글 드라이브 올리기·공유'), h('ol', null, data.driveGuide.map((x: string) => h('li', null, x))),
        h('h3', { style: { fontSize: '15px', margin: '10px 0 6px' } }, '제출·보상 규칙'), h('ul', null, data.rules.map((x: string) => h('li', null, x))))),
    h('div', { class: 'panel', style: { marginBottom: '12px' } }, h('h3', { style: { fontSize: '15px', marginBottom: '6px' } }, '어느 판이든 이런 장면이 나오면 같이 찍어 주세요'), h('ul', null, data.common.map((x: string) => h('li', null, x)))),
    data.decks.map((d: any, i: number) => deckCard(d, i === 0)),
    data.screens.length ? h('details', { class: 'panel' }, h('summary', { style: { cursor: 'pointer' } }, `전투 없이 화면만 녹화 ${data.screens.length}건 — 도감에서 상세 화면을 열어 1~2초씩`),
      h('ul', { style: { marginTop: '8px' } }, data.screens.map((x: string) => h('li', null, x))), submitForm(0)) : null);
}
