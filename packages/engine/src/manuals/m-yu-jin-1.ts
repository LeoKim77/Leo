// 우금 금병법〈지군〉 · ok
// 원문: 자신이 받는 피해가 8% 감소하며, 무장 해제 부여 후, 1턴 동안 목표가 주는 피해가 10% 감소한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-yu-jin-1",
  generalId: "yu-jin",
  name: "지군",
  status: "ok",
  clauses: [
    {
      "text": "자신이 받는 피해가 8% 감소하며",
      "status": "ok"
    },
    {
      "text": "무장 해제 부여 후, 1턴 동안 목표가 주는 피해가 10% 감소한다",
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
              "stat": "주는피해",
              "min": -0.1,
              "max": -0.1,
              "target": "trigger_target",
              "duration": 1,
              "maxStacks": 1
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "trigger": {
          "event": "debuff",
          "role": "self_cast",
          "statusName": "무장 해제",
          "chance": 1,
          "maxPerTurn": 9
        }
      }
    ],
    "static": {
      "mods": {
        "받는피해": -0.08
      }
    }
  },
  runs: [
    // parts[0] — 계기 debuff
    (c) => {
      c.buff(0);   // 주는피해 -10%, 대상 trigger_target, 1턴, 최대 1중첩
    },
  ],
});
