// 고육지계 · 고유 전법 · 액티브 50%
// 원문: 2턴 동안 자신이 받는 피해가 30% 감소한다(통솔의 영향 받음). 지력이 가장 높은 우군이 자신에게 60%의 병기 피해를 주며, 랜덤 적군 2명에게 220%의 책략 피해를 주고, 2턴 동안 지속되는 화공을(를) 부여한다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-huang-gai",
  name: "고육지계",
  kind: "액티브",
  isUnique: true,
  clauses: [
    {
      "text": "2턴 동안 자신이 받는 피해가 30% 감소한다(통솔의 영향 받음)",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "지력이 가장 높은 우군이 자신에게 60%의 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "랜덤 적군 2명에게 220%의 책략 피해를 주고",
      "status": "ok",
      "impl": [
        "damage[1]"
      ]
    },
    {
      "text": "2턴 동안 지속되는 화공을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_52",
    "legacyName": "고육지계",
    "legacyType": "액티브",
    "legacyProcRate": "50%",
    "raw": "2턴 동안 자신이 받는 피해가 15%→30% 감소한다(통솔의 영향 받음). 지력이 가장 높은 우군이 자신에게 30%→60%의 병기 피해를 주며, 랜덤 적군 2명에게 110%→220%의 책략 피해를 주고, 2턴 동안 지속되는 화공을(를) 부여한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.3,
          "max": 0.6,
          "actor": "highest_intel_ally",
          "target": "self"
        },
        {
          "dmgType": "책략",
          "min": 1.1,
          "max": 2.2,
          "target": "random_enemy_n"
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "받는피해",
          "min": -0.15,
          "max": -0.3,
          "target": "self"
        }
      ],
      "statMods": [],
      "statusEffects": [
        {
          "name": "화공",
          "target": "random_enemy_n"
        }
      ],
      "targets": []
    },
    "specialApplied": true,
    "clauses": [
      {
        "text": "2턴 동안 자신이 받는 피해가 15%→30% 감소한다(통솔의 영향 받음)",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "지력이 가장 높은 우군이 자신에게 30%→60%의 병기 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "랜덤 적군 2명에게 110%→220%의 책략 피해를 주고",
        "impl": [
          "damage[1]"
        ],
        "status": "ok"
      },
      {
        "text": "2턴 동안 지속되는 화공을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「지력이 가장 높은 우군이 자신에게 60%의 병기 피해를 주며」
    c.damage(0);   // 병기 30%→60%, 대상 self, 공격자 highest_intel_ally
    // 「랜덤 적군 2명에게 220%의 책략 피해를 주고」
    c.damage(1);   // 책략 110%→220%, 대상 random_enemy_n
    // 「2턴 동안 자신이 받는 피해가 30% 감소한다(통솔의 영향 받음)」
    c.buff(0);   // 받는피해 -15%→-30%, 대상 self
    // 「2턴 동안 지속되는 화공을(를) 부여한다」
    c.status(0);   // 화공, 대상 random_enemy_n
  },
});
