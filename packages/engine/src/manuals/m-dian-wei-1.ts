// 전위 금병법〈절무〉 · ok
// 원문: 자신의 무력이 10포인트 증가하며, 반격 피해가 20% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-dian-wei-1",
  generalId: "dian-wei",
  name: "절무",
  status: "ok",
  clauses: [
    {
      "text": "자신의 무력이 10포인트 증가하며",
      "status": "ok"
    },
    {
      "text": "반격 피해가 20% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "stats": {
        "무력": 10
      },
      "mods": {
        "반격피해": 0.2
      }
    }
  },
});
