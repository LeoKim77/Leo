// 측면 공격 · 전법 · 액티브 60%
// 원문: 랜덤 적군 단일 목표에게 150%의 병기 피해를 주며, 2턴 동안 지속되는 위협을(를) 부여한다. 2회 발동된다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "swift-flank",
  name: "측면 공격",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "2회 발동 구현(예전 1회), 위협은 맞은 그 대상에게 2턴"
    }
  ],
  clauses: [
    {
      "text": "랜덤 적군 단일 목표에게 150%의 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "2턴 동안 지속되는 위협을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "2회 발동된다",
      "status": "ok"
    }
  ],
  def: {
    "legacyId": "skill_21",
    "legacyName": "측면 공격",
    "legacyType": "액티브",
    "legacyProcRate": "60%",
    "raw": "랜덤 적군 단일 목표에게 75%→150%의 병기 피해를 주며, 2턴 동안 지속되는 위협을(를) 부여한다. 2회 발동된다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.75,
          "max": 1.5,
          "target": "random_enemy_1",
          "tag": "h"
        }
      ],
      "statusEffects": [
        {
          "name": "위협",
          "target": "tag:h",
          "duration": 2
        }
      ],
      "targets": [
        "random_enemy_1"
      ]
    },
    "clauses": [
      {
        "text": "랜덤 적군 단일 목표에게 75%→150%의 병기 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "2턴 동안 지속되는 위협을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "2회 발동된다",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「2회 발동된다」
    for (let i = 0; i < 2; i++) {
      // 「랜덤 적군 단일 목표에게 150%의 병기 피해를 주며」
      c.damage(0);
      // 「2턴 동안 지속되는 위협을(를) 부여한다」
      c.status(0);
    }
  },
});
