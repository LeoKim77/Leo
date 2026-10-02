// 도감 — 시즌별 무장·전법. 원문 절마다 엔진 반영 상태를 색으로 보여주고, 감사 결과를 붙인다.
import { h, mount, lv, select } from '../dom.ts';
import { app, inSeason, skillById, generalById, skillAudit, ko, loadDecklab } from '../state.ts';
import { hBars } from '../charts.ts';
import type { Skill, General } from '@cheonha/engine';

let kind: 'general' | 'skill' = 'general';
let selId = '';
let q = '';
let faction = '전체';
let skillKind = '전체';

export function renderCodex(root: HTMLElement, params: URLSearchParams) {
  if (params.get('kind')) kind = params.get('kind') as any;
  if (params.get('id')) selId = params.get('id')!;
  draw(root);
}

function draw(root: HTMLElement) {
  const b = app.bundle;
  const generals = b.generals.filter(g => inSeason(g.season) && (faction === '전체' || g.faction === faction) && (!q || g.name.ko.includes(q)));
  const skills = b.skills.filter(s => inSeason(s.season) && (skillKind === '전체' || s.kind === skillKind) && (!q || s.name.ko.includes(q) || s.text.includes(q)));
  const audit = (id: string) => skillAudit(id)?.worst;

  const list = h('div', { class: 'panel list' },
    kind === 'general'
      ? generals.map(g => {
        const u = skillById(g.uniqueSkillId);
        return h('div', { class: `list-row ${selId === g.id ? 'sel' : ''}`, onclick: () => { selId = g.id; location.hash = `#/codex?kind=general&id=${g.id}`; } },
          h('span', { class: 'name' }, g.name.ko),
          h('span', { class: 'badge' }, g.faction), h('span', { class: 'badge' }, g.unitType),
          h('span', { class: 'muted', style: { marginLeft: 'auto', fontSize: '12px' } }, g.season),
          u && audit(u.id) ? lv(audit(u.id)!, '') : null);
      })
      : skills.map(s => h('div', { class: `list-row ${selId === s.id ? 'sel' : ''}`, onclick: () => { selId = s.id; location.hash = `#/codex?kind=skill&id=${s.id}`; } },
        h('span', { class: 'name' }, s.name.ko),
        h('span', { class: 'badge' }, s.kind),
        s.isUnique ? h('span', { class: 'badge gold' }, '고유') : null,
        h('span', { class: 'muted', style: { marginLeft: 'auto', fontSize: '12px' } }, s.season),
        audit(s.id) ? lv(audit(s.id)!, '') : null)),
  );

  const sel = kind === 'general' ? generalById(selId) : skillById(selId);
  const detail = h('div', null, sel
    ? (kind === 'general' ? generalDetail(sel as General) : skillDetail(sel as Skill))
    : h('div', { class: 'panel empty' }, '왼쪽에서 항목을 고르세요.'));

  mount(root, 
    h('div', { class: 'section-head' },
      h('h2', null, '도감'),
      h('span', { class: 'sub' }, `${app.season}까지 출시 · 무장 ${generals.length} · 전법 ${skills.length}`)),
    h('div', { class: 'toolbar' },
      h('button', { class: `chip ${kind === 'general' ? 'on' : ''}`, onclick: () => { kind = 'general'; selId = ''; draw(root); } }, '무장'),
      h('button', { class: `chip ${kind === 'skill' ? 'on' : ''}`, onclick: () => { kind = 'skill'; selId = ''; draw(root); } }, '전법'),
      kind === 'general'
        ? select(['전체', '위', '촉', '오', '군'], faction, v => { faction = v; draw(root); })
        : select(['전체', '지휘', '패시브', '액티브', '추격'], skillKind, v => { skillKind = v; draw(root); }),
      h('input', { type: 'text', placeholder: '이름·원문 검색', value: q, oninput: (e: Event) => { q = (e.target as HTMLInputElement).value; draw(root); setTimeout(() => (root.querySelector('input[type=text]') as HTMLInputElement)?.focus(), 0); } })),
    h('div', { class: 'split' }, list, detail),
  );
}

