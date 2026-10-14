// 원문사극 · 전법 · 추격 70%
// 원문: 일반 공격 후, 목표에게 220%의 병기 피해를 부여한다. 자신이 후열이면 75% 확률로 2턴 동안 자신의 액티브 전법 발동률이 10% 증가하며, 3회 중첩할 수 있다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "gate-halberd",
  name: "원문사극",
  kind: "추격",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "발동 확률을 원문 70%로 (예전 75% — 후열 버프 확률과 섞임)"
    }
  ],
  clauses: [
    {
      "text": "일반 공격 후, 목표에게 220%의 병기 피해를 부여한다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "자신이 후열이면 75% 확률로 2턴 동안 자신의 액티브 전법 발동률이 10% 증가하며",
      "status": "ok",
      "impl": [
        "buffs[0]",
        "trigger"
      ]
    },
    {
      "text": "3회 중첩할 수 있다",
      "status": "ok"
    }
  ],
  def: {
    "legacyId": "skill_53",
    "legacyName": "원문사극",
    "legacyType": "추격",
    "legacyProcRate": "70%",
    "raw": "일반 공격 후, 목표에게 110%→220%의 병기 피해를 부여한다. 자신이 후열이면 75% 확률로 2턴 동안 자신의 액티브 전법 발동률이 5%→10% 증가하며, 3회 중첩할 수 있다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.1,
          "max": 2.2,
          "target": "trigger_defender"
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "액티브발동률",
          "min": 0.05,
          "max": 0.1,
          "target": "self",
          "chance": 0.75,
          "duration": 2,
          "maxStacks": 3,
          "condition": {
            "type": "position",
            "who": "self",
            "pos": "back"
          }
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "specialApplied": true,
    "preciseApplied": true,
    "trigger": {
      "event": "damage",
      "role": "dealt",
      "chance": 0.7
    },
    "procRateFixed": true,
    "clauses": [
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "목표에게 110%→220%의 병기 피해를 부여한다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "자신이 후열이면 75% 확률로 2턴 동안 자신의 액티브 전법 발동률이 5%→10% 증가",
        "impl": [
          "buffs[0]",
          "trigger"
        ],
        "status": "ok"
      },
      {
        "text": "3회 중첩할 수 있다",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「일반 공격 후, 목표에게 220%의 병기 피해를 부여한다」
    c.damage(0);   // 병기 110%→220%, 대상 trigger_defender
    // 「자신이 후열이면 75% 확률로 2턴 동안 자신의 액티브 전법 발동률이 10% 증가하며」
    c.buff(0);   // 액티브발동률 +5%→10%, 대상 self, 확률 75%, 2턴, 최대 3중첩, 조건 position
  },
});
