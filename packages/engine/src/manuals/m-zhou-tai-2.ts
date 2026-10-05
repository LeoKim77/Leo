// 주태 금병법〈역전〉 · ok
// 원문: 우군을 대신해 피해를 받은 후, 해당 우군의 다음 피해가 20% 증가하며, 해당 피해의 50%만큼 주태의 병력이 회복된다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-zhou-tai-2",
  generalId: "zhou-tai",
  name: "역전",
  status: "ok",
  note: "대신 받아 준 우군의 다음 피해 +20%, 그 피해의 50%만큼 주태 회복(전보: 회복 177~222)",
  clauses: [
    {
      "text": "우군을 대신해 피해를 받은 후, 해당 우군의 다음 피해가 20% 증가하며",
      "status": "ok"
    },
    {
      "text": "해당 피해의 50%만큼 주태의 병력이 회복된다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "unit": {
      "_guardReversal": {
        "bonus": 0.2,
        "healRatio": 0.5
      }
    }
  },
});
