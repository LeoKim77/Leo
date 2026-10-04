// 비상한 전략 · 전법 · 지휘 100%
// 원문: 턴 시작 시, 랜덤 적군 단일 목표에게 120%의 책략 피해를 주며, 비상한 전략의 피해는 턴 수에 따라 매 턴 10% 증가한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "supreme-war",
  name: "비상한 전략",
  kind: "지휘",
  isUnique: false,
  clauses: [
    {
      "text": "턴 시작 시, 랜덤 적군 단일 목표에게 120%의 책략 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "비상한 전략의 피해는 턴 수에 따라 매 턴 10% 증가한다",
      "status": "ok",
      "impl": [
        "damage[0].turnScale"
      ]
    }
  ],
  def: {
    "legacyId": "skill_3",
    "legacyName": "비상한 전략",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "턴 시작 시, 랜덤 적군 단일 목표에게 60%→120%의 책략 피해를 주며, 비상한 전략의 피해는 턴 수에 따라 매 턴 10% 증가한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.6,
          "max": 1.2,
          "turnScale": {
            "perTurn": 0.1,
            "mode": "add"
          }
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
        "text": "턴 시작 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "랜덤 적군 단일 목표에게 60%→120%의 책략 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "비상한 전략의 피해는 턴 수에 따라 매 턴 10% 증가한다",
        "impl": [
          "damage[0].turnScale"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「턴 시작 시, 랜덤 적군 단일 목표에게 120%의 책략 피해를 주며」
    c.damage(0);   // 책략 60%→120%
  },
});
