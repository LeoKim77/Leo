// 앱 상태: 데이터 번들, 감사 결과, 보유 목록(브라우저 저장)
import type { GameBundle, ChangelogEntry, DeckSpec } from '@cheonha/engine';
import type { AuditReport } from '@cheonha/audit';

export type Bundle = GameBundle & { changelog: ChangelogEntry[] };

export const app = {
  bundle: null as unknown as Bundle,
  audit: null as AuditReport | null,
  decklab: null as any,
  season: 'S2',
};

const STORE_KEY = 'cheonha-lab:user:v1';
export interface UserData {
  ownedGenerals: string[];
  ownedSkills: string[];
  decks: Array<DeckSpec & { id: string; savedAt: string }>;
}
export function loadUser(): UserData {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return { ownedGenerals: [], ownedSkills: [], decks: [], ...JSON.parse(raw) };
  } catch { /* 저장소 차단 등 */ }
  return { ownedGenerals: [], ownedSkills: [], decks: [] };
}
export function saveUser(u: UserData) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(u)); } catch { /* 무시 */ }
}

/** 단일 파일 빌드는 데이터를 <script type="application/json" id="…"> 로 품고 있다 */
function embedded(id: string): any | undefined {
  const el = document.getElementById(id);
  if (!el?.textContent) return undefined;
  try { return JSON.parse(el.textContent); } catch { return undefined; }
}

export async function loadData() {
  const get = async (p: string) => {
    const tag = { './data/bundle.json': 'cheonha-bundle', './data/audit.json': 'cheonha-audit' }[p];
    const e = tag ? embedded(tag) : undefined;
    if (e) return e;
    const r = await fetch(p); if (!r.ok) throw new Error(`${p} ${r.status}`); return r.json();
  };
  app.bundle = await get('./data/bundle.json');
  app.season = app.bundle.season;
  app.audit = await get('./data/audit.json').catch(() => null);
}
export async function loadDecklab() {
  if (!app.decklab) app.decklab = embedded('cheonha-decklab') ?? await (await fetch('./data/reference-decklab.json')).json();
  return app.decklab;
}

const SEASON_ORDER = (s: string) => parseInt(s.replace(/\D/g, '') || '0', 10);
/** 선택한 시즌까지 출시된 항목인가 (한국 서버 기준) */
export const inSeason = (season: string) => SEASON_ORDER(season) <= SEASON_ORDER(app.season);

export const generalById = (id: string) => app.bundle.generals.find(g => g.id === id);
export const skillById = (id: string) => app.bundle.skills.find(s => s.id === id);
export const skillAudit = (id: string) => app.audit?.skills.find(s => s.id === id);

/** 해외 표기 → 한국판 용어 (웹용 간이판: 데이터 도구와 같은 표 사용) */
export function ko(text: string): string {
  if (!text) return text;
  let out = text;
  const map = [...app.bundle.termMap].filter(m => m.from !== m.to && (m as any).autoReplace !== false).sort((a, b) => b.from.length - a.from.length);
  for (const m of map) if (out.includes(m.from)) out = out.split(m.from).join(m.to);
  return out;
}

/** 임시값·추정값 항목 (공개 자료 대기) — dataStatus 에서 '임시·미확인·추정·확인 필요' 인 것 */
export const DATA_FIELD: Record<string, string> = { stats: '능력치', unitType: '병종', row: '배치', faction: '진영', name: '이름', kind: '전법 종류', text: '원문', procRate: '발동률' };
export function tentative(ds?: Record<string, string>): Array<[string, string]> {
  return Object.entries(ds || {}).filter(([, v]) => /임시|미확인|추정|확인 필요|번역/.test(v)).map(([k, v]) => [DATA_FIELD[k] || k, v]);
}
/** 지금 고른 시즌보다 뒤 시즌 자료가 있으면 그 시즌 id */
export function laterSeasonWithData(): string | undefined {
  const order = (x: string) => parseInt(x.replace(/\D/g, '') || '0', 10);
  const later = app.bundle.seasons.map(x => x.id).filter(id => order(id) > order(app.season));
  return later.find(id => app.bundle.tierDecks.some(t => t.season === id) || app.bundle.generals.some(g => g.season === id));
}
/** 화면 안 버튼에서 시즌 바꾸기 — 상단 선택 상자도 맞추고 지금 화면을 다시 그린다 */
export function setSeason(id: string) {
  app.season = id;
  const sel = document.getElementById('season-select') as HTMLSelectElement | null;
  if (sel) sel.value = id;
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}
export function seasonLabel(id: string) {
  return app.bundle.seasons.find(s => s.id === id)?.label || id;
}
