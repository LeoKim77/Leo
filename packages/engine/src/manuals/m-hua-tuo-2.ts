// 화타 금병법〈오금희〉 · ok
// 원문: 4번째 턴부터 매 턴 시작 시, 전체 아군이 25% 확률로 1스택의 방어를 획득한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-hua-tuo-2",
  generalId: "hua-tuo",
  name: "오금희",
  status: "ok",
  clauses: [
    {
      "text": "4번째 턴부터 매 턴 시작 시, 전체 아군이 25% 확률로 1스택의 방어를 획득한다",
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
          "statusEffects": [
            {
              "name": "방어",
              "target": "all_ally",
              "chance": 0.25,
              "duration": 99
            }
          ],
          "targets": []
        },
        "_timing": "turnStart",
        "onlyTurns": [
          4,
          5,
          6,
          7,
          8
        ]
      }
    ]
  },
  runs: [
    // parts[0] — 시점 turnStart
    (c) => {
      c.status(0);   // 방어, 대상 all_ally, 확률 25%, 99턴
    },
  ],
});
