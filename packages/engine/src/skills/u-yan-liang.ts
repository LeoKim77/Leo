// 남다른 완력 · 고유 전법 · 추격 100%
// 원문: 일반 공격 후, 현재 공격 목표에게 150%의 병기 피해를 주며, 목표의 무력이 자신보다 낮으면 추가로 70%의 병기 피해를 준다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-yan-liang",
  name: "남다른 완력",
  kind: "추격",
  isUnique: true,
  clauses: [
    {
      "text": "일반 공격 후, 현재 공격 목표에게 150%의 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "목표의 무력이 자신보다 낮으면 추가로 70%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[1]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_49",
    "legacyName": "남다른 완력",
    "legacyType": "추격",
    "legacyProcRate": "100%",
    "raw": "일반 공격 후, 현재 공격 목표에게 75%→150%의 병기 피해를 주며, 목표의 무력이 자신보다 낮으면 추가로 35%→70%의 병기 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.75,
          "max": 1.5
        },
        {
          "dmgType": "병기",
          "min": 0.35,
          "max": 0.7
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "self"
      ],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "현재 공격 목표에게 75%→150%의 병기 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표의 무력이 자신보다 낮으면 추가로 35%→70%의 병기 피해를 준다",
        "impl": [
          "damage[1]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「일반 공격 후, 현재 공격 목표에게 150%의 병기 피해를 주며」
    c.damage(0);   // 병기 75%→150%
    // 「목표의 무력이 자신보다 낮으면 추가로 70%의 병기 피해를 준다」
    c.damage(1);   // 병기 35%→70%
  },
});
