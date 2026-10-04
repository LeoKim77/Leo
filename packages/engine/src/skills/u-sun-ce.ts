// 강동 제패 · 고유 전법 · 액티브 65%
// 원문: 적군 랜덤 2명에게 250%의 병기 피해를 주고, 자신과 랜덤 우군 단일 목표의 병력을 회복한다(치유율 65%, 무력의 영향 받음).
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-sun-ce",
  name: "강동 제패",
  kind: "액티브",
  isUnique: true,
  clauses: [
    {
      "text": "적군 랜덤 2명에게 250%의 병기 피해를 주고",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "자신과 랜덤 우군 단일 목표의 병력을 회복한다(치유율 65%, 무력의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_42",
    "legacyName": "강동 제패",
    "legacyType": "액티브",
    "legacyProcRate": "65%",
    "raw": "적군 랜덤 2명에게 125%→250%의 병기 피해를 주고, 자신과 랜덤 아군 단일 목표의 병력을 회복한다(치유율 32.5%→65%, 무력의 영향 받음).",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.25,
          "max": 2.5,
          "target": "random_enemy_n"
        }
      ],
      "heal": [
        {
          "min": 0.325,
          "max": 0.65,
          "target": "self_and_random_ally_1"
        }
      ],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_ally_n",
        "random_ally_n",
        "self"
      ],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "적군 랜덤 2명에게 125%→250%의 병기 피해를 주고",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "자신과 랜덤 아군 단일 목표의 병력을 회복한다(치유율 32.5%→65%",
        "impl": [
          "heal[0]"
        ],
        "status": "ok"
      },
      {
        "text": "무력의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      }
    ],
    "overrideNote": {
      "date": "2026-10-04",
      "found": "공용 규칙 R-028 대상 정리 (자신과 우군 혼합 대상 점검)",
      "reason": "'적군 랜덤 2명에게 피해, 자신과 랜덤 우군 단일 목표 회복' — 피해가 적 1명에게만, 회복이 자신 포함 2명 무작위로 나가던 것을 원문대로"
    }
  },
  run(c) {
    // 「적군 랜덤 2명에게 250%의 병기 피해를 주고」
    c.damage(0);   // 병기 125%→250%, 대상 random_enemy_n
    // 「자신과 랜덤 우군 단일 목표의 병력을 회복한다(치유율 65%, 무력의 영향 받음)」
    c.heal(0);   // 치유율 32.5%→65%, 대상 self_and_random_ally_1
  },
});
