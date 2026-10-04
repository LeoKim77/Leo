// 천하평론 · 전법 · 액티브 50%
// 원문: 무력이 가장 높은 아군 단일 목표가 적군 전체에게 80% 병기 피해를 주게 하며, 지력이 가장 높은 아군 단일 목표가 적군 전체에게 80%의 책략 피해를 주게 한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "direct-world",
  name: "천하평론",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "무력이 가장 높은 아군 단일 목표가 적군 전체에게 80% 병기 피해를 주게 하며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "지력이 가장 높은 아군 단일 목표가 적군 전체에게 80%의 책략 피해를 주게 한다",
      "status": "ok",
      "impl": [
        "damage[1]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_37",
    "legacyName": "천하평론",
    "legacyType": "액티브",
    "legacyProcRate": "50%",
    "raw": "무력이 가장 높은 아군 단일 목표가 적군 전체에게 40%→80% 병기 피해를 주게 하며, 지력이 가장 높은 아군 단일 목표가 적군 전체에게 40%→80%의 책략 피해를 주게 한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.4,
          "max": 0.8,
          "actor": "highest_power_ally",
          "target": "all_enemy"
        },
        {
          "dmgType": "책략",
          "min": 0.4,
          "max": 0.8,
          "actor": "highest_intel_ally",
          "target": "all_enemy"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [],
      "statusEffects": []
    },
    "manualOverride": true,
    "clauses": [
      {
        "text": "무력이 가장 높은 아군 단일 목표가 적군 전체에게 40%→80% 병기 피해를 주게",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "지력이 가장 높은 아군 단일 목표가 적군 전체에게 40%→80%의 책략 피해를 주게 한다",
        "impl": [
          "damage[1]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「무력이 가장 높은 아군 단일 목표가 적군 전체에게 80% 병기 피해를 주게 하며」
    c.damage(0);   // 병기 40%→80%, 대상 all_enemy, 공격자 highest_power_ally
    // 「지력이 가장 높은 아군 단일 목표가 적군 전체에게 80%의 책략 피해를 주게 한다」
    c.damage(1);   // 책략 40%→80%, 대상 all_enemy, 공격자 highest_intel_ally
  },
});
