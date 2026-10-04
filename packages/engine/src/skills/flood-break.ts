// 수전 섬멸 · 전법 · 액티브 60%
// 원문: 랜덤 적군 2명에게 100%의 책략 피해를 주며, 목표가 홍수 상태면 추가로 60%의 책략 피해를 준다. 그렇지 않으면 2턴 동안 지속되는 홍수을(를) 부여한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "flood-break",
  name: "수전 섬멸",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "랜덤 적군 2명에게 100%의 책략 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "목표가 홍수 상태면 추가로 60%의 책략 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[1]",
        "statusEffects[0]"
      ]
    },
    {
      "text": "그렇지 않으면 2턴 동안 지속되는 홍수을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_33",
    "legacyName": "수전 섬멸",
    "legacyType": "액티브",
    "legacyProcRate": "60%",
    "raw": "랜덤 적군 2명에게 50%→100%의 책략 피해를 주며, 목표가 홍수 상태면 추가로 30%→60%의 책략 피해를 준다. 그렇지 않으면 2턴 동안 지속되는 홍수을(를) 부여한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.5,
          "max": 1,
          "target": "random_enemy_n",
          "tag": "main"
        },
        {
          "dmgType": "책략",
          "min": 0.3,
          "max": 0.6,
          "target": "tag:main",
          "condition": {
            "type": "hasStatus",
            "who": "target",
            "status": "홍수"
          }
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "홍수",
          "target": "tag:main",
          "condition": {
            "type": "hasStatus",
            "who": "target",
            "status": "홍수",
            "negate": true
          }
        }
      ],
      "targets": []
    },
    "specialApplied": true,
    "clauses": [
      {
        "text": "랜덤 적군 2명에게 50%→100%의 책략 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 홍수 상태면 추가로 30%→60%의 책략 피해를 준다",
        "impl": [
          "damage[1]",
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "그렇지 않으면 2턴 동안 지속되는 홍수을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「랜덤 적군 2명에게 100%의 책략 피해를 주며」
    c.damage(0);   // 책략 50%→100%, 대상 random_enemy_n
    // 「목표가 홍수 상태면 추가로 60%의 책략 피해를 준다」
    c.damage(1);   // 책략 30%→60%, 대상 tag:main, 조건 hasStatus
    c.status(0);   // 홍수, 대상 tag:main, 조건 hasStatus
  },
});
