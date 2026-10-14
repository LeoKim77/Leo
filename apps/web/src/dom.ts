// 아주 작은 DOM 도우미 — 프레임워크 없이 화면을 그린다
type Child = Node | string | number | null | undefined | false | Child[];
type Attrs = Record<string, unknown> | null;

export function h(tag: string, attrs?: Attrs, ...children: Child[]): HTMLElement {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    else if (k === 'class') el.className = String(v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'value') (el as HTMLInputElement).value = String(v);
    else if (k === 'checked') (el as HTMLInputElement).checked = !!v;
    else if (k === 'html') el.innerHTML = String(v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  append(el, children);
  return el;
}

function append(el: Element, children: Child[]) {
  for (const c of children) {
    if (c == null || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

/** root 의 내용을 children 으로 바꾼다 (null·false 는 건너뜀) */
export function mount(root: Element, ...children: Child[]) {
  root.replaceChildren();
  append(root, children);
}

export function svg(tag: string, attrs: Record<string, unknown> = {}, ...children: Array<SVGElement | string | null | false>): SVGElement {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null && v !== false) el.setAttribute(k, String(v));
  for (const c of children) {
    if (c == null || c === false) continue;
    el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
}

export function select(options: Array<{ value: string; label: string } | string>, value: string, onChange: (v: string) => void, attrs: Attrs = {}) {
  const el = h('select', { ...attrs, onchange: (e: Event) => onChange((e.target as HTMLSelectElement).value) },
    options.map(o => typeof o === 'string' ? h('option', { value: o }, o) : h('option', { value: o.value }, o.label))) as HTMLSelectElement;
  el.value = value;
  return el;
}

export const lv = (level: string, label?: string) => h('span', { class: `lv ${level}` }, label ?? ({ pass: '통과', warn: '경고', fail: '실패', skip: '생략' } as any)[level] ?? level);
export const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;
export const fmt = (v: number) => Math.round(v).toLocaleString('ko-KR');
