// 공손찬 금병법〈서좌〉 · ok
// 원문: 추격 전법 발동률이 7% 증가한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-gongsun-zan-1",
  generalId: "gongsun-zan",
  name: "서좌",
  status: "ok",
  clauses: [
    {
      "text": "추격 전법 발동률이 7% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "mods": {
        "추격발동률": 0.07
      }
    }
  },
});
