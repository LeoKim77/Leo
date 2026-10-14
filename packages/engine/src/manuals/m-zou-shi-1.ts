// 추씨 금병법〈세속〉 · ok
// 원문: 고유 전법 눈부신 자태의 눈짓 효과가 추가로 자신 지력의 영향을 받으며, 회복 효과 계수가 20% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-zou-shi-1",
  generalId: "zou-shi",
  name: "세속",
  status: "ok",
  note: "눈짓 −16%에 추씨 지력 영향, 4턴부터 회복 140% → 168%",
  revised: [
    {
      "date": "2026-10-05",
      "note": "눈짓(받는 피해 −16% 3종)에 추씨 지력 영향 반영"
    }
  ],
  clauses: [
    {
      "text": "고유 전법 눈부신 자태의 눈짓 효과가 추가로 자신 지력의 영향을 받으며",
      "status": "ok"
    },
    {
      "text": "회복 효과 계수가 20% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "uniquePatch": {
      "effects.buffs.0.inf": {
        "stats": [
          "지력"
        ],
        "who": "self"
      },
      "effects.buffs.1.inf": {
        "stats": [
          "지력"
        ],
        "who": "self"
      },
      "effects.buffs.2.inf": {
        "stats": [
          "지력"
        ],
        "who": "self"
      },
      "parts.1.effects.heal.0.min": 1.68,
      "parts.1.effects.heal.0.max": 1.68,
      "_keepTiming": true
    }
  },
});
