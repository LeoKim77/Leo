// 전위 금병법〈어전〉 · ok
// 원문: 자신의 방어 관통이 7%, 반격 피해가 10% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-dian-wei-2",
  generalId: "dian-wei",
  name: "어전",
  status: "ok",
  clauses: [
    {
      "text": "자신의 방어 관통이 7%",
      "status": "ok"
    },
    {
      "text": "반격 피해가 10% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "mods": {
        "방어관통": 0.07,
        "반격피해": 0.1
      }
    }
  },
});
