// 관우 금병법〈왕예〉 · ok
// 원문: 자신이 책략 피해를 받은 후, 50% 확률로 2턴 동안 자신의 액티브 전법 발동률이 4% 증가하며, 2회 중첩될 수 있다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-guan-yu-1",
  generalId: "guan-yu",
  name: "왕예",
  status: "ok",
  clauses: [
    {
      "text": "자신이 책략 피해를 받은 후, 50% 확률로 2턴 동안 자신의 액티브 전법 발동률이 4% 증가하며",
      "status": "ok"
    },
    {
      "text": "2회 중첩될 수 있다",
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
              "stat": "액티브발동률",
              "min": 0.04,
              "max": 0.04,
              "target": "self",
              "duration": 2,
              "maxStacks": 2
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "trigger": {
          "event": "damage",
          "role": "taken",
          "filterDmgType": "책략",
          "chance": 0.5,
          "maxPerTurn": 9
        }
      }
    ]
  },
  runs: [
    // parts[0] — 계기 damage
    (c) => {
      c.buff(0);   // 액티브발동률 +4%, 대상 self, 2턴, 최대 2중첩
    },
  ],
});
