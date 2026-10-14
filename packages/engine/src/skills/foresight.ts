// 예측의 신 · 전법 · 액티브 45%
// 원문: 랜덤 적군 2명에게 180%의 책략 피해를 주며, 50% 확률로 1턴 동안 지속되는 침묵을(를) 부여한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "foresight",
  name: "예측의 신",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "랜덤 적군 2명에게 180%의 책략 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "50% 확률로 1턴 동안 지속되는 침묵을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_26",
    "legacyName": "예측의 신",
    "legacyType": "액티브",
    "legacyProcRate": "45%",
    "raw": "랜덤 적군 2명에게 90%→180%의 책략 피해를 주며, 50% 확률로 1턴 동안 지속되는 침묵을(를) 부여한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.9,
          "max": 1.8,
          "target": "random_enemy_n",
          "tag": "main"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "침묵",
          "target": "tag:main",
          "chance": 0.5
        }
      ],
      "targets": []
    },
    "preciseApplied": true,
    "clauses": [
      {
        "text": "랜덤 적군 2명에게 90%→180%의 책략 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "50% 확률로 1턴 동안 지속되는 침묵을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「랜덤 적군 2명에게 180%의 책략 피해를 주며」
    c.damage(0);   // 책략 90%→180%, 대상 random_enemy_n
    // 「50% 확률로 1턴 동안 지속되는 침묵을(를) 부여한다」
    c.status(0);   // 침묵, 대상 tag:main, 확률 50%
  },
});
