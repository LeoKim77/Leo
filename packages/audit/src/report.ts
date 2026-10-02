export type Level = 'pass' | 'warn' | 'fail' | 'skip';

export interface CheckResult {
  rule: string;
  /** 사람이 읽는 규칙 이름 */
  title: string;
  level: Level;
  message: string;
  /** 근거: 수치, 전보 예시 등 */
  evidence?: string[];
}

export interface SkillAudit {
  id: string;
  name: string;
  kind: string;
  isUnique: boolean;
  owner?: string;
  season: string;
  checks: CheckResult[];
  /** 동적 감사 표본 */
  sample?: { battles: number; fired: number; rolls: number; rollOk: number };
  worst: Level;
}

export interface GeneralAudit {
  id: string;
  name: string;
  season: string;
  checks: CheckResult[];
  worst: Level;
}

export interface ManualAudit {
  id: string;
  generalId: string;
  general: string;
  name: string;
  status: string;
  note?: string;
  checks: CheckResult[];
  sample?: { battles: number; fired: number };
  worst: Level;
}

export interface AuditReport {
  generatedAt: string;
  dataVersion: string;
  engine: string;
  battles: number;
  summary: Record<Level, number>;
  ruleSummary: Array<{ rule: string; title: string; pass: number; warn: number; fail: number; skip: number }>;
  engineRules: CheckResult[];
  skills: SkillAudit[];
  generals: GeneralAudit[];
  manuals?: ManualAudit[];
}

const RANK: Record<Level, number> = { skip: 0, pass: 1, warn: 2, fail: 3 };
export function worstOf(levels: Level[]): Level {
  return levels.reduce<Level>((w, l) => (RANK[l] > RANK[w] ? l : w), 'skip');
}

export const RULE_TITLES: Record<string, string> = {
  'S01-engine-def': '엔진 효과 정의 존재',
  'S02-kind': '전법 유형 일치 (원문 vs 엔진)',
  'S03-proc-rate': '발동 확률 일치 (원문 vs 엔진)',
  'S04-numbers': '원문 수치 일치 (한국판 vs 엔진 원문)',
  'S05-coverage': '원문 절 반영률',
  'S06-timing': '발동 시점 해석 일치',
  'S07-terms': '한국판 용어 사용',
  'S08-owner': '고유 전법 ↔ 무장 연결',
  'S09-level': '레벨 보간 방향 (1→10레벨)',
  'D01-fires': '실전 발동 여부',
  'D02-phase': '발동 시점 준수',
  'D03-turns': '특정 턴 조건 준수',
  'D04-proc': '발동 확률 실측',
  'D05-effects': '원문 효과 실제 발생',
  'D06-targets': '대상 수',
  'D07-limit': '턴당 발동 횟수 상한',
  'M01-def': '금병법 엔진 정의',
  'M02-fires': '금병법 실전 발동',
  'M03-effects': '금병법 원문 효과 발생',
  'G01-stats': '무장 스탯 존재',
  'G02-unique': '고유 전법 존재',
  'E01-silence': '액티브 봉쇄 상태(침묵·공포 등)에서 액티브 미발동',
  'E02-disarm': '일반 공격 봉쇄 상태(무장 해제·공포 등)에서 일반 공격 없음',
  'E03-pursuit': '추격은 일반 공격 후에만',
  'E04-one-roll': '액티브 확률 판정은 행동당 1회',
  'E05-dead': '전사한 무장은 행동하지 않음',
};
