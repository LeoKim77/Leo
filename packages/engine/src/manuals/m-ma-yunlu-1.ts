// 마운록 금병법〈풍속통의〉 · ok
// 원문: 아군 기병의 최고 속성이 5% 증가한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-ma-yunlu-1",
  generalId: "ma-yunlu",
  name: "풍속통의",
  status: "ok",
  note: "무장 기본 병종이 기병인 아군(자신 포함)의 최고 속성 +5%",
  clauses: [
    {
      "text": "아군 기병의 최고 속성이 5% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "unit": {
      "allyTypeHighestPct": {
        "unitType": "기병",
        "pct": 0.05
      }
    }
  },
});
