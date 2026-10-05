// 감부인 금병법〈한녀전〉 · ok
// 원문: 피신 확률이 14% 증가한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-gan-furen-1",
  generalId: "gan-furen",
  name: "한녀전",
  status: "ok",
  clauses: [
    {
      "text": "피신 확률이 14% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "mods": {
        "피신": 0.14
      }
    }
  },
});
