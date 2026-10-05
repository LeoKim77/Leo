// 마초 금병법〈철기령〉 · ok
// 원문: 회심 확률이 6%, 회심 피해가 10% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-ma-chao-1",
  generalId: "ma-chao",
  name: "철기령",
  status: "ok",
  clauses: [
    {
      "text": "회심 확률이 6%",
      "status": "ok"
    },
    {
      "text": "회심 피해가 10% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "mods": {
        "회심": 0.06,
        "회심피해": 0.1
      }
    }
  },
});
