// 방덕 금병법〈상마〉 · ok
// 원문: 아군의 기병 무력과 선공이 20포인트 증가한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-pang-de-2",
  generalId: "pang-de",
  name: "상마",
  status: "ok",
  clauses: [
    {
      "text": "아군의 기병 무력과 선공이 20포인트 증가한다",
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
          "statMods": [
            {
              "stat": "무력",
              "min": 20,
              "max": 20,
              "target": "all_ally",
              "duration": 999,
              "maxStacks": 1,
              "condition": {
                "type": "unitType",
                "who": "target",
                "value": "기병"
              }
            },
            {
              "stat": "선공",
              "min": 20,
              "max": 20,
              "target": "all_ally",
              "duration": 999,
              "maxStacks": 1,
              "condition": {
                "type": "unitType",
                "who": "target",
                "value": "기병"
              }
            }
          ],
          "statusEffects": [],
          "targets": []
        },
        "_timing": "battleStart"
      }
    ]
  },
  runs: [
    // parts[0] — 시점 battleStart
    (c) => {
      c.statMod(0);   // 무력 20, 대상 all_ally, 전투 종료까지, 최대 1중첩, 조건 unitType
      c.statMod(1);   // 선공 20, 대상 all_ally, 전투 종료까지, 최대 1중첩, 조건 unitType
    },
  ],
});
