// 문추 금병법〈무·하〉 · ok
// 원문: 자신과 무력이 가장 높은 우군의 추격 전법 발동 후, 2턴 동안 받는 피해가 7% 감소하며, 2회 중첩될 수 있다.
// 원문 절 구현: ok / ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-wen-chou-1",
  generalId: "wen-chou",
  name: "무·하",
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
      "text": "2턴 동안 받는 피해가 7% 감소하며",
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
              "stat": "받는피해",
              "min": -0.07,
              "max": -0.07,
              "target": "trigger_attacker",
              "duration": 2,
              "maxStacks": 2
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
      c.buff(0);   // 받는피해 -7%, 대상 trigger_attacker, 2턴, 최대 2중첩
    },
  ],
});
