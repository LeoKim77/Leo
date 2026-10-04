// 구름과 바람 · 전법 · 액티브 60%
// 원문: 랜덤 적군 2명에게 180%의 병기 피해를 주며, 목표가 폭풍 상태면 이번 피해가 25% 증가한다. 자신이 폭풍 상태면 2턴 동안 자신의 피신 확률이 10% 증가한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "wind-cloud",
  name: "구름과 바람",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "랜덤 적군 2명에게 180%의 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "목표가 폭풍 상태면 이번 피해가 25% 증가한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "자신이 폭풍 상태면 2턴 동안 자신의 피신 확률이 10% 증가한다",
      "status": "ok",
      "impl": [
        "buffs[0]",
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_20",
    "legacyName": "구름과 바람",
    "legacyType": "액티브",
    "legacyProcRate": "60%",
    "raw": "랜덤 적군 2명에게 90%→180%의 병기 피해를 주며, 목표가 폭풍 상태면 이번 피해가 25% 증가한다. 자신이 폭풍 상태면 2턴 동안 자신의 피신 확률이 5%→10% 증가한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.9,
          "max": 1.8
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "피신",
          "min": 0.05,
          "max": 0.1,
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "targets": [
        "random_enemy_n",
        "self"
      ],
      "statusEffects": [
        "폭풍"
      ]
    },
    "clauses": [
      {
        "text": "랜덤 적군 2명에게 90%→180%의 병기 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 폭풍 상태면 이번 피해가 25% 증가한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "자신이 폭풍 상태면 2턴 동안 자신의 피신 확률이 5%→10% 증가한다",
        "impl": [
          "buffs[0]",
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「랜덤 적군 2명에게 180%의 병기 피해를 주며」
    c.damage(0);   // 병기 90%→180%
    // 「자신이 폭풍 상태면 2턴 동안 자신의 피신 확률이 10% 증가한다」
    c.buff(0);   // 피신 +5%→10%, 2턴, 최대 1중첩
    // 「목표가 폭풍 상태면 이번 피해가 25% 증가한다」
    c.status(0);   // 폭풍
  },
});
