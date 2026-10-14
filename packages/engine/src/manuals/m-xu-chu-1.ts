// 허저 금병법〈정남권종〉 · ok
// 원문: 추격 전법 발동률이 5% 증가하며, 추격 전법 피해가 12% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-xu-chu-1",
  generalId: "xu-chu",
  name: "정남권종",
  status: "ok",
  clauses: [
    {
      "text": "추격 전법 발동률이 5% 증가하며",
      "status": "ok"
    },
    {
      "text": "추격 전법 피해가 12% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "mods": {
        "추격발동률": 0.05,
        "추격전법피해": 0.12
      }
    }
  },
});
