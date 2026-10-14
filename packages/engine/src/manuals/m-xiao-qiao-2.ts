// 소교 금병법〈공근신〉 · ok
// 원문: 고유 전법 천향의 발동률이 15% 증가하고, 회복 효과는 50% 감소한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-xiao-qiao-2",
  generalId: "xiao-qiao",
  name: "공근신",
  status: "ok",
  clauses: [
    {
      "text": "고유 전법 천향의 발동률이 15% 증가하고",
      "status": "ok"
    },
    {
      "text": "회복 효과는 50% 감소한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "unit": {
      "uniqueProcAdd": 0.15
    },
    "uniquePatch": {
      "effects.heal.0.min": 0.625,
      "effects.heal.0.max": 1.25
    }
  },
});
