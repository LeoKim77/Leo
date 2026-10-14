// 독설가 · 전법 · 패시브 100%
// 원문: 적군이 디버프 상태를 받으면 60% 확률로 랜덤 적군 단일 목표에게 110%의 책략 피해를 주며, 매 턴 최대 2회 발동된다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "talk-laugh-heart",
  name: "독설가",
  kind: "패시브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "원문 대조 결과 이미 구현돼 있음 — 절 상태 표시만 바로잡음 (v1.12b 절 매칭이 낡음)"
    }
  ],
  clauses: [
    {
      "text": "적군이 디버프 상태를 받으면 60% 확률로 랜덤 적군 단일 목표에게 110%의 책략 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]",
        "trigger"
      ]
    },
    {
      "text": "매 턴 최대 2회 발동된다",
      "status": "ok"
    }
  ],
  def: {
    "legacyId": "skill_67",
    "legacyName": "독설가",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "적군이 디버프 상태를 받으면 60% 확률로 랜덤 적군 단일 목표에게 55%→110%의 책략 피해를 주며, 매 턴 최대 2회 발동된다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.55,
          "max": 1.1,
          "target": "random_enemy_1"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "trigger": {
      "maxPerTurn": 2,
      "event": "debuff",
      "role": "ally_side",
      "chance": 0.6
    },
    "triggerApplied": true,
    "clauses": [
      {
        "text": "적군이 디버프 상태를 받으면 60% 확률로 랜덤 적군 단일 목표에게 55%→110%의 책략 피해를 주며",
        "impl": [
          "damage[0]",
          "trigger"
        ],
        "status": "ok"
      },
      {
        "text": "매 턴 최대 2회 발동된다",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「적군이 디버프 상태를 받으면 60% 확률로 랜덤 적군 단일 목표에게 110%의 책략 피해를 주며」
    c.damage(0);   // 책략 55%→110%, 대상 random_enemy_1
  },
});
