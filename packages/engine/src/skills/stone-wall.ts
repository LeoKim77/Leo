// 견고한 방어 · 전법 · 액티브 55%
// 원문: 적군 전체를 조롱하고, 2턴 동안 자신이 받는 피해가 30% 감소한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "stone-wall",
  name: "견고한 방어",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "조롱을 '적군 전체'에게 (예전엔 랜덤 적 1명)"
    }
  ],
  clauses: [
    {
      "text": "적군 전체를 조롱하고",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "2턴 동안 자신이 받는 피해가 30% 감소한다",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_46",
    "legacyName": "견고한 방어",
    "legacyType": "액티브",
    "legacyProcRate": "55%",
    "raw": "적군 전체를 조롱하고, 2턴 동안 자신이 받는 피해가 15%→30% 감소한다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "받는피해",
          "min": -0.15,
          "max": -0.3,
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "targets": [
        "self"
      ],
      "statusEffects": [
        {
          "name": "조롱",
          "target": "all_enemy"
        }
      ]
    },
    "clauses": [
      {
        "text": "적군 전체를 조롱",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "2턴 동안 자신이 받는 피해가 15%→30% 감소한다",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「2턴 동안 자신이 받는 피해가 30% 감소한다」
    c.buff(0);   // 받는피해 -15%→-30%, 2턴, 최대 1중첩
    // 「적군 전체를 조롱하고」
    c.status(0);   // 조롱, 대상 all_enemy
  },
});
