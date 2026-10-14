// 공유 구글 스프레드시트 → data/sources/gsheet/<시트id>/<gid>.json (셀 격자 원본)
//
// 사용: tsx src/import-gsheet.ts <시트 주소 또는 id> [탭 이름 일부 …]
//   탭 이름을 주지 않으면 모든 탭을 받는다.
//
// 복사·다운로드가 막힌 시트도 '보기'가 되면 htmlview 의 시트별 표로 읽을 수 있다.
// 병합 셀(rowspan/colspan)은 각 칸에 같은 값을 채우고, 칠해진 칸은 배경색을 남긴다(노란 칸 = 대체 표시 등).
// 필요한 네트워크 허용: docs.google.com, *.googleusercontent.com
import { join } from 'node:path';
import { SOURCES, writeJson } from './paths.ts';

export interface SheetTab { gid: string; name: string }
export interface SheetGrid {
  sheetId: string;
  gid: string;
  name: string;
  fetchedAt: string;
  url: string;
  /** rows[r][c] = 셀 글자 (빈 칸은 '') */
  rows: string[][];
  /** 배경색이 있는 칸: "r,c" → #rrggbb */
  fills: Record<string, string>;
}

export function sheetIdOf(urlOrId: string) {
  return urlOrId.match(/\/d\/([A-Za-z0-9_-]+)/)?.[1] || urlOrId;
}

async function get(url: string) {
  const r = await fetch(url, { redirect: 'follow' });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

const decode = (s: string) => s
  .replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
  .replace(/[ \t]+\n/g, '\n').trim();

export async function listTabs(sheetId: string): Promise<SheetTab[]> {
  const html = await get(`https://docs.google.com/spreadsheets/d/${sheetId}/htmlview`);
  const tabs: SheetTab[] = [];
  for (const m of html.matchAll(/name:\s*"((?:[^"\\]|\\.)*)"[^}]*?gid:\s*"?(\d+)/g)) {
    tabs.push({ gid: m[2], name: JSON.parse(`"${m[1]}"`) });
  }
  return tabs;
}

/** htmlview 시트 표 → 격자 */
export function parseSheetHtml(html: string): { rows: string[][]; fills: Record<string, string> } {
  // 칸 배경색: 스타일 클래스 → 색
  const classBg = new Map<string, string>();
  for (const m of html.matchAll(/\.(s\d+)\s*\{([^}]*)\}/g)) {
    const bg = m[2].match(/background-color:\s*(#[0-9a-fA-F]{6})/);
    if (bg) classBg.set(m[1], bg[1].toLowerCase());
  }
  const body = html.slice(html.indexOf('<tbody'), html.lastIndexOf('</tbody>'));
  const rows: string[][] = [];
  const fills: Record<string, string> = {};
  const occupied = new Set<string>();
  let r = -1;
  for (const tr of body.split(/<tr[^>]*>/).slice(1)) {
    r++;
    rows[r] = rows[r] || [];
    let c = 0;
    // 첫 칸은 행 번호(<th>)라서 건너뛴다
    for (const m of tr.matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/g)) {
      while (occupied.has(`${r},${c}`)) c++;
      const attrs = m[1];
      const rs = +(attrs.match(/rowspan="(\d+)"/)?.[1] || 1);
      const cs = +(attrs.match(/colspan="(\d+)"/)?.[1] || 1);
      const cls = attrs.match(/class="([^"]*)"/)?.[1] || '';
      const text = decode(m[2]);
      const bg = cls.split(/\s+/).map(k => classBg.get(k)).find(Boolean);
      for (let dr = 0; dr < rs; dr++) for (let dc = 0; dc < cs; dc++) {
        const rr = r + dr, cc = c + dc;
        rows[rr] = rows[rr] || [];
        rows[rr][cc] = text;
        occupied.add(`${rr},${cc}`);
        if (bg && bg !== '#ffffff') fills[`${rr},${cc}`] = bg;
      }
      c += cs;
    }
  }
  const width = Math.max(0, ...rows.map(x => x.length));
  return { rows: rows.map(x => Array.from({ length: width }, (_, i) => x[i] ?? '')), fills };
}

export async function fetchTab(sheetId: string, tab: SheetTab): Promise<SheetGrid> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/htmlview/sheet?headers=true&gid=${tab.gid}`;
  const { rows, fills } = parseSheetHtml(await get(url));
  return { sheetId, gid: tab.gid, name: tab.name, fetchedAt: new Date().toISOString(), url, rows, fills };
}

export async function importSheet(urlOrId: string, only: string[] = []) {
  const sheetId = sheetIdOf(urlOrId);
  const tabs = (await listTabs(sheetId)).filter(t => !only.length || only.some(o => t.name.includes(o)));
  const out: Array<{ tab: SheetTab; file: string; rows: number }> = [];
  for (const tab of tabs) {
    const grid = await fetchTab(sheetId, tab);
    const file = join(SOURCES, 'gsheet', sheetId, `${tab.gid}.json`);
    writeJson(file, grid);
    out.push({ tab, file, rows: grid.rows.length });
  }
  writeJson(join(SOURCES, 'gsheet', sheetId, 'index.json'), { sheetId, url: `https://docs.google.com/spreadsheets/d/${sheetId}`, fetchedAt: new Date().toISOString(), tabs: await listTabs(sheetId) });
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , url, ...only] = process.argv;
  if (!url) { console.error('사용: tsx import-gsheet.ts <시트 주소> [탭 이름 일부 …]'); process.exit(1); }
  const res = await importSheet(url, only);
  for (const r of res) console.log(`${r.tab.name} (gid ${r.tab.gid}) → ${r.rows}행`);
}
