// 무열황제 · 고유 전법 · 액티브 55%
// 원문: 2턴 동안 랜덤 적군 단일 목표의 통솔을 40포인트 감소시키며(무력 또는 통솔 중 높은 수치의 영향 받음), 250%의 병기 피해를 준다(추가로 통솔의 영향 받음). 그리고 1턴 동안 지속되는 공포을(를) 부여하고, 목표의 통솔이 자신보다 높으면 통솔 감소 효과 50% 증가한다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-sun-jian",
  name: "무열황제",
  kind: "액티브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "통솔 감소를 피해 대상과 같은 목표에(예전엔 따로 뽑힐 수 있었음) 먼저 적용, 무력·통솔 중 높은 쪽 영향, 공포 1턴"
    }
  ],
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
      "status": "ok"
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
          "target": "tag:main",
          "statScale": {
            "stat": "통솔"
          }
        }
      ],
      "statMods": [
        {
          "stat": "통솔",
          "min": -40,
          "max": -40,
          "target": "tag:main",
          "duration": 2,
          "inf": {
            "stats": [
              "무력",
              "통솔"
            ],
            "who": "self",
            "mode": "max"
          },
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
          "target": "tag:main",
          "duration": 1
        }
      ]
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
    c.tag('main', c.targets('random_enemy_1'));
    // 「2턴 동안 랜덤 적군 단일 목표의 통솔을 40포인트 감소시키며(무력 또는 통솔 중 높은 수치의 영향 받음)」
    // 「목표의 통솔이 자신보다 높으면 통솔 감소 효과를 50% 증가한다」
    c.statMod(0);
    // 「250%의 병기 피해를 준다(추가로 통솔의 영향 받음)」
    c.damage(0);
    // 「그리고 1턴 동안 지속되는 공포을(를) 부여하고」
    c.status(0);
  },
});
