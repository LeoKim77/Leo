// 속수무책 · 전법 · 액티브 45%
// 원문: 랜덤 적군 단일 목표에게 200%의 책략 피해를 주고, 1턴 동안 지속되는 침묵을(를) 부여한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "helpless",
  name: "속수무책",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "랜덤 적군 단일 목표에게 200%의 책략 피해를 주고",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "1턴 동안 지속되는 침묵을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_34",
    "legacyName": "속수무책",
    "legacyType": "액티브",
    "legacyProcRate": "45%",
    "raw": "랜덤 적군 단일 목표에게 100%→200%의 책략 피해를 주고, 1턴 동안 지속되는 침묵을(를) 부여한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1,
          "max": 2
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_enemy_1"
      ],
      "statusEffects": [
        "침묵"
      ]
    },
    "clauses": [
      {
        "text": "랜덤 적군 단일 목표에게 100%→200%의 책략 피해를 주고",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "1턴 동안 지속되는 침묵을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「랜덤 적군 단일 목표에게 200%의 책략 피해를 주고」
    c.damage(0);   // 책략 100%→200%
    // 「1턴 동안 지속되는 침묵을(를) 부여한다」
    c.status(0);   // 침묵
  },
});
