// 감사 — 고유 전법·전법이 실제 규칙(원문·용어 시트)대로 발동하는지
import { h, mount, lv, select } from '../dom.ts';
import { app } from '../state.ts';
import { stackedLevels } from '../charts.ts';
import { call } from '../sim-client.ts';
import { auditChecks, clauseView } from './codex.ts';
import type { AuditReport, SkillAudit } from '@cheonha/audit';

let level = 'fail';
let rule = '';
let kindF = '전체';
let q = '';
let open = '';
let busy = '';

/** 전보 녹화 검증 대기 목록 (R-007) */
function verificationSection() {
  const items = ((app.bundle as any).verification || []) as Array<{ id: string; kind: string; title: string; assumption: string; howToVerify: string; status: string; result?: string }>;
  if (!items.length) return null;
  const kinds: Record<string, string> = { manual: '금병법', skill: '전법', clause: '원문 절', engine: '엔진 가정' };
  const lvOf: Record<string, [string, string]> = { pending: ['warn', '대기'], verified: ['pass', '확인'], rejected: ['fail', '불일치'] };
  const pending = items.filter(i => i.status === 'pending').length;
  return h('details', { class: 'panel', style: { marginBottom: '12px' }, open: true },
    h('summary', null, h('b', null, '전보 녹화 검증 대기'), ` — ${items.length}개 중 대기 ${pending} · 확인 ${items.filter(i => i.status === 'verified').length} · 불일치 ${items.filter(i => i.status === 'rejected').length}`),
    h('div', { class: 'sub', style: { margin: '6px 0' } }, '근사로 처리한 해석입니다. 해당 전투의 전보 녹화를 올려 주시면 Claude 가 대조해 확인/불일치를 기록합니다(MCP verification_resolve).'),
    h('div', { class: 'table-wrap' }, h('table', null,
      h('thead', null, h('tr', null, h('th', null, '상태'), h('th', null, '분류'), h('th', null, '항목'), h('th', null, '가정 · 확인 방법'))),
      h('tbody', null, items.map(i => h('tr', null,
        h('td', null, lv(...lvOf[i.status])),
        h('td', null, h('span', { class: 'badge' }, kinds[i.kind] || i.kind)),
        h('td', null, i.title),
        h('td', { style: { fontSize: '13px' } }, h('div', null, i.assumption), h('div', { class: 'muted' }, `확인: ${i.howToVerify}`), i.result ? h('div', { class: 'dim' }, `결과: ${i.result}`) : null)))))));
}

