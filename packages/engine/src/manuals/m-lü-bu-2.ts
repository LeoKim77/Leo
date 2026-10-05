// 여포 금병법〈무쌍〉 · ok
// 원문: 받는 병기 피해가 5% 감소하며, 반격률이 20% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-lü-bu-2",
  generalId: "lü-bu",
  name: "무쌍",
  status: "ok",
  clauses: [
    {
      "text": "받는 병기 피해가 5% 감소하며",
      "status": "ok"
    },
    {
      "text": "반격률이 20% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "mods": {
        "받는병기피해": -0.05,
        "반격확률": 0.2
      }
    }
  },
});
