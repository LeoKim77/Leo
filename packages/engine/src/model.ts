// 게임 데이터 모델 — data/ 의 JSON 과 웹·엔진·감사·MCP 가 공유하는 타입.
// 원본은 Git 의 data/ 이고, build-bundle 이 이 타입으로 시즌 번들을 만든다.

export type StatKey = '무력' | '지력' | '통솔' | '선공';
export type SkillKind = '지휘' | '패시브' | '액티브' | '추격';
export type Faction = '위' | '촉' | '오' | '군';
export type UnitType = '방패병' | '궁병' | '창병' | '기병';
export type Row = '전열' | '균형' | '후열';

/** 데이터 한 건이 어디서 왔는지. 한국판 자료가 항상 우선한다. */
export interface SourceRef {
  kind: 'kr-db' | 'legacy-v1.12b' | 'decklab' | 'overseas' | 'user-report' | 'manual';
  label: string;
  url?: string;
  retrievedAt?: string;
  note?: string;
}

export interface LocalName {
  ko: string;
  zhTW?: string;
  zhCN?: string;
  /** 한자음 표기·다른 번역명 */
  aliases?: string[];
}

export interface General {
  id: string;
  name: LocalName;
  /** 한국 서버 출시 시즌 (KR DB 무장 시트 기준) */
  season: string;
  /** 해외(중국/대만) 원작 기준 시즌·콘텐츠 그룹 — 참고용 */
  overseasSeason?: string;
  faction: Faction | string;
  row: Row | string;
  role?: string;
  unitType: UnitType | string;
  gender?: 'M' | 'F';
  /** 50레벨 기준 */
  stats: Partial<Record<StatKey, number>>;
  maxTroops: number;
  uniqueSkillId: string;
  /** 전용 병법 */
  manuals: Manual[];
  /** 아직 공개 자료가 없어 임시값·추정값을 쓴 항목 (예: stats: '임시값') */
  dataStatus?: Record<string, string>;
  /** 한국 서버에 없는 무장 (사용자 확인) */
  notInKr?: boolean;
  sources: SourceRef[];
}

/** 금병법 (각 무장 전용 병법). 사용자 확인 R-003: 시뮬에는 금병법만 반영 */
export interface Manual {
  name: string;
  text: string;
  /** 번들에서 채움: m-<무장id>-<순번> */
  id?: string;
  /** ok=원문대로, approx=근사, unsupported=미지원(시뮬 제외), missing=엔진 정의 없음 */
  status?: 'ok' | 'approx' | 'unsupported' | 'missing';
  note?: string;
  engine?: ManualEngine;
}

export interface ManualEngine {
  parts?: Array<Record<string, unknown>>;
  static?: { mods?: Record<string, number>; stats?: Record<string, number>; row?: 'front' | 'back' };
  unit?: Record<string, unknown>;
  uniquePatch?: Record<string, unknown>;
}

export interface Clause {
  idx: number;
  text: string;
  /** ok: 엔진 반영, approx: 근사 반영, note: 수식어/설명, missing: 미반영 */
  status: 'ok' | 'approx' | 'note' | 'missing' | 'special';
  impl?: string[];
  /** 사람이 검토해 상태를 고친 경우 그 사유 */
  reviewed?: string;
}

export interface Skill {
  id: string;
  name: LocalName;
  isUnique: boolean;
  ownerGeneralId?: string;
  season: string;
  overseasSeason?: string;
  grade?: string;
  kind: SkillKind | string;
  trait?: string;
  /** 10레벨 기준 발동 확률 (0~1). 범위 표기면 max 를 쓴다 */
  procRate: number | null;
  procRateText?: string;
  /** 한국판 원문 (10레벨) */
  text: string;
  /** 해외 자료 번역문 — 한국판 원문이 없을 때만 표시 */
  overseasText?: string;
  /** 엔진(v1.12b 계승)이 실행하는 효과 정의 */
  engine?: LegacyEngineSkill;
  clauses: Clause[];
  /** 임시값·추정값·해외 번역문을 쓴 항목 (text, kind, procRate, name …) */
  dataStatus?: Record<string, string>;
  sources: SourceRef[];
}

