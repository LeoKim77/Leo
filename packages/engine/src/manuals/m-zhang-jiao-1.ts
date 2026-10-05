// 장각 금병법〈태평도법〉 · ok
// 원문: 액티브 전법 발동 후, 자신의 묘책 확률 및 책략 피해가 4% 증가하며, 최대 6회까지 중첩된다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-zhang-jiao-1",
  generalId: "zhang-jiao",
  name: "태평도법",
  status: "ok",
  clauses: [
    {
      "text": "액티브 전법 발동 후, 자신의 묘책 확률 및 책략 피해가 4% 증가하며",
      "status": "ok"
    },
    {
      "text": "최대 6회까지 중첩된다",
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
              "stat": "묘책",
              "min": 0.04,
              "max": 0.04,
              "target": "self",
              "duration": 999,
              "maxStacks": 6
            },
            {
              "stat": "주는책략피해",
              "min": 0.04,
              "max": 0.04,
              "target": "self",
              "duration": 999,
              "maxStacks": 6
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "trigger": {
          "event": "cast",
          "castType": "액티브",
          "role": "self",
          "chance": 1,
          "maxPerTurn": 9
        }
      }
    ]
  },
  runs: [
    // parts[0] — 계기 cast
    (c) => {
      c.buff(0);   // 묘책 +4%, 대상 self, 전투 종료까지, 최대 6중첩
      c.buff(1);   // 주는책략피해 +4%, 대상 self, 전투 종료까지, 최대 6중첩
    },
  ],
});
