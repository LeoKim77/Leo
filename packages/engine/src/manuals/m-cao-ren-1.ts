// 조인 금병법〈수도〉 · ok
// 원문: 아군 전체가 받는 액티브 전법 피해가 12% 감소한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-cao-ren-1",
  generalId: "cao-ren",
  name: "수도",
  status: "ok",
  clauses: [
    {
      "text": "아군 전체가 받는 액티브 전법 피해가 12% 감소한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [
            {
              "stat": "받는액티브피해",
              "min": -0.12,
              "max": -0.12,
              "target": "all_ally",
              "duration": 999,
              "maxStacks": 1
            }
          ],
          "statMods": [],
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
      c.buff(0);   // 받는액티브피해 -12%, 대상 all_ally, 전투 종료까지, 최대 1중첩
    },
  ],
});
