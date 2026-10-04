// 기습 제압 · 전법 · 액티브 50%
// 원문: 1턴 동안 준비 후 전체 적군에게 300%의 병기 피해를 준다.
// 원문 절 구현: ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "break-army",
  name: "기습 제압",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "1턴 동안 준비 후 전체 적군에게 300%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]",
        "prepTurns"
      ]
    }
  ],
  def: {
    "legacyId": "skill_14",
    "legacyName": "기습 제압",
    "legacyType": "액티브",
    "legacyProcRate": "50%",
    "raw": "1턴 동안 준비 후 전체 적군에게 150%→300%의 병기 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.5,
          "max": 3
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "all_enemy"
      ],
      "statusEffects": []
    },
    "prepTurns": 1,
    "clauses": [
      {
        "text": "1턴 동안 준비 후 전체 적군에게 150%→300%의 병기 피해를 준다",
        "impl": [
          "damage[0]",
          "prepTurns"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「1턴 동안 준비 후 전체 적군에게 300%의 병기 피해를 준다」
    c.damage(0);   // 병기 150%→300%
  },
});
