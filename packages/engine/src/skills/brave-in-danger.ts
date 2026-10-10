// 위기의 결전 · 전법 · 패시브 100%
// 원문: 자신의 반격 확률이 40% 증가하며, 받는 일반 공격 피해가 20% 감소한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "brave-in-danger",
  name: "위기의 결전",
  kind: "패시브",
  isUnique: false,
  clauses: [
    {
      "text": "자신의 반격 확률이 40% 증가하며",
      "status": "ok",
      "impl": [
        "buffs[1]"
      ]
    },
    {
      "text": "받는 일반 공격 피해가 20% 감소한다",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_65",
    "legacyName": "위기의 결전",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "자신의 반격 확률이 20%→40% 증가하며, 받는 일반 공격 피해가 10%→20% 감소한다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "받는일반공격피해",
          "min": -0.1,
          "max": -0.2,
          "target": "self",
          "duration": 999,
          "maxStacks": 1
        },
        {
          "stat": "반격확률",
          "min": 0.2,
          "max": 0.4,
          "target": "self",
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
    "manualOverride": true,
    "clauses": [
      {
        "text": "자신의 반격 확률이 20%→40% 증가",
        "impl": [
          "buffs[1]"
        ],
        "status": "ok"
      },
      {
        "text": "받는 일반 공격 피해가 10%→20% 감소한다",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「받는 일반 공격 피해가 20% 감소한다」
    c.buff(0);   // 받는일반공격피해 -10%→-20%, 대상 self, 전투 종료까지, 최대 1중첩
    // 「자신의 반격 확률이 40% 증가하며」
    c.buff(1);   // 반격확률 +20%→40%, 대상 self, 전투 종료까지, 최대 1중첩
  },
});
