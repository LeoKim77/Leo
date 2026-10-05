// 금병법 함수 공용 타입.
// 금병법 하나 = 파일 하나(packages/engine/src/manuals/<id>.ts). 전법 함수(skills/types.ts)와 같은 방식이다.
//   def    — 엔진 정의. parts(패시브 전법처럼 붙는 효과)·static(편성 시 고정 증감)·unit(무장 속성)·uniquePatch(고유 전법 수정)
//   clauses — 한국판 원문 절마다 구현 상태
//   runs   — parts[i] 를 실행하는 함수(같은 번호). 공용 부품 c.* 를 원문 순서대로 부른다
import type { SkillApi, SkillClause } from '../skills/types.ts';

export interface ManualModule {
  /** 파일 이름 = 번들의 금병법 id (m-<무장 id>-<번호>) */
  id: string;
  generalId: string;
  name: string;
  /** ok=원문대로 · approx=근사 · unsupported=미지원(시뮬 제외) */
  status: 'ok' | 'approx' | 'unsupported';
  note?: string;
  clauses: SkillClause[];
  def: {
    parts?: any[];
    static?: Record<string, any>;
    unit?: Record<string, any>;
    uniquePatch?: Record<string, any>;
  };
  /** 생성 뒤 원문대로 손본 기록 — 있으면 JSON 원천과의 동등성 검사에서 뺀다 */
  revised?: Array<{ date: string; note: string }>;
  runs?: Array<((c: SkillApi) => void) | null>;
}

export const defineManual = (m: ManualModule): ManualModule => m;
