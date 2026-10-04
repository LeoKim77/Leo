// 측면 공격 · 전법 · 액티브 60%
// 원문: 랜덤 적군 단일 목표에게 150%의 병기 피해를 주며, 2턴 동안 지속되는 위협을(를) 부여한다. 2회 발동된다.
// 원문 절 구현: ok / ok / note
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "swift-flank",
  name: "측면 공격",
  kind: "액티브",
  isUnique: false,
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
      "status": "note"
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
          "max": 1.5
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_enemy_1"
      ],
      "statusEffects": [
        "위협"
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
    // 「랜덤 적군 단일 목표에게 150%의 병기 피해를 주며」
    c.damage(0);   // 병기 75%→150%
    // 「2턴 동안 지속되는 위협을(를) 부여한다」
    c.status(0);   // 위협
  },
});
