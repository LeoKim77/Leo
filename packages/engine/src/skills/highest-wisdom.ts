// 최상의 지략 · 전법 · 액티브 45%
// 원문: 랜덤 적군 단일 목표에게 1턴 동안 지속되는 혼란을(를) 부여하며, 300%의 책략 피해를 준다. 목표가 혼란 상태면 추가로 해당 목표에게 150%의 책략 피해를 준다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "highest-wisdom",
  name: "최상의 지략",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "원문 순서: 혼란(1턴) → 300% → '혼란 상태면' 추가 150% (예전엔 추가 피해가 조건 없이, 혼란은 마지막)"
    }
  ],
  clauses: [
    {
      "text": "랜덤 적군 단일 목표에게 1턴 동안 지속되는 혼란을(를) 부여하며",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "300%의 책략 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "목표가 혼란 상태면 추가로 해당 목표에게 150%의 책략 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[1]",
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_27",
    "legacyName": "최상의 지략",
    "legacyType": "액티브",
    "legacyProcRate": "45%",
    "raw": "랜덤 적군 단일 목표에게 1턴 동안 지속되는 혼란을(를) 부여하며, 150%→300%의 책략 피해를 준다. 목표가 혼란 상태면 추가로 해당 목표에게 75%→150%의 책략 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.5,
          "max": 3,
          "target": "tag:m"
        },
        {
          "dmgType": "책략",
          "min": 0.75,
          "max": 1.5,
          "target": "tag:m",
          "condition": {
            "type": "hasStatus",
            "who": "target",
            "status": "혼란"
          }
        }
      ],
      "statusEffects": [
        {
          "name": "혼란",
          "target": "tag:m",
          "duration": 1
        }
      ],
      "targets": [
        "random_enemy_1"
      ]
    },
    "clauses": [
      {
        "text": "랜덤 적군 단일 목표에게 1턴 동안 지속되는 혼란을(를) 부여",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "150%→300%의 책략 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 혼란 상태면 추가로 해당 목표에게 75%→150%의 책략 피해를 준다",
        "impl": [
          "damage[1]",
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    c.tag('m', c.targets('random_enemy_1'));
    // 「랜덤 적군 단일 목표에게 1턴 동안 지속되는 혼란을(를) 부여하며」
    c.status(0);
    // 「300%의 책략 피해를 준다」
    c.damage(0);
    // 「목표가 혼란 상태면 추가로 해당 목표에게 150%의 책략 피해를 준다」
    c.damage(1);
  },
});
