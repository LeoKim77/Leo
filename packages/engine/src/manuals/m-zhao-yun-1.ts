// 조운 금병법〈신용〉 · ok
// 원문: 자신의 피신 확률과 회유가 5% 증가한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-zhao-yun-1",
  generalId: "zhao-yun",
  name: "신용",
  status: "ok",
  clauses: [
    {
      "text": "자신의 피신 확률과 회유가 5% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "mods": {
        "피신": 0.05,
        "회유": 0.05
      }
    }
  },
});
