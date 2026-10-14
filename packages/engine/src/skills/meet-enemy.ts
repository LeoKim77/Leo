// 응전 · 전법 · 액티브 50%
// 원문: 1턴 동안 준비 후 2턴 동안 자신의 방어 관통이(가) 20% 증가하며, 이후 적군 단일 목표에게 440%의 병기 피해를 준다. 전열 목표를 우선적으로 선택한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "meet-enemy",
  name: "응전",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "'전열 우선' 대상, 방어 관통 → 피해 순서"
    }
  ],
  clauses: [
    {
      "text": "1턴 동안 준비 후 2턴 동안 자신의 방어 관통이(가) 20% 증가하며",
      "status": "ok",
      "impl": [
        "buffs[0]",
        "prepTurns"
      ]
    },
    {
      "text": "이후 적군 단일 목표에게 440%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "전열 목표를 우선적으로 선택한다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_24",
    "legacyName": "응전",
    "legacyType": "액티브",
    "legacyProcRate": "50%",
    "raw": "1턴 동안 준비 후 2턴 동안 자신의 방어 관통이(가) 10%→20% 증가하며, 이후 적군 단일 목표에게 220%→440%의 병기 피해를 준다. 전열 목표를 우선적으로 선택한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 2.2,
          "max": 4.4,
          "target": "random_enemy_front_first"
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "방어관통",
          "min": 0.1,
          "max": 0.2,
          "target": "self",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "targets": [
        "self"
      ],
      "statusEffects": []
    },
    "prepTurns": 1,
    "clauses": [
      {
        "text": "1턴 동안 준비 후 2턴 동안 자신의 방어 관통이(가) 10%→20% 증가",
        "impl": [
          "buffs[0]",
          "prepTurns"
        ],
        "status": "ok"
      },
      {
        "text": "적군 단일 목표에게 220%→440%의 병기 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "전열 목표를 우선적으로 선택한다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「1턴 동안 준비 후 2턴 동안 자신의 방어 관통이(가) 20% 증가하며」
    c.buff(0);
    // 「이후 적군 단일 목표에게 440%의 병기 피해를 준다」
    c.damage(0);
  },
});
