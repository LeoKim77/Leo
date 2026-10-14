// SVG 차트 — 모든 값은 마우스를 올리지 않아도 보이게 직접 표기한다 (사용자 요청)
// 마크: 얇은 막대(끝 4px 둥글림), 2px 선, 8px 점. 축·격자는 흐리게.
import { svg, h } from './dom.ts';

export const SIDE_A = 'var(--side-a)';
export const SIDE_B = 'var(--side-b)';

/** 가로 막대 — 라벨 | 막대 | 값. 값 텍스트는 항상 표시 */
export function hBars(rows: Array<{ label: string; value: number; display?: string; color?: string; sub?: string }>, opts: { max?: number; labelWidth?: number; width?: number } = {}) {
  const W = opts.width ?? 640, LW = opts.labelWidth ?? 150, VW = 128, BH = 14, GAP = 12;
  const max = opts.max ?? Math.max(1e-9, ...rows.map(r => r.value));
  const H = rows.length * (BH + GAP) + 4;
  const plotW = W - LW - VW;
  const root = svg('svg', { class: 'chart', viewBox: `0 0 ${W} ${H}`, role: 'img', style: `max-width:${W}px` });
  rows.forEach((r, i) => {
    const y = i * (BH + GAP) + 2;
    const w = Math.max(r.value > 0 ? 3 : 0, (r.value / max) * plotW);
    const label = r.label.length > 14 ? r.label.slice(0, 13) + '…' : r.label;
    root.append(
      svg('text', { x: LW - 8, y: y + BH - 2, 'text-anchor': 'end' }, label),
      svg('rect', { x: LW, y, width: plotW, height: BH, rx: 4, fill: 'var(--panel-2)' }),
      svg('rect', { x: LW, y, width: w, height: BH, rx: 4, fill: r.color ?? SIDE_A }, svg('title', {}, `${r.label}: ${r.display ?? r.value}`)),
      svg('text', { x: LW + plotW + 8, y: y + BH - 2, class: 'val' }, r.display ?? String(r.value)),
    );
  });
  return root;
}

/** 승률 한 줄 막대: A | 무승부 | B, 각 구간에 수치 표기 */
export function winBar(a: number, draw: number, b: number, labels: [string, string]) {
  const W = 1000, H = 58;
  const total = a + draw + b || 1;
  const wa = (a / total) * W, wd = (draw / total) * W, wb = (b / total) * W;
  const root = svg('svg', { class: 'chart', viewBox: `0 0 ${W} ${H}`, role: 'img', style: `max-width:${W}px` });
  root.append(
    svg('rect', { x: 0, y: 20, width: Math.max(0, wa - 1), height: 18, rx: 4, fill: SIDE_A }),
    svg('rect', { x: wa + 1, y: 20, width: Math.max(0, wd - 2), height: 18, fill: 'var(--skip)' }),
    svg('rect', { x: wa + wd + 1, y: 20, width: Math.max(0, wb - 1), height: 18, rx: 4, fill: SIDE_B }),
    svg('text', { x: 0, y: 13, class: 'val' }, `${labels[0]} ${(a / total * 100).toFixed(1)}%`),
    svg('text', { x: W, y: 13, class: 'val', 'text-anchor': 'end' }, `${(b / total * 100).toFixed(1)}% ${labels[1]}`),
    svg('text', { x: W / 2, y: 54, 'text-anchor': 'middle' }, `무승부 ${(draw / total * 100).toFixed(1)}% · ${total.toLocaleString('ko-KR')}판`),
  );
  return root;
}

