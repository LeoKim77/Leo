// 팔방전 · 전법 · 액티브 55%
// 원문: 전체 적군에게 130%의 병기 피해를 주고 2턴 동안 지속되는 위협을(를) 부여한다.
// 원문 절 구현: ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "all-directions",
  name: "팔방전",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "전체 적군에게 130%의 병기 피해를 주고 2턴 동안 지속되는 위협을(를) 부여한다",
      "status": "ok",
      "impl": [
        "damage[0]",
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_17",
    "legacyName": "팔방전",
    "legacyType": "액티브",
    "legacyProcRate": "55%",
    "raw": "전체 적군에게 65%→130%의 병기 피해를 주고 2턴 동안 지속되는 위협을(를) 부여한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.65,
          "max": 1.3
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "all_enemy"
      ],
      "statusEffects": [
        "위협"
      ]
    },
    "clauses": [
      {
        "text": "전체 적군에게 65%→130%의 병기 피해를 주고 2턴 동안 지속되는 위협을(를) 부여한다",
        "impl": [
          "damage[0]",
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「전체 적군에게 130%의 병기 피해를 주고 2턴 동안 지속되는 위협을(를) 부여한다」
    c.damage(0);   // 병기 65%→130%
    c.status(0);   // 위협
  },
});
