// 손상향 금병법〈무녀전〉 · ok
// 원문: 자신이 주는 피해가 5% 증가하며, 연타율이 12% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-sun-shangxiang-1",
  generalId: "sun-shangxiang",
  name: "무녀전",
  status: "ok",
  clauses: [
    {
      "text": "자신이 주는 피해가 5% 증가하며",
      "status": "ok"
    },
    {
      "text": "연타율이 12% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "mods": {
        "주는피해": 0.05,
        "연타확률": 0.12
      }
    }
  },
});
