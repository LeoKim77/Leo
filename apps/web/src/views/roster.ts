// 내가 가진 무장·전법 (브라우저에 저장. 배포 후에는 DB 로 옮긴다)
import { h, mount } from '../dom.ts';
import { app, inSeason, loadUser, saveUser, userStoreStatus } from '../state.ts';

let msg = '';
let showText = '';
let showPaste = false;
const GRADES = ['전설', '영웅', '희귀'];
const GRADE_CLASS: Record<string, string> = { 전설: 'g-legend', 영웅: 'g-hero', 희귀: 'g-rare', '등급 미확인': 'g-unknown' };

export function renderRoster(root: HTMLElement) {
  const user = loadUser();
  const ownG = new Set(user.ownedGenerals), ownS = new Set(user.ownedSkills);
  const toggle = (set: Set<string>, id: string) => { set.has(id) ? set.delete(id) : set.add(id); user.ownedGenerals = [...ownG]; user.ownedSkills = [...ownS]; saveUser(user); renderRoster(root); };
  const generals = app.bundle.generals.filter(g => inSeason(g.season));
  const skills = app.bundle.skills.filter(s => !s.isUnique && inSeason(s.season));
  const byFaction = ['위', '촉', '오', '군'].map(f => [f, generals.filter(g => g.faction === f)] as const);
  const byKind = ['지휘', '패시브', '액티브', '추격'].map(k => [k, skills.filter(s => s.kind === k)] as const);
  const chip = (on: boolean, label: string, onClick: () => void, grade?: string) => h('button', { class: `chip ${on ? 'on' : ''} ${GRADE_CLASS[grade || ''] || ''}`, onclick: onClick }, label);
  // 진영·전법 종류 안에서 다시 등급별로(전설 금 · 영웅 보라 · 희귀 파랑). 등급 자료가 없는 것은 '등급 미확인'
  const byGrade = <T extends { grade?: string }>(list: T[]) => [...GRADES, '등급 미확인']
    .map(gr => [gr, list.filter(x => (GRADES.includes(x.grade || '') ? x.grade : '등급 미확인') === gr)] as const).filter(([, l]) => l.length);
  const gradeRows = <T extends { grade?: string }>(list: T[], render: (x: T) => any) => byGrade(list).map(([gr, l]) =>
    h('div', { class: 'grade-row' }, h('span', { class: `grade-tag ${GRADE_CLASS[gr] || ''}` }, `${gr} ${l.length}`), h('div', { class: 'toolbar', style: { marginBottom: 0 } }, l.map(render))));

  // 아티팩트 화면에서는 파일 저장이 막혀 있어 클립보드 복사·붙여넣기로 옮긴다
  const exportBtn = h('button', { class: 'btn small', onclick: async () => {
    const json = JSON.stringify(user);
    try { await navigator.clipboard.writeText(json); msg = '보유 목록을 클립보드에 복사했습니다. 다른 기기의 "붙여넣기로 불러오기"에 붙여 넣으세요.'; }
    catch { showText = json; msg = '자동 복사가 막혀 있습니다. 아래 글을 전부 선택해 복사하세요.'; }
    renderRoster(root);
  } }, '복사해서 내보내기');
  const importInput = h('input', { type: 'file', accept: 'application/json', style: { display: 'none' }, onchange: async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) applyJson(await f.text());
  } }) as HTMLInputElement;
  const applyJson = (txt: string) => {
    try { saveUser({ ...user, ...JSON.parse(txt) }); msg = '불러왔습니다.'; showPaste = false; }
    catch { msg = '형식이 올바르지 않습니다. 내보내기로 복사한 글 전체를 붙여 넣으세요.'; }
    renderRoster(root);
  };
  const pasteBox = h('textarea', { id: 'roster-paste', placeholder: '내보내기로 복사한 글을 여기에 붙여 넣으세요' }) as HTMLTextAreaElement;

  mount(root, 
    h('div', { class: 'section-head' }, h('h2', null, '내 보유 무장·전법'),
      h('span', { class: 'sub' }, `무장 ${ownG.size}/${generals.length} · 전법 ${ownS.size}/${skills.length} · ${userStoreStatus === 'cloud' ? '아티팩트에 저장(다시 열어도 유지)' : userStoreStatus === 'cloud-error' ? '아티팩트 저장 실패 — 이 브라우저에만 저장' : '이 브라우저에 저장'}`)),
    h('div', { class: 'toolbar' }, exportBtn,
      h('button', { class: 'btn small', onclick: () => { showPaste = !showPaste; renderRoster(root); } }, '붙여넣기로 불러오기'),
      h('button', { class: 'btn small', onclick: () => importInput.click() }, '파일에서 불러오기'), importInput,
      h('button', { class: 'btn small', onclick: () => { generals.forEach(g => ownG.add(g.id)); user.ownedGenerals = [...ownG]; saveUser(user); renderRoster(root); } }, '무장 전체 선택')),
    msg ? h('div', { class: 'notice' }, msg) : null,
    showText ? h('textarea', { id: 'roster-export', readonly: true, value: showText, onfocus: (e: Event) => (e.target as HTMLTextAreaElement).select() }) : null,
    showPaste ? h('div', { class: 'panel', style: { marginBottom: '12px' } }, pasteBox, h('button', { class: 'btn small', style: { marginTop: '6px' }, onclick: () => applyJson(pasteBox.value) }, '불러오기')) : null,
    h('div', { class: 'grid cols-2' },
      h('div', { class: 'panel' }, h('h3', { style: { fontSize: '16px', marginBottom: '8px' } }, '무장'),
        byFaction.map(([f, list]) => h('div', { style: { marginBottom: '10px' } }, h('div', { class: 'sub' }, f),
          gradeRows(list as any[], (g: any) => chip(ownG.has(g.id), g.name.ko + (g.krRelease ? ' (미출시)' : ''), () => toggle(ownG, g.id), g.grade))))),
      h('div', { class: 'panel' }, h('h3', { style: { fontSize: '16px', marginBottom: '8px' } }, '전법'),
        byKind.map(([k, list]) => h('div', { style: { marginBottom: '10px' } }, h('div', { class: 'sub' }, k),
          gradeRows(list as any[], (x: any) => chip(ownS.has(x.id), x.name.ko + (x.krRelease ? ' (미출시)' : ''), () => toggle(ownS, x.id), x.grade)))))),
  );
}
