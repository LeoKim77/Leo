// 장군의 무용 · 고유 전법 · 액티브 100%
// 원문: 2턴 동안 자신에게 침묵을(를) 부여한다. 랜덤 적군 단일 목표에게 250%의 병기 피해와 일반 공격을 1회 시전한다(무장 해제 상태 무시).
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-hua-xiong",
  name: "장군의 무용",
  kind: "액티브",
  isUnique: true,
  clauses: [
    {
      "text": "2턴 동안 자신에게 침묵을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[1]"
      ]
    },
    {
      "text": "랜덤 적군 단일 목표에게 250%의 병기 피해와 일반 공격을 1회 시전한다(무장 해제 상태 무시)",
      "status": "ok",
      "impl": [
        "damage[0]",
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_53",
    "legacyName": "장군의 무용",
    "legacyType": "액티브",
    "legacyProcRate": "100%",
    "raw": "2턴 동안 자신에게 침묵을(를) 부여한다. 랜덤 적군 단일 목표에게 125%→250%의 병기 피해와 일반 공격을 1회 시전한다(무장 해제 상태 무시).",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.25,
          "max": 2.5
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_enemy_1",
        "self"
      ],
      "statusEffects": [
        "무장 해제",
        "침묵"
      ]
    },
    "clauses": [
      {
        "text": "2턴 동안 자신에게 침묵을(를) 부여한다",
        "impl": [
          "statusEffects[1]"
        ],
        "status": "ok"
      },
      {
        "text": "랜덤 적군 단일 목표에게 125%→250%의 병기 피해와 일반 공격을 1회 시전한다(무장 해제 상태 무시)",
        "impl": [
          "damage[0]",
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「랜덤 적군 단일 목표에게 250%의 병기 피해와 일반 공격을 1회 시전한다(무장 해제 상태 무시)」
    c.damage(0);   // 병기 125%→250%
    c.status(0);   // 무장 해제
    // 「2턴 동안 자신에게 침묵을(를) 부여한다」
    c.status(1);   // 침묵
  },
});
