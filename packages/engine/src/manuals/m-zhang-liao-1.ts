// 장료 금병법〈기전〉 · ok
// 원문: 자신이 전열이면 회유가 12% 증가하며, 주는 피해가 5% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-zhang-liao-1",
  generalId: "zhang-liao",
  name: "기전",
  status: "ok",
  note: "진형 칸이 전열일 때만 적용",
  clauses: [
    {
      "text": "자신이 전열이면 회유가 12% 증가하며",
      "status": "ok"
    },
    {
      "text": "주는 피해가 5% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "row": "front",
      "mods": {
        "회유": 0.12,
        "주는피해": 0.05
      }
    }
  },
});
