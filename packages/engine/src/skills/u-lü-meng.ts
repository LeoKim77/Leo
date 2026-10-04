// 백의도강 · 고유 전법 · 액티브 70%
// 원문: 랜덤 적군 2명에게 180%의 책략 피해를 주며, 2턴 동안 지속되는 군량 고갈을(를) 부여한다. 목표가 군량 고갈 상태면 추가로 목표에게 80%의 책략 피해를 준다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-lü-meng",
  name: "백의도강",
  kind: "액티브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "원문 순서: 180% → 군량 고갈 2턴 → '군량 고갈이면' 추가 80% (예전엔 두 피해 뒤 상태, 추가 피해 무조건)"
    }
  ],
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
          "max": 1.8,
          "target": "tag:m"
        },
        {
          "dmgType": "책략",
          "min": 0.4,
          "max": 0.8,
          "target": "tag:m",
          "condition": {
            "type": "hasStatus",
            "who": "target",
            "status": "군량 고갈"
          }
        }
      ],
      "statusEffects": [
        {
          "name": "군량 고갈",
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
    c.tag('m', c.targets('random_enemy_n'));
    // 「랜덤 적군 2명에게 180%의 책략 피해를 주며」
    c.damage(0);
    // 「2턴 동안 지속되는 군량 고갈을(를) 부여한다」
    c.status(0);
    // 「목표가 군량 고갈 상태면 추가로 목표에게 80%의 책략 피해를 준다」
    c.damage(1);
  },
});
