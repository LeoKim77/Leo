// 문무겸비 · 전법 · 액티브 65%
// 원문: 무력이 가장 높은 적군 단일 목표에게 220%의 책략 피해를 주며, 지력이 가장 높은 적군 단일 목표에게 220%의 병기 피해를 준다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "civil-military",
  name: "문무겸비",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "무력이 가장 높은 적군 단일 목표에게 220%의 책략 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "지력이 가장 높은 적군 단일 목표에게 220%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[1]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_38",
    "legacyName": "문무겸비",
    "legacyType": "액티브",
    "legacyProcRate": "65%",
    "raw": "무력이 가장 높은 적군 단일 목표에게 110%→220%의 책략 피해를 주며, 지력이 가장 높은 적군 단일 목표에게 110%→220%의 병기 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.1,
          "max": 2.2,
          "target": "highest_power_enemy"
        },
        {
          "dmgType": "병기",
          "min": 1.1,
          "max": 2.2,
          "target": "highest_intel_enemy"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "clauses": [
      {
        "text": "무력이 가장 높은 적군 단일 목표에게 110%→220%의 책략 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "지력이 가장 높은 적군 단일 목표에게 110%→220%의 병기 피해를 준다",
        "impl": [
          "damage[1]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「무력이 가장 높은 적군 단일 목표에게 220%의 책략 피해를 주며」
    c.damage(0);   // 책략 110%→220%, 대상 highest_power_enemy
    // 「지력이 가장 높은 적군 단일 목표에게 220%의 병기 피해를 준다」
    c.damage(1);   // 병기 110%→220%, 대상 highest_intel_enemy
  },
});
