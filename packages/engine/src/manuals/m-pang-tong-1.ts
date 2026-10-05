// 방통 금병법〈책략〉 · approx
// 원문: 고유 전법 연환계가 모든 턴 동안 전달되는 것으로 변경된다. 단, 전달 효과의 퍼센트가 12% 감소한다.
// 원문 절 구현: ok / note / approx
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-pang-tong-1",
  generalId: "pang-tong",
  name: "책략",
  status: "approx",
  note: "연환계의 연환이 홀수 턴 → 모든 턴, 전달 비율 25% → 22%(12% 감소를 ×0.88로 해석 — 25%−12%p=13% 일 수도 있어 검증 대기)",
  revised: [
    {
      "date": "2026-10-05",
      "note": "연환 구현(FEAT-024)으로 사용 가능: 연환계 연환을 모든 턴 부여, 전달 비율 25% → 22%(×0.88)"
    }
  ],
  clauses: [
    {
      "text": "고유 전법 연환계가 모든 턴 동안 전달되는 것으로 변경된다",
      "status": "ok"
    },
    {
      "text": "단",
      "status": "note"
    },
    {
      "text": "전달 효과의 퍼센트가 12% 감소한다",
      "status": "approx"
    }
  ],
  def: {
    "parts": [],
    "uniquePatch": {
      "effects.statusEffects.0.turnCond": null,
      "effects.statusEffects.0.data": {
        "ratio": 0.22
      },
      "_keepTiming": true
    }
  },
});
