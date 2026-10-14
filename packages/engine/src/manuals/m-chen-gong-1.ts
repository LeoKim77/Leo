// 진궁 금병법〈논무〉 · ok
// 원문: 무력이 가장 높은 우군 단일 목표가 추격 전법 발동 성공 후 추격 전법 피해가 2% 증가한다. 최대 10회 중첩된다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-chen-gong-1",
  generalId: "chen-gong",
  name: "논무",
  status: "ok",
  note: "전투 시작 시 무력 최고 우군에게 부여, 추격 발동마다 추격 전법 피해 +2%(최대 10회)",
  clauses: [
    {
      "text": "무력이 가장 높은 우군 단일 목표가 추격 전법 발동 성공 후 추격 전법 피해가 2% 증가한다",
      "status": "ok"
    },
    {
      "text": "최대 10회 중첩된다",
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
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": [],
          "grants": [
            {
              "key": "논무",
              "target": "highest_power_ally",
              "skill": {
                "trigger": {
                  "event": "cast",
                  "castType": "추격",
                  "role": "self",
                  "maxPerTurn": 9
                },
                "effects": {
                  "damage": [],
                  "heal": [],
                  "buffs": [
                    {
                      "stat": "추격전법피해",
                      "min": 0.02,
                      "max": 0.02,
                      "target": "self",
                      "duration": 999,
                      "maxStacks": 10
                    }
                  ],
                  "statMods": [],
                  "statusEffects": [],
                  "targets": []
                }
              }
            }
          ]
        }
      }
    ]
  },
  runs: [
    // parts[0] — 시점 battleStart
    (c) => {
      c.grant(0);   // 「논무」 부여, 대상 highest_power_ally
    },
  ],
});
