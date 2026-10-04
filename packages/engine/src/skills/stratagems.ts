// 넘치는 계책 · 전법 · 추격 40%
// 원문: 일반 공격 후, 랜덤 적군 단일 목표에게 250%의 책략 피해를 주며, 후열 적군을 우선 선택한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "stratagems",
  name: "넘치는 계책",
  kind: "추격",
  isUnique: false,
  clauses: [
    {
      "text": "일반 공격 후, 랜덤 적군 단일 목표에게 250%의 책략 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "후열 적군을 우선 선택한다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_60",
    "legacyName": "넘치는 계책",
    "legacyType": "추격",
    "legacyProcRate": "40%",
    "raw": "일반 공격 후, 랜덤 적군 단일 목표에게 125%→250%의 책략 피해를 주며, 후열 적군을 우선 선택한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.25,
          "max": 2.5
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_enemy_1"
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
        "text": "랜덤 적군 단일 목표에게 125%→250%의 책략 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "후열 적군을 우선 선택한다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「일반 공격 후, 랜덤 적군 단일 목표에게 250%의 책략 피해를 주며」
    c.damage(0);   // 책략 125%→250%
  },
});