export function clauseView(s: Skill) {
  const label: Record<string, string> = { ok: '엔진 반영', note: '수식어·설명', approx: '근사 반영', special: '특수 처리', missing: '미반영' };
  return h('div', null,
    h('div', { style: { fontSize: '15px' } }, s.clauses.map((c, i) => [h('span', { class: `clause ${c.status}`, title: `${label[c.status]}${c.impl?.length ? ' · ' + c.impl.join(', ') : ''}` }, c.text), i < s.clauses.length - 1 ? ' / ' : ''])),
    h('div', { class: 'legend' },
      h('span', null, h('i', { style: { background: 'var(--clause-ok)' } }), '엔진 반영'),
      h('span', null, h('i', { style: { background: 'var(--clause-note)' } }), '수식어·특수'),
      h('span', null, h('i', { style: { background: 'var(--clause-missing)' } }), '미반영')));
}

export function auditChecks(id: string) {
  const a = skillAudit(id);
  if (!a) return h('div', { class: 'muted' }, '감사 결과 없음 — 감사 탭에서 실행하세요.');
  return h('div', { class: 'table-wrap' }, h('table', null,
    h('tbody', null, a.checks.map(c => h('tr', null,
      h('td', { style: { width: '74px' } }, lv(c.level)),
      h('td', null, h('div', null, c.title), h('div', { class: 'dim', style: { fontSize: '13px' } }, c.message),
        c.evidence?.length ? h('details', null, h('summary', null, '근거'), h('div', { class: 'dim', style: { fontSize: '12.5px', whiteSpace: 'pre-wrap' } }, c.evidence.join('\n'))) : null))))));
}

function skillDetail(s: Skill) {
  const owner = s.ownerGeneralId ? generalById(s.ownerGeneralId) : null;
  const eng = s.engine as any;
  const a = skillAudit(s.id);
  const overseas = h('div');
  if (!s.overseasText) loadDecklab().then(dl => {
    const t = dl.tactics.find((t: any) => t.original === s.name.zhTW || t.name === s.name.ko || (s.name.aliases || []).includes(t.name));
    const det = t && dl.tacticDetails[t.id];
    if (det) overseas.replaceChildren(h('div', { class: 'dim', style: { fontSize: '13.5px' } }, h('b', null, '해외 자료: '), ko(det.maxEffect), ' ', det.sourceUrl ? h('a', { href: det.sourceUrl, target: '_blank', rel: 'noopener' }, '원출처') : null));
  }).catch(() => {});
  return h('div', { class: 'grid' },
    h('div', { class: 'panel' },
      h('div', { class: 'section-head' }, h('h2', null, s.name.ko),
        h('span', null, h('span', { class: 'badge' }, s.kind), s.trait ? h('span', { class: 'badge' }, s.trait) : null, s.grade ? h('span', { class: 'badge gold' }, s.grade) : null, h('span', { class: 'badge' }, s.season), a ? lv(a.worst) : null)),
      h('dl', { class: 'kv' },
        h('dt', null, '발동 확률'), h('dd', null, s.procRateText || '-'),
        s.name.zhTW ? [h('dt', null, '원어'), h('dd', null, `${s.name.zhTW}${s.name.aliases?.length ? ' · ' + s.name.aliases.join(', ') : ''}`)] : null,
        owner ? [h('dt', null, '고유 무장'), h('dd', null, h('a', { href: `#/codex?kind=general&id=${owner.id}` }, owner.name.ko))] : null,
        h('dt', null, '엔진'), h('dd', null, eng ? (eng.overrideNote ? `v1.12b 정의 + 검수 수정 (${eng.overrideNote.date}: ${eng.overrideNote.reason})` : 'v1.12b 정의') : h('span', { style: { color: 'var(--fail)' } }, '정의 없음 — 전투에서 효과 없음'))),
      h('h3', { style: { fontSize: '15px', margin: '12px 0 6px' } }, '원문 (한국판, 10레벨)'),
      clauseView(s),
      s.overseasText ? h('div', { class: 'dim', style: { fontSize: '13.5px', marginTop: '8px' } }, h('b', null, '해외 자료: '), ko(s.overseasText)) : overseas),
    h('div', { class: 'panel' }, h('h3', { style: { fontSize: '15px', marginBottom: '6px' } }, '감사 — 원문대로 발동하는가'),
      a?.sample ? h('div', { class: 'sub', style: { marginBottom: '6px' } }, `감사 전투 ${a.sample.battles}판 · 발동 ${a.sample.fired}회${a.sample.rolls ? ` · 확률 판정 ${a.sample.rolls}회 중 ${a.sample.rollOk}회 성공` : ''}`) : null,
      auditChecks(s.id)));
}

