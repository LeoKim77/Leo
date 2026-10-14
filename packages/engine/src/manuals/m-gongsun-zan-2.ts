// 공손찬 금병법〈백마의종〉 · ok
// 원문: 매번 피신 후 자신의 무력과 지력이 증가하며, 증가 수치는 선공의 2%로 최대 8회 중첩된다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-gongsun-zan-2",
  generalId: "gongsun-zan",
  name: "백마의종",
  status: "ok",
  note: "피신 시점의 선공 기준",
  clauses: [
    {
      "text": "매번 피신 후 자신의 무력과 지력이 증가하며",
      "status": "ok"
    },
    {
      "text": "증가 수치는 선공의 2%로 최대 8회 중첩된다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "unit": {
      "_evadeGrowth": {
        "ratio": 0.02,
        "max": 8,
        "stats": [
          "무력",
          "지력"
        ]
      }
    }
  },
});
