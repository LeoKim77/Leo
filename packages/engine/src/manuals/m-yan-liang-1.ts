// 안량 금병법〈무·상〉 · ok
// 원문: 자신과 무력이 가장 높은 우군의 추격 전법 발동 후, 2턴 동안 피해가 10% 증가하고, 방어 관통이 6% 증가한다.
// 원문 절 구현: ok / ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-yan-liang-1",
  generalId: "yan-liang",
  name: "무·상",
  status: "ok",
  revised: [
    {
      "date": "2026-10-05",
      "note": "'자신과 무력이 가장 높은 우군'의 우군 몫은 자신 제외(highest_power_friend) — 예전엔 자신이 무력 최고면 우군 몫이 사라졌다"
    }
  ],
  clauses: [
    {
      "text": "자신과 무력이 가장 높은 우군의 추격 전법 발동 후",
      "status": "ok"
    },
    {
      "text": "2턴 동안 피해가 10% 증가하고",
      "status": "ok"
    },
    {
      "text": "방어 관통이 6% 증가한다",
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
              "min": 0.1,
              "max": 0.1,
              "target": "trigger_attacker",
              "duration": 2,
              "maxStacks": 1
            },
            {
              "stat": "방어관통",
              "min": 0.06,
              "max": 0.06,
              "target": "trigger_attacker",
              "duration": 2,
              "maxStacks": 1
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "trigger": {
          "event": "cast",
          "castType": "추격",
          "casterIs": [
            "self",
            "highest_power_friend"
          ],
          "chance": 1,
          "maxPerTurn": 9
        }
      }
    ]
  },
  runs: [
    // parts[0] — 계기 cast
    (c) => {
      c.buff(0);   // 주는피해 +10%, 대상 trigger_attacker, 2턴, 최대 1중첩
      c.buff(1);   // 방어관통 +6%, 대상 trigger_attacker, 2턴, 최대 1중첩
    },
  ],
});
