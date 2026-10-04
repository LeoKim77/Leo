// 문과 무 · 전법 · 지휘 100%
// 원문: 매 턴 행동 시, 60% 확률로 랜덤 적군 2명에게 100%의 병기와 책략 피해를 준다.
// 원문 절 구현: ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "civil-martial",
  name: "문과 무",
  kind: "지휘",
  isUnique: false,
  clauses: [
    {
      "text": "매 턴 행동 시, 60% 확률로 랜덤 적군 2명에게 100%의 병기와 책략 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[1]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_9",
    "legacyName": "문과 무",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "매 턴 행동 시, 60% 확률로 랜덤 적군 2명에게 50%→100%의 병기와 책략 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.5,
          "max": 1,
          "chance": 0.6
        },
        {
          "dmgType": "책략",
          "min": 0.5,
          "max": 1,
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
        "text": "매 턴 행동 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "60% 확률로 랜덤 적군 2명에게 50%→100%의 병기와 책략 피해를 준다",
        "impl": [
          "damage[1]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 병기 50%→100%, 확률 60%
    // 「매 턴 행동 시, 60% 확률로 랜덤 적군 2명에게 100%의 병기와 책략 피해를 준다」
    c.damage(1);   // 책략 50%→100%, 확률 60%
  },
});
