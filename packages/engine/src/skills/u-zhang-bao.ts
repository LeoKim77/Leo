// 도술의 귀재 · 고유 전법 · 액티브 60%
// 원문: 랜덤 적군 2명에게 280%의 책략 피해를 주며, 2턴 동안 지속되는 요술와(과) 폭풍 상태를 부여한다. 목표가 요술 상태면 이번 피해가 35% 증가한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhang-bao",
  name: "도술의 귀재",
  kind: "액티브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-05",
      "note": "'목표가 요술이면 이번 피해 +35%' 구현, 요술·폭풍 2턴은 피해 준 같은 2명에게"
    }
  ],
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
          "max": 2.8,
          "target": "random_enemy_n",
          "tag": "m",
          "conditionalBonusMult": {
            "condition": {
              "type": "hasStatus",
              "who": "target",
              "status": "요술"
            },
            "mult": 0.35
          }
        }
      ],
      "statusEffects": [
        {
          "name": "요술",
          "target": "tag:m",
          "duration": 2
        },
        {
          "name": "폭풍",
          "target": "tag:m",
          "duration": 2
        }
      ],
      "targets": [
        "random_enemy_n"
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
    // 「목표가 요술 상태면 이번 피해가 35% 증가한다」
    c.damage(0);
    // 「2턴 동안 지속되는 요술와(과) 폭풍 상태를 부여한다」
    c.status(0); c.status(1);
  },
});
