// 전법 함수 공용 타입.
// 전법 하나 = 파일 하나(packages/engine/src/skills/<id>.ts). 파일에는
//   def     — 엔진 정의(발동 시점·트리거·대상·효과 항목). 감사·웹 데이터도 이것을 쓴다.
//   clauses — 한국판 원문 절마다 구현 상태와 그 절을 구현한 효과 항목(damage[0] 등)
//   run(c)  — 실제 실행 순서. 공용 규칙(docs/COMMON_RULES.md)이 구현된 부품 c.* 를 원문 순서대로 부른다.
// 부품 인자는 def.effects 의 항목 번호(c.damage(0))나 항목 객체(c.damage({ dmgType: '책략', min: 1, max: 2 })) 둘 다 된다.

/** 전법 실행 부품 — 엔진(core.js __applySkillEffectsImpl)이 공용 규칙대로 구현 */
export interface SkillApi {
  /** 시전 무장(엔진 내부 유닛) */
  unit: any;
  skill: any;
  turn: number;
  allUnits: any[];
  /** 트리거로 발동했을 때의 사건 정보(attacker·defender·caster·target) */
  eventCtx?: any;
  log: string[];
  /** 능력치 증감 (def.effects.statMods) */
  statMod(item: number | object): void;
  /** 피해 — 병기/책략·대상·확률·스탯 영향 등은 항목에 (def.effects.damage) */
  damage(item: number | object): void;
  /** 회복 (def.effects.heal) */
  heal(item: number | object): void;
  /** 증감 버프·디버프 (def.effects.buffs) */
  buff(item: number | object): void;
  /** 디버프 제거 (def.effects.dispel) */
  dispel(item: number | object): void;
  /** 상태 부여 — 조롱·혼란·방어 등 (def.effects.statusEffects) */
  status(item: number | string | object): void;
  /** 효과 부여(받은 무장이 직접 발동하는 효과) (def.effects.grants) */
  grant(item: number | object): void;
  /** 보호 상태(대신 받기) — def.effects.guardAllies */
  guard(): void;
  /** 대상 코드로 대상 고르기 (random_enemy_n·all_ally 등 — 혼란·조롱 규칙 포함) */
  targets(code: string): any[];
  has(u: any, status: string): boolean;
  /** 확률 판정 1회 */
  chance(p: number): boolean;
  /** 상태 감소까지 반영한 현재 스탯 */
  stat(u: any, key: '무력' | '지력' | '통솔' | '선공'): number;
}

export interface SkillClause {
  text: string;
  status: 'ok' | 'approx' | 'note' | 'special' | 'missing';
  impl?: string[];
  reviewed?: string;
}

export interface SkillModule {
  id: string;
  name: string;
  kind: string;
  isUnique: boolean;
  /** 엔진 정의 — 없으면(null) 아직 구현 전 */
  def: Record<string, any> | null;
  /** 직접 작성 전법의 상태(ok/approx/unsupported)·메모 */
  engineStatus?: { status: string; note?: string; source: string };
  clauses: SkillClause[];
  /** 생성 뒤 원문대로 손본 기록 — 있으면 JSON 원천과의 동등성 검사에서 뺀다 */
  revised?: Array<{ date: string; note: string }>;
  run?: (c: SkillApi) => void;
}

export const defineSkill = (m: SkillModule): SkillModule => m;
