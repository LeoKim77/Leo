// 황월영 금병법〈천공비록〉 · ok
// 원문: 홀수 턴에 지력이 가장 높은 우군이 첫 피해를 받은 후, 피해를 준 대상에게 100% 책략 피해를 가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-huang-yueying-2",
  generalId: "huang-yueying",
  name: "천공비록",
  status: "ok",
  clauses: [
    {
      "text": "홀수 턴에 지력이 가장 높은 우군이 첫 피해를 받은 후",
      "status": "ok"
    },
    {
      "text": "피해를 준 대상에게 100% 책략 피해를 가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "effects": {
          "damage": [
            {
              "dmgType": "책략",
              "min": 1,
              "max": 1,
              "target": "trigger_attacker",
              "turnCond": {
                "parity": "odd"
              }
            }
          ],
          "heal": [],
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "trigger": {
          "event": "damage",
          "role": "ally_taken",
          "requireDefenderIs": "highest_intel_ally",
          "chance": 1,
          "maxPerTurn": 1
        }
      }
    ]
  },
  runs: [
    // parts[0] — 계기 damage
    (c) => {
      c.damage(0);   // 책략 100%, 대상 trigger_attacker
    },
  ],
});
