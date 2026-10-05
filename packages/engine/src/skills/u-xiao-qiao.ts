// 천향 · 고유 전법 · 액티브 40%
// 원문: 랜덤 적군 2명에게 1턴 동안 지속되는 허약을(를) 부여한다. 랜덤 아군 2명의 병력을 회복시킨다(치유율 250%, 지력의 영향 받음).
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-xiao-qiao",
  name: "천향",
  kind: "액티브",
  isUnique: true,
  clauses: [
    {
      "text": "랜덤 적군 2명에게 1턴 동안 지속되는 허약을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "랜덤 우군 2명의 병력을 회복시킨다(치유율 250%, 지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_41",
    "legacyName": "천향",
    "legacyType": "액티브",
    "legacyProcRate": "40%",
    "raw": "랜덤 적군 2명에게 1턴 동안 지속되는 허약을(를) 부여한다. 랜덤 아군 2명의 병력을 회복시킨다(치유율 125%→250%, 지력의 영향 받음).",
    "effects": {
      "damage": [],
      "heal": [
        {
          "min": 1.25,
          "max": 2.5
        }
      ],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_enemy_n",
        "random_ally_n",
        "random_ally_n"
      ],
      "statusEffects": [
        "허약"
      ]
    },
    "clauses": [
      {
        "text": "랜덤 적군 2명에게 1턴 동안 지속되는 허약을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "랜덤 아군 2명의 병력을 회복시킨다(치유율 125%→250%",
        "impl": [
          "heal[0]"
        ],
        "status": "ok"
      },
      {
        "text": "지력의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「랜덤 우군 2명의 병력을 회복시킨다(치유율 250%, 지력의 영향 받음)」
    c.heal(0);   // 치유율 125%→250%
    // 「랜덤 적군 2명에게 1턴 동안 지속되는 허약을(를) 부여한다」
    c.status(0);   // 허약
  },
});
