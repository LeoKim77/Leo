// 전법·금병법 상세 팝업 (예전 시뮬의 [상세] 버튼)
import { h } from '../dom.ts';
import { app, generalById } from '../state.ts';

const CLAUSE: Record<string, string> = { ok: '원문대로', approx: '근사', missing: '미반영', note: '설명', special: '특수' };

function open(title: string, body: HTMLElement) {
  close();
  const ov = h('div', { class: 'modal-overlay', onclick: (e: Event) => { if (e.target === ov) close(); } },
    h('div', { class: 'modal', role: 'dialog', 'aria-label': title },
      h('div', { class: 'section-head' }, h('h3', null, title), h('button', { class: 'btn small', onclick: close }, '닫기')),
      body));
  document.body.appendChild(ov);
}
export function close() { document.querySelectorAll('.modal-overlay').forEach(e => e.remove()); }

export function showSkill(id: string) {
  const s = app.bundle.skills.find(x => x.id === id);
  if (!s) return;
  const owner = s.isUnique ? app.bundle.generals.find(g => g.uniqueSkillId === s.id) : null;
  open(s.name.ko, h('div', null,
    h('div', { class: 'sub' }, [s.isUnique ? `고유 전법${owner ? ` · ${owner.name.ko}` : ''}` : `${s.grade || ''} 전법`, s.kind, s.procRateText || '', s.trait || ''].filter(Boolean).join(' · ')),
    h('p', { style: { margin: '10px 0' } }, s.text),
    (s.clauses || []).length ? h('div', null, (s.clauses as any[]).map(c => h('div', { class: 'clause-row' }, h('span', { class: `clause-tag c-${c.status}` }, CLAUSE[c.status] || c.status), h('span', null, c.text)))) : null));
}

export function showManual(generalId: string, manualId: string) {
  const g = generalById(generalId);
  const m = g?.manuals.find(x => x.id === manualId);
  if (!g || !m) return;
  open(`${g.name.ko} 금병법〈${m.name}〉`, h('div', null,
    h('p', { style: { margin: '6px 0 10px' } }, m.text || '(원문 미확인)'),
    m.note ? h('div', { class: 'sub' }, `시뮬 처리: ${m.note}`) : null,
    ((m as any).clauses || []).map((c: any) => h('div', { class: 'clause-row' }, h('span', { class: `clause-tag c-${c.status}` }, CLAUSE[c.status] || c.status), h('span', null, c.text)))));
}
