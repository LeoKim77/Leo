// 기풍당당 · 전법 · 액티브 50%
// 원문: 랜덤 적군 단일 목표에게 240%의 병기 피해(후열 우선 선택)를 주며, 2턴 동안 지속되는 폭풍을(를) 부여한다. 목표가 폭풍 상태면 2턴 동안 추가로 목표의 선공을 25포인트 감소시킨다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "defeat-like-wind",
  name: "기풍당당",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "랜덤 적군 단일 목표에게 240%의 병기 피해(후열 우선 선택)를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "2턴 동안 지속되는 폭풍을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "목표가 폭풍 상태면 2턴 동안 추가로 목표의 선공을 25포인트 감소시킨다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_22",
    "legacyName": "기풍당당",
    "legacyType": "액티브",
    "legacyProcRate": "50%",
    "raw": "랜덤 적군 단일 목표에게 120%→240%의 병기 피해(후열 우선 선택)를 주며, 2턴 동안 지속되는 폭풍을(를) 부여한다. 목표가 폭풍 상태면 2턴 동안 추가로 목표의 선공을 12.5→25포인트 감소시킨다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.2,
          "max": 2.4
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_enemy_1"
      ],
      "statusEffects": [
        "폭풍"
      ]
    },
    "clauses": [
      {
        "text": "랜덤 적군 단일 목표에게 120%→240%의 병기 피해(후열 우선 선택)를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "2턴 동안 지속되는 폭풍을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 폭풍 상태면 2턴 동안 추가로 목표의 선공을 12.5→25포인트 감소시킨다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「랜덤 적군 단일 목표에게 240%의 병기 피해(후열 우선 선택)를 주며」
    c.damage(0);   // 병기 120%→240%
    // 「2턴 동안 지속되는 폭풍을(를) 부여한다」
    c.status(0);   // 폭풍
  },
});
