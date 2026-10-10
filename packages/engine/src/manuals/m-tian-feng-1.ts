// 전풍 금병법〈권략〉 · ok
// 원문: 고유 전법 발동률이 10% 증가한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-tian-feng-1",
  generalId: "tian-feng",
  name: "권략",
  status: "ok",
  note: "지략 방어 발동률 60% → 70%",
  clauses: [
    {
      "text": "고유 전법 발동률이 10% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "unit": {
      "uniqueProcAdd": 0.1
    }
  },
});
