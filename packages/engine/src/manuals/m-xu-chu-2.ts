// 허저 금병법〈전서〉 · ok
// 원문: 전투 시작 후 3턴 동안 자신의 회심 확률이 15% 증가한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-xu-chu-2",
  generalId: "xu-chu",
  name: "전서",
  status: "ok",
  clauses: [
    {
      "text": "전투 시작 후 3턴 동안 자신의 회심 확률이 15% 증가한다",
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
              "stat": "회심",
              "min": 0.15,
              "max": 0.15,
              "target": "self",
              "duration": 3,
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
      c.buff(0);   // 회심 +15%, 대상 self, 3턴, 최대 1중첩
    },
  ],
});