/** v1.12b 엔진이 이해하는 전법 정의 (effects·trigger 등). 효과 언어(AST)로 옮기기 전까지 유지 */
export type LegacyEngineSkill = Record<string, unknown> & {
  raw?: string;
  effects?: Record<string, unknown>;
  clauses?: Array<{ text: string; impl: string[]; status: string }>;
};

export interface Bond {
  id: string;
  name: string;
  required: number;
  memberIds: string[];
  memberNames: string[];
  text: string;
  engine?: Record<string, unknown>;
}

export interface Formation {
  id: string;
  name: string;
  hitRate: { front: number; mid: number; back: number };
  traits: string[];
  engine?: Record<string, unknown>;
}

export interface TierDeckUnit {
  generalId: string;
  generalName: string;
  statPriority: string;
  skillIds: string[];
  skillNames: string[];
  /** 세팅 병법 — 슬롯마다 대안이 있을 수 있음 ("병령/어적") */
  manualSlots: string[][];
  /** 세팅 병법에 적힌 금병법 (번들에서 채움, 없으면 첫 금병법) */
  manualId?: string;
  statCombo: string;
  /** 덱에서 바꾼 병종 (시트의 "좌자(궁병)") */
  unitType?: string;
  /** 전법 칸마다 적힌 대안 ("보보위영/허점공략") */
  skillAlternatives?: Array<Array<{ name: string; id?: string; free?: boolean }>>;
  /** 덱 전체 '대체전법' 줄 — 어느 칸이든 바꿔 넣을 수 있는 전법 */
  swapSkills?: Array<{ name: string; id?: string; free?: boolean }>;
  /** 무장 칸의 대안 ("노숙/손권/서성") */
  generalAlternatives?: string[];
  /** 시트의 병종(세부 병종·전환)·병종특화 — 세부 병종은 시뮬 미반영 */
  troop?: { type: string; spec?: string };
  /** '금·' 표시된 금병법 이름 */
  goldManuals?: string[];
  gear?: { trait?: string; mount?: string };
}

export interface TierDeck {
  id: string;
  season: string;
  tier: string;
  name: string;
  note?: string;
  formation?: string;
  units: TierDeckUnit[];
  /** 시트에서 색칠된 칸 (뜻은 시트 작성자 확인 필요) */
  highlight?: Array<{ field: string; unit: number; color: string }>;
  source: SourceRef;
}

export interface GlossaryTerm {
  category: string;
  term: string;
  desc: string;
}

/** 해외(중국/대만)·deck-lab 표기 → 한국판 표기 */
export interface TermMapping {
  from: string;
  to: string;
  origin?: string;
  confidence: 'confirmed' | 'likely' | 'unverified';
  note?: string;
}

export interface ChangelogEntry {
  id: string;
  date: string;
  season: string;
  category: '신규 무장' | '신규 전법' | '밸런스 조정' | '티어덱' | '전투 규칙' | '데이터 수정' | '엔진' | '기타';
  title: string;
  body: string;
  /** 변경된 데이터 id 목록 (장수/전법 등) */
  refs?: string[];
  source?: string;
  author?: string;
  dataVersion?: string;
  /** 이 업데이트로 바뀐 저장소 파일 */
  files?: string[];
  /** 반영된 커밋 (GitHub 링크용) */
  commit?: string;
}

export interface SeasonInfo {
  id: string;
  label: string;
  status: 'live' | 'upcoming' | 'past';
  note?: string;
}

/** 웹·엔진이 한 번에 읽는 시즌 번들 */
export interface GameBundle {
  dataVersion: string;
  season: string;
  builtAt: string;
  seasons: SeasonInfo[];
  generals: General[];
  skills: Skill[];
  bonds: Bond[];
  formations: Formation[];
  tierDecks: TierDeck[];
  glossary: GlossaryTerm[];
  termMap: TermMapping[];
}
