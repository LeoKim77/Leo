// 민중 봉기 · 전법 · 액티브 45%
// 원문: 랜덤 적군 2명에게 150%의 병기 피해를 주며, 목표에게 1턴 동안 지속되는 군량 고갈을(를) 부여한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "raise-banner",
  name: "민중 봉기",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "랜덤 적군 2명에게 150%의 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "목표에게 1턴 동안 지속되는 군량 고갈을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_25",
    "legacyName": "민중 봉기",
    "legacyType": "액티브",
    "legacyProcRate": "45%",
    "raw": "랜덤 적군 2명에게 75%→150%의 병기 피해를 주며, 목표에게 1턴 동안 지속되는 군량 고갈을(를) 부여한다.",
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
        "random_enemy_n"
      ],
      "statusEffects": [
        "군량 고갈"
      ]
    },
    "clauses": [
      {
        "text": "랜덤 적군 2명에게 75%→150%의 병기 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표에게 1턴 동안 지속되는 군량 고갈을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「랜덤 적군 2명에게 150%의 병기 피해를 주며」
    c.damage(0);   // 병기 75%→150%
    // 「목표에게 1턴 동안 지속되는 군량 고갈을(를) 부여한다」
    c.status(0);   // 군량 고갈
  },
});
