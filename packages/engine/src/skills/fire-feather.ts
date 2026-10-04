// 화검 · 전법 · 액티브 40%
// 원문: 전체 적군에게 150%의 병기 피해를 주고 2턴 동안 지속되는 화공을(를) 부여한다.
// 원문 절 구현: ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "fire-feather",
  name: "화검",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "전체 적군에게 150%의 병기 피해를 주고 2턴 동안 지속되는 화공을(를) 부여한다",
      "status": "ok",
      "impl": [
        "damage[0]",
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_23",
    "legacyName": "화검",
    "legacyType": "액티브",
    "legacyProcRate": "40%",
    "raw": "전체 적군에게 75%→150%의 병기 피해를 주고 2턴 동안 지속되는 화공을(를) 부여한다.",
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
        "all_enemy"
      ],
      "statusEffects": [
        "화공"
      ]
    },
    "clauses": [
      {
        "text": "전체 적군에게 75%→150%의 병기 피해를 주고 2턴 동안 지속되는 화공을(를) 부여한다",
        "impl": [
          "damage[0]",
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「전체 적군에게 150%의 병기 피해를 주고 2턴 동안 지속되는 화공을(를) 부여한다」
    c.damage(0);   // 병기 75%→150%
    c.status(0);   // 화공
  },
});