/** 턴별 병력 선 그래프 — 각 점에 값 표기 (A 는 위, B 는 아래로 비켜 적어 겹침 방지) */
export function troopLines(points: Array<{ turn: number; A: number; B: number }>, labels: [string, string]) {
  const W = 1000, H = 280, L = 46, R = 24, T = 22, B = 30;
  const maxV = Math.max(30000, ...points.flatMap(p => [p.A, p.B]));
  const turns = points.map(p => p.turn);
  const minT = Math.min(...turns, 1), maxT = Math.max(...turns, 2);
  const x = (t: number) => L + ((t - minT) / Math.max(1, maxT - minT)) * (W - L - R);
  const y = (v: number) => T + (1 - v / maxV) * (H - T - B);
  const root = svg('svg', { class: 'chart', viewBox: `0 0 ${W} ${H}`, role: 'img', style: `max-width:${W}px` });
  [0, 0.5, 1].forEach(f => {
    const v = maxV * f;
    root.append(svg('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), class: 'grid' }), svg('text', { x: L - 6, y: y(v) + 4, 'text-anchor': 'end' }, `${Math.round(v / 1000)}천`));
  });
  turns.forEach(t => root.append(svg('text', { x: x(t), y: H - 10, 'text-anchor': 'middle' }, `${t}턴`)));
  (['A', 'B'] as const).forEach((side, si) => {
    const color = side === 'A' ? SIDE_A : SIDE_B;
    const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.turn).toFixed(1)},${y(p[side]).toFixed(1)}`).join(' ');
    root.append(svg('path', { d, fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    points.forEach(p => {
      const other = side === 'A' ? p.B : p.A;
      const above = p[side] >= other;
      root.append(
        svg('circle', { cx: x(p.turn), cy: y(p[side]), r: 4, fill: color, stroke: 'var(--panel)', 'stroke-width': 2 }),
        svg('text', { x: x(p.turn), y: y(p[side]) + (above ? -9 : 17), 'text-anchor': 'middle', class: 'val', style: 'font-size:11px' }, `${(p[side] / 1000).toFixed(1)}k`),
      );
    });
    void si;
  });
  const legend = h('div', { class: 'chart-legend' },
    h('span', null, h('i', { style: { background: 'var(--side-a)' } }), labels[0]),
    h('span', null, h('i', { style: { background: 'var(--side-b)' } }), labels[1]),
    h('span', { class: 'muted' }, '부대 총병력 평균'));
  return h('div', null, legend, root);
}

/** 감사 규칙별 누적 막대 (통과/경고/실패/생략) — 구간마다 개수 표기 */
export function stackedLevels(rows: Array<{ label: string; pass: number; warn: number; fail: number; skip: number }>) {
  const W = 900, LW = 250, BH = 16, GAP = 10;
  const H = rows.length * (BH + GAP) + 4;
  const plotW = W - LW - 10;
  const colors: Record<string, string> = { pass: 'var(--ok)', warn: 'var(--warn)', fail: 'var(--fail)', skip: 'var(--skip)' };
  const root = svg('svg', { class: 'chart', viewBox: `0 0 ${W} ${H}`, role: 'img', style: `max-width:${W}px` });
  rows.forEach((r, i) => {
    const y = i * (BH + GAP) + 2;
    const total = r.pass + r.warn + r.fail + r.skip || 1;
    let x = LW;
    root.append(svg('text', { x: LW - 8, y: y + BH - 3, 'text-anchor': 'end' }, r.label.length > 24 ? r.label.slice(0, 23) + '…' : r.label));
    (['pass', 'warn', 'fail', 'skip'] as const).forEach(k => {
      const w = (r[k] / total) * plotW;
      if (w <= 0) return;
      root.append(svg('rect', { x: x + 1, y, width: Math.max(1, w - 2), height: BH, rx: 3, fill: colors[k] }));
      if (w >= 22) root.append(svg('text', { x: x + w / 2, y: y + BH - 3.5, 'text-anchor': 'middle', style: 'fill:#0e1013;font-weight:700;font-size:11px' }, String(r[k])));
      else root.append(svg('text', { x: x + w / 2, y: y - 2, 'text-anchor': 'middle', style: 'font-size:10px', class: 'val' }, String(r[k])));
      x += w;
    });
  });
  return root;
}
