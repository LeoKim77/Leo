// 내가 가진 무장·전법 (브라우저에 저장. 배포 후에는 DB 로 옮긴다)
import { h, mount } from '../dom.ts';
import { app, inSeason, loadUser, saveUser } from '../state.ts';

export function renderRoster(root: HTMLElement) {
  const user = loadUser();
  const ownG = new Set(user.ownedGenerals), ownS = new Set(user.ownedSkills);
  const toggle = (set: Set<string>, id: string) => { set.has(id) ? set.delete(id) : set.add(id); user.ownedGenerals = [...ownG]; user.ownedSkills = [...ownS]; saveUser(user); renderRoster(root); };
  const generals = app.bundle.generals.filter(g => inSeason(g.season));
  const skills = app.bundle.skills.filter(s => !s.isUnique && inSeason(s.season));
  const byFaction = ['위', '촉', '오', '군'].map(f => [f, generals.filter(g => g.faction === f)] as const);
  const byKind = ['지휘', '패시브', '액티브', '추격'].map(k => [k, skills.filter(s => s.kind === k)] as const);
  const chip = (on: boolean, label: string, onClick: () => void) => h('button', { class: `chip ${on ? 'on' : ''}`, onclick: onClick }, label);

  const exportBtn = h('button', { class: 'btn small', onclick: () => {
    const blob = new Blob([JSON.stringify(user, null, 2)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: 'cheonha-roster.json' }) as HTMLAnchorElement;
    a.click();
  } }, '내보내기');
  const importInput = h('input', { type: 'file', accept: 'application/json', style: { display: 'none' }, onchange: async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    try { saveUser({ ...user, ...JSON.parse(await f.text()) }); renderRoster(root); } catch { alert('JSON 형식이 올바르지 않습니다.'); }
  } }) as HTMLInputElement;

  mount(root, 
    h('div', { class: 'section-head' }, h('h2', null, '내 보유 무장·전법'),
      h('span', { class: 'sub' }, `무장 ${ownG.size}/${generals.length} · 전법 ${ownS.size}/${skills.length} · 이 브라우저에 저장`)),
    h('div', { class: 'toolbar' }, exportBtn, h('button', { class: 'btn small', onclick: () => importInput.click() }, '불러오기'), importInput,
      h('button', { class: 'btn small', onclick: () => { generals.forEach(g => ownG.add(g.id)); user.ownedGenerals = [...ownG]; saveUser(user); renderRoster(root); } }, '무장 전체 선택')),
    h('div', { class: 'grid cols-2' },
      h('div', { class: 'panel' }, h('h3', { style: { fontSize: '16px', marginBottom: '8px' } }, '무장'),
        byFaction.map(([f, list]) => h('div', { style: { marginBottom: '10px' } }, h('div', { class: 'sub' }, f),
          h('div', { class: 'toolbar', style: { marginBottom: 0 } }, list.map(g => chip(ownG.has(g.id), g.name.ko, () => toggle(ownG, g.id))))))),
      h('div', { class: 'panel' }, h('h3', { style: { fontSize: '16px', marginBottom: '8px' } }, '전법'),
        byKind.map(([k, list]) => h('div', { style: { marginBottom: '10px' } }, h('div', { class: 'sub' }, k),
          h('div', { class: 'toolbar', style: { marginBottom: 0 } }, list.map(s => chip(ownS.has(s.id), s.name.ko, () => toggle(ownS, s.id)))))))),
  );
}
