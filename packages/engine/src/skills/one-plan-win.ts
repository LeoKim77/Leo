// 결정적인 수 · 전법 · 액티브 35%
// 원문: 1턴 동안 준비 후 랜덤 적군 2명에게 220%의 책략 피해를 주며, 2턴 동안 지속되는 허약 상태를 부여한다. 목표가 허약 상태면 추가로 50%의 책략 피해를 준다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "one-plan-win",
  name: "결정적인 수",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "1턴 동안 준비 후 랜덤 적군 2명에게 220%의 책략 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]",
        "prepTurns"
      ]
    },
    {
      "text": "2턴 동안 지속되는 허약 상태를 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "목표가 허약 상태면 추가로 50%의 책략 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[1]",
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_36",
    "legacyName": "결정적인 수",
    "legacyType": "액티브",
    "legacyProcRate": "35%",
    "raw": "1턴 동안 준비 후 랜덤 적군 2명에게 110%→220%의 책략 피해를 주며, 2턴 동안 지속되는 허약 상태를 부여한다. 목표가 허약 상태면 추가로 25%→50%의 책략 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.1,
          "max": 2.2
        },
        {
          "dmgType": "책략",
          "min": 0.25,
          "max": 0.5
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_enemy_n"
      ],
      "statusEffects": [
        "허약"
      ]
    },
    "prepTurns": 1,
    "clauses": [
      {
        "text": "1턴 동안 준비 후 랜덤 적군 2명에게 110%→220%의 책략 피해를 주며",
        "impl": [
          "damage[0]",
          "prepTurns"
        ],
        "status": "ok"
      },
      {
        "text": "2턴 동안 지속되는 허약 상태를 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 허약 상태면 추가로 25%→50%의 책략 피해를 준다",
        "impl": [
          "damage[1]",
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「1턴 동안 준비 후 랜덤 적군 2명에게 220%의 책략 피해를 주며」
    c.damage(0);   // 책략 110%→220%
    // 「목표가 허약 상태면 추가로 50%의 책략 피해를 준다」
    c.damage(1);   // 책략 25%→50%
    // 「2턴 동안 지속되는 허약 상태를 부여한다」
    c.status(0);   // 허약
  },
});
