// 원소 금병법〈세가〉 · ok
// 원문: 아군이 국가 진영 보너스를 활성화하지 않았으면 아군 전체의 진영 보너스-군이 100% 적용된다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-yuan-shao-1",
  generalId: "yuan-shao",
  name: "세가",
  status: "ok",
  clauses: [
    {
      "text": "아군이 국가 진영 보너스를 활성화하지 않았으면 아군 전체의 진영 보너스-군이 100% 적용된다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "unit": {
      "_factionOverride": "군"
    }
  },
});
