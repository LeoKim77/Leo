// 유비 금병법〈국지한서〉 · ok
// 원문: 아군이 국가 진영 보너스를 활성화하지 않았으면 아군 전체의 진영 보너스-촉이 100% 적용된다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-liu-bei-1",
  generalId: "liu-bei",
  name: "국지한서",
  status: "ok",
  note: "진영 보너스가 없으면 3명 진영 보너스(전 속성 +10%)를 적용",
  clauses: [
    {
      "text": "아군이 국가 진영 보너스를 활성화하지 않았으면 아군 전체의 진영 보너스-촉이 100% 적용된다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "unit": {
      "_factionOverride": "촉"
    }
  },
});
