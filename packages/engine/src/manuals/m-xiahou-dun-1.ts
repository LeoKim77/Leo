// 하후돈 금병법〈위협〉 · approx
// 원문: 고유 전법 강렬의 피해 감소 효과가 10% 증가한다.
// 원문 절 구현: approx
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-xiahou-dun-1",
  generalId: "xiahou-dun",
  name: "위협",
  status: "approx",
  note: "강렬 피해 감소 30% → 40%(+10%p로 해석, ×1.1 이면 33%)",
  clauses: [
    {
      "text": "고유 전법 강렬의 피해 감소 효과가 10% 증가한다",
      "status": "approx"
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
