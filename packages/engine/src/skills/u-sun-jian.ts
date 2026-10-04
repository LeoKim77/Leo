// 무열파로 · 고유 전법 · 액티브 55%
// 원문: 2턴 동안 랜덤 적군 단일 목표의 통솔을 40포인트 감소시키며(무력 또는 통솔 중 높은 수치의 영향 받음), 250%의 병기 피해를 준다(추가로 통솔의 영향 받음). 그리고 1턴 동안 지속되는 공포을(를) 부여하고, 목표의 통솔이 자신보다 높으면 통솔 감소 효과를 50% 증가한다.
// 원문 절 구현: ok / ok / ok / missing
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-sun-jian",
  name: "무열파로",
  kind: "액티브",
  isUnique: true,
  clauses: [
    {
      "text": "2턴 동안 랜덤 적군 단일 목표의 통솔을 40포인트 감소시키며(무력 또는 통솔 중 높은 수치의 영향 받음)",
      "status": "ok",
      "impl": [
        "damage[0].statScale"
      ]
    },
    {
      "text": "250%의 병기 피해를 준다(추가로 통솔의 영향 받음)",
      "status": "ok",
      "impl": [
        "damage[0]",
        "damage[0].statScale"
      ]
    },
    {
      "text": "그리고 1턴 동안 지속되는 공포을(를) 부여하고",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "목표의 통솔이 자신보다 높으면 통솔 감소 효과를 50% 증가한다",
      "status": "missing"
    }
  ],
  def: {
    "legacyId": "uskill_54",
    "legacyName": "무열파로",
    "legacyType": "액티브",
    "legacyProcRate": "55%",
    "raw": "2턴 동안 랜덤 적군 단일 목표의 통솔을 20→40포인트 감소시키며(무력 또는 통솔 중 높은 수치의 영향 받음), 125%→250%의 병기 피해를 준다(추가로 통솔의 영향 받음). 그리고 1턴 동안 지속되는 공포을(를) 부여하고, 목표의 통솔이 자신보다 높으면 통솔 감소 효과를 50% 증가한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.25,
          "max": 2.5,
          "target": "random_enemy_1",
          "tag": "main",
          "statScale": {
            "stat": "통솔"
          }
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "통솔",
          "min": -40,
          "max": -40,
          "target": "tag:main",
          "conditionalBonusMult": {
            "condition": {
              "type": "statCompareUnits",
              "who1": "target",
              "who2": "attacker",
              "stat": "통솔",
              "op": ">"
            },
            "mult": 0.5
          }
        }
      ],
      "statusEffects": [
        {
          "name": "공포",
          "target": "tag:main"
        }
      ],
      "targets": []
    },
    "specialApplied": true,
    "clauses": [
      {
        "text": "2턴 동안 랜덤 적군 단일 목표의 통솔을 20→40포인트 감소시키며(무력 또는 통솔 중 높은 수치의 영향 받음)",
        "impl": [
          "damage[0].statScale"
        ],
        "status": "ok"
      },
      {
        "text": "125%→250%의 병기 피해를 준다(추가로 통솔의 영향 받음)",
        "impl": [
          "damage[0]",
          "damage[0].statScale"
        ],
        "status": "ok"
      },
      {
        "text": "1턴 동안 지속되는 공포을(를) 부여",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표의 통솔이 자신보다 높으면 통솔 감소 효과를 50% 증가한다",
        "impl": [],
        "status": "MISSING"
      }
    ],
    "overrideNote": {
      "date": "2026-10-02",
      "found": "감사 S09 / 절 검토",
      "reason": "레벨 보간이 뒤집혀 40이 아니라 20만 감소했다."
    }
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.statMod(0);   // 통솔 -40, 대상 tag:main
    // 「250%의 병기 피해를 준다(추가로 통솔의 영향 받음)」
    c.damage(0);   // 병기 125%→250%, 대상 random_enemy_1
    // 「그리고 1턴 동안 지속되는 공포을(를) 부여하고」
    c.status(0);   // 공포, 대상 tag:main
  },
});
