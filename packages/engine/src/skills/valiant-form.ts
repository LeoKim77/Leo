// 듬직한 자태 · 전법 · 패시브 100%
// 원문: 자신의 연타 확률이 60% 증가하며, 주는 피해가 10% 증가한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "valiant-form",
  name: "듬직한 자태",
  kind: "패시브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "연타·주는 피해를 상시로 (예전엔 2턴 뒤 사라짐)"
    }
  ],
  clauses: [
    {
      "text": "자신의 연타 확률이 60% 증가하며",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "주는 피해가 10% 증가한다",
      "status": "ok",
      "impl": [
        "buffs[1]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_71",
    "legacyName": "듬직한 자태",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "자신의 연타 확률이 30%→60% 증가하며, 주는 피해가 5%→10% 증가한다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "연타확률",
          "min": 0.3,
          "max": 0.6,
          "duration": 999,
          "maxStacks": 1
        },
        {
          "stat": "주는피해",
          "min": 0.05,
          "max": 0.1,
          "duration": 999,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "targets": [
        "self"
      ],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "자신의 연타 확률이 30%→60% 증가",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "주는 피해가 5%→10% 증가한다",
        "impl": [
          "buffs[1]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「자신의 연타 확률이 60% 증가하며」
    c.buff(0);   // 연타확률 +30%→60%, 전투 종료까지, 최대 1중첩
    // 「주는 피해가 10% 증가한다」
    c.buff(1);   // 주는피해 +5%→10%, 전투 종료까지, 최대 1중첩
  },
});
