// 도술의 귀재 · 고유 전법 · 액티브 60%
// 원문: 랜덤 적군 2명에게 280%의 책략 피해를 주며, 2턴 동안 지속되는 요술와(과) 폭풍 상태를 부여한다. 목표가 요술 상태면 이번 피해가 35% 증가한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhang-bao",
  name: "도술의 귀재",
  kind: "액티브",
  isUnique: true,
  clauses: [
    {
      "text": "랜덤 적군 2명에게 280%의 책략 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "2턴 동안 지속되는 요술와(과) 폭풍 상태를 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "목표가 요술 상태면 이번 피해가 35% 증가한다",
      "status": "ok",
      "impl": [
        "statusEffects[1]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_38",
    "legacyName": "도술의 귀재",
    "legacyType": "액티브",
    "legacyProcRate": "60%",
    "raw": "랜덤 적군 2명에게 140%→280%의 책략 피해를 주며, 2턴 동안 지속되는 요술와(과) 폭풍 상태를 부여한다. 목표가 요술 상태면 이번 피해가 35% 증가한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.4,
          "max": 2.8
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_enemy_n"
      ],
      "statusEffects": [
        "폭풍",
        "요술"
      ]
    },
    "clauses": [
      {
        "text": "랜덤 적군 2명에게 140%→280%의 책략 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "2턴 동안 지속되는 요술와(과) 폭풍 상태를 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 요술 상태면 이번 피해가 35% 증가한다",
        "impl": [
          "statusEffects[1]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「랜덤 적군 2명에게 280%의 책략 피해를 주며」
    c.damage(0);   // 책략 140%→280%
    // 「2턴 동안 지속되는 요술와(과) 폭풍 상태를 부여한다」
    c.status(0);   // 폭풍
    // 「목표가 요술 상태면 이번 피해가 35% 증가한다」
    c.status(1);   // 요술
  },
});