function generalDetail(g: General) {
  const u = skillById(g.uniqueSkillId);
  const stats = (['무력', '지력', '통솔', '선공'] as const).map(k => ({ label: k, value: g.stats[k] ?? 0, display: String(g.stats[k] ?? '-'), color: 'var(--gold)' }));
  const bonds = app.bundle.bonds.filter(b => b.memberIds.includes(g.id));
  const decks = app.bundle.tierDecks.filter(t => t.units.some(x => x.generalId === g.id));
  return h('div', { class: 'grid' },
    h('div', { class: 'panel' },
      h('div', { class: 'section-head' }, h('h2', null, g.name.ko),
        h('span', null, h('span', { class: 'badge' }, g.faction), h('span', { class: 'badge' }, g.unitType), h('span', { class: 'badge' }, g.row), g.role ? h('span', { class: 'badge' }, g.role) : null, h('span', { class: 'badge gold' }, g.season))),
      h('div', { class: 'sub' }, `${g.name.zhTW || ''} · 50레벨 기준 스탯`),
      h('div', { class: 'statbars' }, hBars(stats, { max: 300, labelWidth: 44, width: 360 }))),
    u ? h('div', { class: 'panel' },
      h('div', { class: 'section-head' }, h('h3', { style: { fontSize: '16px' } }, `고유 전법 · ${u.name.ko}`), h('span', null, h('span', { class: 'badge' }, u.kind), h('span', { class: 'badge' }, u.procRateText || ''), skillAudit(u.id) ? lv(skillAudit(u.id)!.worst) : null)),
      clauseView(u),
      u.overseasText ? h('div', { class: 'dim', style: { fontSize: '13.5px', marginTop: '8px' } }, h('b', null, '해외 자료: '), ko(u.overseasText)) : null,
      h('details', { style: { marginTop: '10px' } }, h('summary', null, '감사 결과'), auditChecks(u.id))) : null,
    g.manuals.length ? h('div', { class: 'panel' }, h('h3', { style: { fontSize: '15px', marginBottom: '6px' } }, '전용 병법'),
      g.manuals.map(m => h('div', { style: { marginBottom: '6px' } }, h('b', null, `〈${m.name}〉 `), h('span', { class: 'dim' }, m.text))),
      h('div', { class: 'muted', style: { fontSize: '12.5px' } }, '병법 효과는 아직 전투 엔진에 반영되지 않았습니다.')) : null,
    bonds.length ? h('div', { class: 'panel' }, h('h3', { style: { fontSize: '15px', marginBottom: '6px' } }, '인연'),
      bonds.map(b => h('div', { style: { marginBottom: '6px' } }, h('b', null, `${b.name} `), h('span', { class: 'badge' }, `${b.required}명`), h('span', { class: 'dim' }, `${b.memberNames.join(', ')} — ${b.text}`)))) : null,
    decks.length ? h('div', { class: 'panel' }, h('h3', { style: { fontSize: '15px', marginBottom: '6px' } }, '사용 티어덱'),
      decks.map(t => h('a', { href: `#/tier`, class: 'badge tier', style: { marginBottom: '4px' } }, `${t.tier} ${t.name}`))) : null,
  );
}
