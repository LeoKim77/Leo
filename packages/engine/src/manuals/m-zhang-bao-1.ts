// 장보 금병법〈태평도법〉 · ok
// 원문: 전체 적군이 요술 상태를 받은 후, 2턴 동안 받는 액티브 전법 피해가 10% 증가한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-zhang-bao-1",
  generalId: "zhang-bao",
  name: "태평도법",
  status: "ok",
  clauses: [
    {
      "text": "전체 적군이 요술 상태를 받은 후, 2턴 동안 받는 액티브 전법 피해가 10% 증가한다",
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
              "min": 0.1,
              "max": 0.1,
              "target": "trigger_target",
              "duration": 2,
              "maxStacks": 1
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "trigger": {
          "event": "debuff",
          "role": "ally_side",
          "statusName": "요술",
          "chance": 1,
          "maxPerTurn": 9
        }
      }
    ]
  },
  runs: [
    // parts[0] — 계기 debuff
    (c) => {
      c.buff(0);   // 받는액티브피해 +10%, 대상 trigger_target, 2턴, 최대 1중첩
    },
  ],
});
