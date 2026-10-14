// 곽가 금병법〈십승론〉 · ok
// 원문: 받는 액티브 전법 피해와 추격 전법 피해가 12% 감소한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-guo-jia-1",
  generalId: "guo-jia",
  name: "십승론",
  status: "ok",
  clauses: [
    {
      "text": "받는 액티브 전법 피해와 추격 전법 피해가 12% 감소한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "mods": {
        "받는액티브피해": -0.12,
        "받는추격피해": -0.12
      }
    }
  },
});
