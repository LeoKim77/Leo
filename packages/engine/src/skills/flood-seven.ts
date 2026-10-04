// 칠군수몰 · 전법 · 액티브 40%
// 원문: 1턴 동안 준비 후 적군 전체에게 2턴 동안 지속되는 홍수을(를) 부여하고, 260%의 병기 피해를 주며, 1턴 동안 지속되는 침묵 또는 무장 해제 중 한 가지를 부여한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "flood-seven",
  name: "칠군수몰",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "1턴 동안 준비 후 적군 전체에게 2턴 동안 지속되는 홍수을(를) 부여하고",
      "status": "ok",
      "impl": [
        "prepTurns",
        "statusEffects[1]"
      ]
    },
    {
      "text": "260%의 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "1턴 동안 지속되는 침묵 또는 무장 해제 중 한 가지를 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_12",
    "legacyName": "칠군수몰",
    "legacyType": "액티브",
    "legacyProcRate": "40%",
    "raw": "1턴 동안 준비 후 적군 전체에게 2턴 동안 지속되는 홍수을(를) 부여하고, 130%→260%의 병기 피해를 주며, 1턴 동안 지속되는 침묵 또는 무장 해제 중 한 가지를 부여한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.3,
          "max": 2.6
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "all_enemy"
      ],
      "statusEffects": [
        {
          "oneOf": [
            "무장 해제",
            "침묵"
          ]
        },
        "홍수"
      ]
    },
    "prepTurns": 1,
    "clauses": [
      {
        "text": "1턴 동안 준비 후 적군 전체에게 2턴 동안 지속되는 홍수을(를) 부여",
        "impl": [
          "prepTurns",
          "statusEffects[1]"
        ],
        "status": "ok"
      },
      {
        "text": "130%→260%의 병기 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "1턴 동안 지속되는 침묵 또는 무장 해제 중 한 가지를 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ],
    "overrideNote": {
      "date": "2026-10-02",
      "found": "감사 D06-targets",
      "reason": "원문 '적군 전체에게 … 260%의 병기 피해' 인데 대상 코드가 비어 있어 랜덤 1명만 맞았다."
    }
  },
  run(c) {
    // 「260%의 병기 피해를 주며」
    c.damage(0);   // 병기 130%→260%
    // 「1턴 동안 지속되는 침묵 또는 무장 해제 중 한 가지를 부여한다」
    c.status(0);   // 무장 해제/침묵
    // 「1턴 동안 준비 후 적군 전체에게 2턴 동안 지속되는 홍수을(를) 부여하고」
    c.status(1);   // 홍수
  },
});
