// 법정 금병법〈문도〉 · ok
// 원문: 전투 시작 시 4턴 동안 전체 적군의 병기 피해가 10% 감소한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-fa-zheng-1",
  generalId: "fa-zheng",
  name: "문도",
  status: "ok",
  clauses: [
    {
      "text": "전투 시작 시 4턴 동안 전체 적군의 병기 피해가 10% 감소한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "_timing": "battleStart",
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [
            {
              "stat": "주는병기피해",
              "min": -0.1,
              "max": -0.1,
              "target": "all_enemy",
              "duration": 4,
              "maxStacks": 1
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        }
      }
    ]
  },
  runs: [
    // parts[0] — 시점 battleStart
    (c) => {
      c.buff(0);   // 주는병기피해 -10%, 대상 all_enemy, 4턴, 최대 1중첩
    },
  ],
});
