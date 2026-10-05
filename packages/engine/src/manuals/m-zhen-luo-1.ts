// 견희 금병법〈낙신부 상권〉 · ok
// 원문: 고유 전법 바람과 눈꽃의 낙수의 여신 효과가 지력이 가장 높은 단일 목표를 우선적으로 선택하고, 낙수의 여신 회복 효과가 10% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-zhen-luo-1",
  generalId: "zhen-luo",
  name: "낙신부 상권",
  status: "ok",
  note: "낙수의 여신 → 지력이 가장 높은 우군 우선, 여신 회복 140% → 154%",
  revised: [
    {
      "date": "2026-10-05",
      "note": "낙수의 여신 대상 = 지력 최고 우군(고유 전법 함수 goddessPick), 회복 +10%는 여신 회복(heal[1])에만 — 예전엔 견희 자신 회복에도 붙고 대상 지정이 안 먹었다"
    }
  ],
  clauses: [
    {
      "text": "고유 전법 바람과 눈꽃의 낙수의 여신 효과가 지력이 가장 높은 단일 목표를 우선적으로 선택하고",
      "status": "ok"
    },
    {
      "text": "낙수의 여신 회복 효과가 10% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "uniquePatch": {
      "goddessPick": "지력",
      "effects.heal.1.min": 0.77,
      "effects.heal.1.max": 1.54
    }
  },
});
