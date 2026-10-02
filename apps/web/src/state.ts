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
