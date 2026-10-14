// 정욱 금병법〈지용〉 · ok
// 원문: 고유 전법 발동률이 5% 증가하고, 탈주병 수량이 30% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-cheng-yu-1",
  generalId: "cheng-yu",
  name: "지용",
  status: "ok",
  clauses: [
    {
      "text": "고유 전법 발동률이 5% 증가하고",
      "status": "ok"
    },
    {
      "text": "탈주병 수량이 30% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "mods": {
        "탈주병증가": 0.3
      }
    },
    "unit": {
      "uniqueProcAdd": 0.05
    }
  },
});
