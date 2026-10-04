// 일인천군 · 전법 · 패시브 100%
// 원문: 일반 공격 후, 60% 확률로 공격 목표의 우군 2명에게 이번 일반 공격의 100%의 피해 전달을(를) 준다. 자신의 무력이 목표보다 높으면 추가로 30%의 병기 피해를 준다.
// 원문 절 구현: missing / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "ten-thousand",
  name: "일인천군",
  kind: "패시브",
  isUnique: false,
  clauses: [
    {
      "text": "일반 공격 후, 60% 확률로 공격 목표의 우군 2명에게 이번 일반 공격의 100%의 피해 전달을(를) 준다",
      "status": "missing"
    },
    {
      "text": "자신의 무력이 목표보다 높으면 추가로 30%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_63",
    "legacyName": "일인천군",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "일반 공격 후, 60% 확률로 공격 목표의 우군 2명에게 이번 일반 공격의 50%→100%의 피해 전달을(를) 준다. 자신의 무력이 목표보다 높으면 추가로 15%→30%의 병기 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.15,
          "max": 0.3,
          "chance": 0.6
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_enemy_n"
      ],
      "statusEffects": []
    },
    "chanceFixed": true,
    "clauses": [
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "60% 확률로 공격 목표의 우군 2명에게 이번 일반 공격의 50%→100%의 피해 전달을(를) 준다",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "자신의 무력이 목표보다 높으면 추가로 15%→30%의 병기 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      }
    ],
    "transfer": {
      "chance": 0.6,
      "ratio": 1,
      "target": "target_allies",
      "count": 2
    }
  },
  run(c) {
    // 「자신의 무력이 목표보다 높으면 추가로 30%의 병기 피해를 준다」
    c.damage(0);   // 병기 15%→30%, 확률 60%
  },
});
