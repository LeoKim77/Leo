// 찬란한 위명 · 전법 · 액티브 27.5%~ 50%
// 원문: 2턴 동안 자신의 회유이(가) 30% 증가한다. 이후 랜덤 적군 2명에게 220%의 병기 피해를 준다.
// 원문 절 구현: missing / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "famous",
  name: "찬란한 위명",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "2턴 동안 자신의 회유이(가) 30% 증가한다",
      "status": "missing"
    },
    {
      "text": "이후 랜덤 적군 2명에게 220%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_16",
    "legacyName": "찬란한 위명",
    "legacyType": "액티브",
    "legacyProcRate": "27.5%~ 50%",
    "raw": "2턴 동안 자신의 회유이(가) 30% 증가한다. 이후 랜덤 적군 2명에게 110%→220%의 병기 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.1,
          "max": 2.2
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "회유",
          "min": 0.3,
          "max": 0.3,
          "target": "self",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "targets": [
        "random_enemy_n",
        "self"
      ],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "2턴 동안 자신의 회유이(가) 30% 증가한다",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "랜덤 적군 2명에게 110%→220%의 병기 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「이후 랜덤 적군 2명에게 220%의 병기 피해를 준다」
    c.damage(0);   // 병기 110%→220%
    c.buff(0);   // 회유 +30%, 대상 self, 2턴, 최대 1중첩
  },
});
