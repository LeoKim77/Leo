// 서서 금병법〈장검행〉 · ok
// 원문: 전투 시작 시, 자신의 무력이 지력의 25%만큼 증가하며, 책략 피해를 준 후, 다음에 주는 병기 피해가 40% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-xu-shu-1",
  generalId: "xu-shu",
  name: "장검행",
  status: "ok",
  note: "무력 +지력×25%(편성 시), 책략 피해 후 다음 병기 피해 +40%(FEAT-015)",
  clauses: [
    {
      "text": "전투 시작 시, 자신의 무력이 지력의 25%만큼 증가하며",
      "status": "ok"
    },
    {
      "text": "책략 피해를 준 후, 다음에 주는 병기 피해가 40% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "unit": {
      "statFromStat": {
        "stat": "무력",
        "from": "지력",
        "ratio": 0.25
      },
      "_strategyThenPhys": 0.4
    }
  },
});
