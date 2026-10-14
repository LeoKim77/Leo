// 사마의 금병법〈대략〉 · ok
// 원문: 자신이 받는 피해 5% 감소, 처음으로 포석 4스택/8스택 보유 시 아군 전체 병력을 회복(치유율 80%, 지력의 영향을 받음)한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-sima-yi-1",
  generalId: "sima-yi",
  name: "대략",
  status: "ok",
  note: "매의 응시의 포석이 처음 4스택·8스택이 될 때 아군 전체 회복 80%(지력 영향은 일반 회복 공식대로). 포석 쌓임은 매의 응시 근사(발동마다 1 + 50%로 1) 기준",
  clauses: [
    {
      "text": "자신이 받는 피해 5% 감소",
      "status": "ok"
    },
    {
      "text": "처음으로 포석 4스택/8스택 보유 시 아군 전체 병력을 회복(치유율 80%, 지력의 영향을 받음)한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "mods": {
        "받는피해": -0.05
      }
    },
    "unit": {
      "_stackHeal": {
        "key": "포석",
        "thresholds": [
          4,
          8
        ],
        "ratio": 0.8
      }
    }
  },
});