export function renderAudit(root: HTMLElement) {
  const r = app.audit;
  if (!r) { mount(root, h('div', { class: 'empty' }, '감사 결과가 없습니다. 저장소에서 pnpm audit 을 실행하세요.')); return; }
  const redraw = () => renderAudit(root);
  const rows = r.skills.filter(s =>
    (level === '전체' || s.checks.some(c => c.level === level && (!rule || c.rule === rule))) &&
    (!rule || s.checks.some(c => c.rule === rule)) &&
    (kindF === '전체' || (kindF === '고유' ? s.isUnique : !s.isUnique && s.kind === kindF)) &&
    (!q || s.name.includes(q) || (s.owner || '').includes(q)));

  const reaudit = async (s: SkillAudit) => {
    busy = s.id; redraw();
    try {
      const res = await call<AuditReport>({ type: 'audit', skillIds: [s.id] });
      const fresh = res.skills[0];
      const i = r.skills.findIndex(x => x.id === s.id);
      if (fresh && i >= 0) r.skills[i] = fresh;
    } finally { busy = ''; redraw(); }
  };

  const fails = r.ruleSummary.filter(x => x.rule.startsWith('E') ? false : true);
  mount(root, 
    h('div', { class: 'section-head' }, h('h2', null, '규칙 감사'),
      h('span', { class: 'sub' }, `${r.generatedAt.slice(0, 16).replace('T', ' ')} · 데이터 ${r.dataVersion} · 전투 ${r.battles.toLocaleString('ko-KR')}판`)),
    h('div', { class: 'notice' }, '기준은 엔진이 아니라 한국판 원문(엑셀)과 용어 시트입니다. 원문에서 기대 동작(시점·확률·대상 수·효과)을 따로 뽑고, 감사 전투의 기록과 대조합니다.'),
    h('div', { class: 'tiles' },
      (['pass', 'warn', 'fail', 'skip'] as const).map(k => h('div', { class: 'tile' }, h('div', { class: 'k' }, lv(k)), h('div', { class: 'v' }, r.summary[k].toLocaleString('ko-KR'), h('small', null, ' 항목'))))),
    h('div', { class: 'panel', style: { marginBottom: '12px' } }, h('h3', { style: { fontSize: '15px', marginBottom: '8px' } }, '엔진 공통 규칙'),
      h('table', null, h('tbody', null, r.engineRules.map(e => h('tr', null, h('td', { style: { width: '74px' } }, lv(e.level)),
        h('td', null, h('div', null, e.title), h('div', { class: 'dim', style: { fontSize: '13px' } }, e.message),
          e.evidence?.length ? h('details', null, h('summary', null, '사례'), h('div', { class: 'dim', style: { fontSize: '12.5px', whiteSpace: 'pre-wrap' } }, e.evidence.join('\n'))) : null)))))),
    h('div', { class: 'panel', style: { marginBottom: '12px' } }, h('h3', { style: { fontSize: '15px', marginBottom: '4px' } }, '규칙별 결과 (전법·무장 항목 수)'),
      h('div', { class: 'chart-legend' }, (['pass', 'warn', 'fail', 'skip'] as const).map(k => h('span', null, lv(k)))),
      stackedLevels(fails.map(x => ({ label: x.title, pass: x.pass, warn: x.warn, fail: x.fail, skip: x.skip })))),
    verificationSection(),
    r.manuals?.length ? h('details', { class: 'panel', style: { marginBottom: '12px' } },
      h('summary', null, `금병법 ${r.manuals.length}개 — 원문대로 ${r.manuals.filter(m => m.status === 'ok').length} · 근사 ${r.manuals.filter(m => m.status === 'approx').length} · 미지원 ${r.manuals.filter(m => m.status === 'unsupported').length}`),
      h('div', { class: 'table-wrap', style: { marginTop: '8px' } }, h('table', null,
        h('thead', null, h('tr', null, h('th', null, '결과'), h('th', null, '무장'), h('th', null, '금병법'), h('th', null, '내용'))),
        h('tbody', null, r.manuals.map(m => h('tr', null,
          h('td', null, lv(m.worst)),
          h('td', null, h('a', { href: `#/codex?kind=general&id=${m.generalId}` }, m.general)),
          h('td', null, m.name),
          h('td', { class: 'dim', style: { fontSize: '13px' } }, m.checks.map(c => h('div', null, `${c.title}: ${c.message}`)))))))) ) : null,
    h('div', { class: 'toolbar' },
      select(['전체', 'fail', 'warn', 'pass'].map(v => ({ value: v, label: { 전체: '모든 결과', fail: '실패 있음', warn: '경고 있음', pass: '통과 있음' }[v]! })), level, v => { level = v; redraw(); }),
      select([{ value: '', label: '모든 규칙' }, ...r.ruleSummary.filter(x => !x.rule.startsWith('E') && !x.rule.startsWith('G')).map(x => ({ value: x.rule, label: `${x.rule} ${x.title}` }))], rule, v => { rule = v; redraw(); }),
      select(['전체', '고유', '지휘', '패시브', '액티브', '추격'], kindF, v => { kindF = v; redraw(); }),
      h('input', { type: 'text', placeholder: '전법·무장 검색', value: q, onchange: (e: Event) => { q = (e.target as HTMLInputElement).value; redraw(); } }),
      h('span', { class: 'sub' }, `${rows.length}개`)),
    h('div', { class: 'panel table-wrap' }, h('table', null,
      h('thead', null, h('tr', null, h('th', null, '결과'), h('th', null, '전법'), h('th', null, '유형'), h('th', null, '문제'))),
      h('tbody', null, rows.map(s => {
        const issues = s.checks.filter(c => c.level === 'fail' || c.level === 'warn');
        const tr = h('tr', { class: 'click', onclick: () => { open = open === s.id ? '' : s.id; redraw(); } },
          h('td', null, lv(s.worst)),
          h('td', null, h('b', null, s.name), s.owner ? h('div', { class: 'muted', style: { fontSize: '12px' } }, `${s.owner} 고유`) : null),
          h('td', null, s.kind, h('div', { class: 'muted', style: { fontSize: '12px' } }, s.season)),
          h('td', { class: 'dim', style: { fontSize: '13px' } }, issues.slice(0, 3).map(c => h('div', null, `${c.title}: ${c.message}`))));
        if (open !== s.id) return tr;
        const skill = app.bundle.skills.find(x => x.id === s.id);
        return [tr, h('tr', null, h('td', { colspan: 4 },
          skill ? clauseView(skill) : null,
          h('div', { style: { margin: '8px 0' } },
            h('button', { class: 'btn small', disabled: !!busy, onclick: (e: Event) => { e.stopPropagation(); reaudit(s); } }, busy === s.id ? '감사 중…' : '이 전법 다시 감사'), ' ',
            h('a', { href: `#/codex?kind=skill&id=${s.id}`, class: 'btn small' }, '도감에서 보기')),
          auditChecks(s.id)))];
      })))),
  );
}
