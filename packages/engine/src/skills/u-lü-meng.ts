// 백의도강 · 고유 전법 · 액티브 70%
// 원문: 랜덤 적군 2명에게 180%의 책략 피해를 주며, 2턴 동안 지속되는 군량 고갈을(를) 부여한다. 목표가 군량 고갈 상태면 추가로 목표에게 80%의 책략 피해를 준다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-lü-meng",
  name: "백의도강",
  kind: "액티브",
  isUnique: true,
  clauses: [
    {
      "text": "랜덤 적군 2명에게 180%의 책략 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "2턴 동안 지속되는 군량 고갈을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "목표가 군량 고갈 상태면 추가로 목표에게 80%의 책략 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[1]",
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_12",
    "legacyName": "백의도강",
    "legacyType": "액티브",
    "legacyProcRate": "70%",
    "raw": "랜덤 적군 2명에게 90%→180%의 책략 피해를 주며, 2턴 동안 지속되는 군량 고갈을(를) 부여한다. 목표가 군량 고갈 상태면 추가로 목표에게 40%→80%의 책략 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.9,
          "max": 1.8
        },
        {
          "dmgType": "책략",
          "min": 0.4,
          "max": 0.8
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_enemy_n"
      ],
      "statusEffects": [
        "군량 고갈"
      ]
    },
    "clauses": [
      {
        "text": "랜덤 적군 2명에게 90%→180%의 책략 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "2턴 동안 지속되는 군량 고갈을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 군량 고갈 상태면 추가로 목표에게 40%→80%의 책략 피해를 준다",
        "impl": [
          "damage[1]",
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「랜덤 적군 2명에게 180%의 책략 피해를 주며」
    c.damage(0);   // 책략 90%→180%
    // 「목표가 군량 고갈 상태면 추가로 목표에게 80%의 책략 피해를 준다」
    c.damage(1);   // 책략 40%→80%
    // 「2턴 동안 지속되는 군량 고갈을(를) 부여한다」
    c.status(0);   // 군량 고갈
  },
});
