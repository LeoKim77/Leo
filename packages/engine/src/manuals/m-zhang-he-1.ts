// 장합 금병법〈임기응변〉 · ok
// 원문: 무력이 15포인트 증가하며, 액티브 전법 발동률이 3% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-zhang-he-1",
  generalId: "zhang-he",
  name: "임기응변",
  status: "ok",
  clauses: [
    {
      "text": "무력이 15포인트 증가하며",
      "status": "ok"
    },
    {
      "text": "액티브 전법 발동률이 3% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "stats": {
        "무력": 15
      },
      "mods": {
        "액티브발동률": 0.03
      }
    }
  },
});
