// 하후돈 금병법〈위협〉 · ok
// 원문: 고유 전법 강렬의 피해 감소 효과가 10% 증가한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-xiahou-dun-1",
  generalId: "xiahou-dun",
  name: "위협",
  status: "ok",
  note: "강렬 피해 감소 30% → 40%(+10%p, R-047)",
  revised: [
    {
      "date": "2026-10-05",
      "note": "R-047: 고정 상태 수치는 합연산 — 강렬 피해 감소 30% → 40% 확정"
    }
  ],
  clauses: [
    {
      "text": "고유 전법 강렬의 피해 감소 효과가 10% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "uniquePatch": {
      "effects.buffs.0.min": -0.4,
      "effects.buffs.0.max": -0.4
    }
  },
});
