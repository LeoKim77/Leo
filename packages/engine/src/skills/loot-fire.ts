// 방화범 · 전법 · 액티브 50%
// 원문: 1턴 동안 준비 후 랜덤 적군 2명에게 220%의 책략과 병기 피해를 주며, 목표가 화공 상태면 추가로 2턴 동안 지속되는 혼란 상태를 부여한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "loot-fire",
  name: "방화범",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "1턴 동안 준비 후 랜덤 적군 2명에게 220%의 책략과 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]",
        "prepTurns"
      ]
    },
    {
      "text": "목표가 화공 상태면 추가로 2턴 동안 지속되는 혼란 상태를 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]",
        "statusEffects[1]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_39",
    "legacyName": "방화범",
    "legacyType": "액티브",
    "legacyProcRate": "50%",
    "raw": "1턴 동안 준비 후 랜덤 적군 2명에게 110%→220%의 책략과 병기 피해를 주며, 목표가 화공 상태면 추가로 2턴 동안 지속되는 혼란 상태를 부여한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.1,
          "max": 2.2
        },
        {
          "dmgType": "책략",
          "min": 1.1,
          "max": 2.2
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_enemy_n"
      ],
      "statusEffects": [
        "혼란",
        "화공"
      ]
    },
    "prepTurns": 1,
    "clauses": [
      {
        "text": "1턴 동안 준비 후 랜덤 적군 2명에게 110%→220%의 책략과 병기 피해를 주며",
        "impl": [
          "damage[0]",
          "prepTurns"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 화공 상태면 추가로 2턴 동안 지속되는 혼란 상태를 부여한다",
        "impl": [
          "statusEffects[0]",
          "statusEffects[1]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「1턴 동안 준비 후 랜덤 적군 2명에게 220%의 책략과 병기 피해를 주며」
    c.damage(0);   // 병기 110%→220%
    c.damage(1);   // 책략 110%→220%
    // 「목표가 화공 상태면 추가로 2턴 동안 지속되는 혼란 상태를 부여한다」
    c.status(0);   // 혼란
    c.status(1);   // 화공
  },
});
