// 야습 · 전법 · 추격 45%
// 원문: 일반 공격 후, 랜덤 적군 2명에게 120%의 병기 피해를 주며, 자신의 선공이 목표보다 높으면 추가로 50%의 병기 피해를 준다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "night-raid",
  name: "야습",
  kind: "추격",
  isUnique: false,
  clauses: [
    {
      "text": "일반 공격 후, 랜덤 적군 2명에게 120%의 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "자신의 선공이 목표보다 높으면 추가로 50%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[1]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_58",
    "legacyName": "야습",
    "legacyType": "추격",
    "legacyProcRate": "45%",
    "raw": "일반 공격 후, 랜덤 적군 2명에게 60%→120%의 병기 피해를 주며, 자신의 선공이 목표보다 높으면 추가로 25%→50%의 병기 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.6,
          "max": 1.2
        },
        {
          "dmgType": "병기",
          "min": 0.25,
          "max": 0.5,
          "condition": {
            "type": "statCompareUnits",
            "who1": "self",
            "who2": "target",
            "stat": "선공",
            "op": ">"
          }
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_enemy_n",
        "self"
      ],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "랜덤 적군 2명에게 60%→120%의 병기 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "자신의 선공이 목표보다 높으면 추가로 25%→50%의 병기 피해를 준다",
        "impl": [
          "damage[1]"
        ],
        "status": "ok"
      }
    ],
    "overrideNote": {
      "date": "2026-10-02",
      "found": "감사 D06-targets",
      "reason": "원문 '자신의 선공이 목표보다 높으면 추가로 50%'. 조건 없이 추가 피해가 항상 들어갔다."
    }
  },
  run(c) {
    // 「일반 공격 후, 랜덤 적군 2명에게 120%의 병기 피해를 주며」
    c.damage(0);   // 병기 60%→120%
    // 「자신의 선공이 목표보다 높으면 추가로 50%의 병기 피해를 준다」
    c.damage(1);   // 병기 25%→50%, 조건 statCompareUnits
  },
});
