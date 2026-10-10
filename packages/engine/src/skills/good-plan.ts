// 양책 수립 · 전법 · 액티브 50%
// 원문: 2턴 동안 자신의 지력이 20포인트 증가하며, 랜덤 적군 2명에게 160%의 책략 피해를 준다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "good-plan",
  name: "양책 수립",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "지력 +20을 자신에게 (예전엔 적에게 걸렸다)"
    }
  ],
  clauses: [
    {
      "text": "2턴 동안 자신의 지력이 20포인트 증가하며",
      "status": "ok",
      "impl": [
        "statMods[0]"
      ]
    },
    {
      "text": "랜덤 적군 2명에게 160%의 책략 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_35",
    "legacyName": "양책 수립",
    "legacyType": "액티브",
    "legacyProcRate": "50%",
    "raw": "2턴 동안 자신의 지력이 10→20포인트 증가하며, 랜덤 적군 2명에게 80%→160%의 책략 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.8,
          "max": 1.6
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "지력",
          "min": 10,
          "max": 20,
          "duration": 2,
          "maxStacks": 1,
          "target": "self"
        }
      ],
      "targets": [
        "random_enemy_n",
        "self"
      ],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "2턴 동안 자신의 지력이 10→20포인트 증가",
        "impl": [
          "statMods[0]"
        ],
        "status": "ok"
      },
      {
        "text": "랜덤 적군 2명에게 80%→160%의 책략 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「2턴 동안 자신의 지력이 20포인트 증가하며」
    c.statMod(0);   // 지력 10→20, 대상 self, 2턴, 최대 1중첩
    // 「랜덤 적군 2명에게 160%의 책략 피해를 준다」
    c.damage(0);   // 책략 80%→160%
  },
});
