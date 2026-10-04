// 파죽지세 · 전법 · 액티브 27.5%~ 50%
// 원문: 2턴 동안 자신의 회심 확률이 20% 증가한다. 전체 적군에게 140%의 병기 피해를 준다.
// 원문 절 구현: missing / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "break-through",
  name: "파죽지세",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "2턴 동안 자신의 회심 확률이 20% 증가한다",
      "status": "missing"
    },
    {
      "text": "전체 적군에게 140%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_13",
    "legacyName": "파죽지세",
    "legacyType": "액티브",
    "legacyProcRate": "27.5%~ 50%",
    "raw": "2턴 동안 자신의 회심 확률이 20% 증가한다. 전체 적군에게 70%→140%의 병기 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.7,
          "max": 1.4
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "회심",
          "min": 0.2,
          "max": 0.2,
          "target": "self",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "targets": [
        "all_enemy",
        "self"
      ],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "2턴 동안 자신의 회심 확률이 20% 증가한다",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "전체 적군에게 70%→140%의 병기 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「전체 적군에게 140%의 병기 피해를 준다」
    c.damage(0);   // 병기 70%→140%
    c.buff(0);   // 회심 +20%, 대상 self, 2턴, 최대 1중첩
  },
});
