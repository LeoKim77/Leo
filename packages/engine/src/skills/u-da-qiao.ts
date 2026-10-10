// 국색 · 고유 전법 · 지휘 100%
// 원문: 매 턴 시작 시, 랜덤 적군 2명이 받는 피해가 1턴 동안 20% 증가하며, 랜덤 아군 2명의 병력을 회복시킨다(치유율 180%, 지력의 영향 받음).
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-da-qiao",
  name: "국색",
  kind: "지휘",
  isUnique: true,
  clauses: [
    {
      "text": "매 턴 시작 시, 랜덤 적군 2명이 받는 피해가 1턴 동안 20% 증가하며",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "랜덤 우군 2명의 병력을 회복시킨다(치유율 180%, 지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_19",
    "legacyName": "국색",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "매 턴 시작 시, 랜덤 적군 2명이 받는 피해가 1턴 동안 10%→20% 증가하며, 랜덤 아군 2명의 병력을 회복시킨다(치유율 90%→180%, 지력의 영향 받음).",
    "effects": {
      "damage": [],
      "heal": [
        {
          "min": 0.9,
          "max": 1.8
        }
      ],
      "buffs": [
        {
          "stat": "받는피해",
          "min": 0.1,
          "max": 0.2,
          "target": "random_enemy_n",
          "duration": 1,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "targets": [
        "random_enemy_n",
        "random_ally_n",
        "random_ally_n"
      ],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "매 턴 시작 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "랜덤 적군 2명이 받는 피해가 1턴 동안 10%→20% 증가",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "랜덤 아군 2명의 병력을 회복시킨다(치유율 90%→180%",
        "impl": [
          "heal[0]"
        ],
        "status": "ok"
      },
      {
        "text": "지력의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「랜덤 우군 2명의 병력을 회복시킨다(치유율 180%, 지력의 영향 받음)」
    c.heal(0);   // 치유율 90%→180%
    // 「매 턴 시작 시, 랜덤 적군 2명이 받는 피해가 1턴 동안 20% 증가하며」
    c.buff(0);   // 받는피해 +10%→20%, 대상 random_enemy_n, 1턴, 최대 1중첩
  },
});
