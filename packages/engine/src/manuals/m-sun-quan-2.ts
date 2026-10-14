// 손권 금병법〈후주〉 · ok
// 원문: 짝수 턴에 자신이 행동하기 전, 자신의 디버프 상태 1가지를 랜덤으로 제거한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-sun-quan-2",
  generalId: "sun-quan",
  name: "후주",
  status: "ok",
  clauses: [
    {
      "text": "짝수 턴에 자신이 행동하기 전, 자신의 디버프 상태 1가지를 랜덤으로 제거한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": [],
          "dispel": [
            {
              "target": "self",
              "count": 1
            }
          ]
        },
        "_timing": "action",
        "onlyTurns": [
          2,
          4,
          6,
          8
        ]
      }
    ]
  },
  runs: [
    // parts[0] — 시점 action
    (c) => {
      c.dispel(0);   // 디버프 1가지 제거, 대상 self
    },
  ],
});
