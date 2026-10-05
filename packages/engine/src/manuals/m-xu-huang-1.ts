// 서황 금병법〈파군〉 · ok
// 원문: 액티브 전법 피해가 6% 증가하며, 방어 관통이 6% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-xu-huang-1",
  generalId: "xu-huang",
  name: "파군",
  status: "ok",
  clauses: [
    {
      "text": "액티브 전법 피해가 6% 증가하며",
      "status": "ok"
    },
    {
      "text": "방어 관통이 6% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "mods": {
        "주는액티브피해": 0.06,
        "방어관통": 0.06
      }
    }
  },
});
