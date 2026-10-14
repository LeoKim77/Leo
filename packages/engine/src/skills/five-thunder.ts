// 청천벽력 · 전법 · 액티브 50%
// 원문: 1턴 동안 준비 후 랜덤 적군 단일 목표에게 160%의 책략 피해를 주며, 총 5회 시전한다. 홍수 상태인 목표를 명중할 때마다 해당 피해가 40% 증가한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "five-thunder",
  name: "청천벽력",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "원문 대조 결과 이미 구현돼 있음 — 절 상태 표시만 바로잡음 (v1.12b 절 매칭이 낡음)"
    }
  ],
  clauses: [
    {
      "text": "1턴 동안 준비 후 랜덤 적군 단일 목표에게 160%의 책략 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]",
        "damage[1]",
        "damage[2]",
        "damage[3]",
        "damage[4]",
        "prepTurns"
      ]
    },
    {
      "text": "총 5회 시전한다",
      "status": "ok"
    },
    {
      "text": "홍수 상태인 목표를 명중할 때마다 해당 피해가 40% 증가한다",
      "status": "ok",
      "impl": [
        "damage[0].conditionalBonusMult",
        "damage[1].conditionalBonusMult",
        "damage[2].conditionalBonusMult",
        "damage[3].conditionalBonusMult",
        "damage[4].conditionalBonusMult"
      ]
    }
  ],
  def: {
    "legacyId": "skill_28",
    "legacyName": "청천벽력",
    "legacyType": "액티브",
    "legacyProcRate": "50%",
    "raw": "1턴 동안 준비 후 랜덤 적군 단일 목표에게 80%→160%의 책략 피해를 주며, 총 5회 시전한다. 홍수 상태인 목표를 명중할 때마다 해당 피해가 40% 증가한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.8,
          "max": 1.6,
          "target": "random_enemy_1",
          "conditionalBonusMult": {
            "condition": {
              "type": "hasStatus",
              "who": "target",
              "status": "홍수"
            },
            "mult": 0.4
          }
        },
        {
          "dmgType": "책략",
          "min": 0.8,
          "max": 1.6,
          "target": "random_enemy_1",
          "conditionalBonusMult": {
            "condition": {
              "type": "hasStatus",
              "who": "target",
              "status": "홍수"
            },
            "mult": 0.4
          }
        },
        {
          "dmgType": "책략",
          "min": 0.8,
          "max": 1.6,
          "target": "random_enemy_1",
          "conditionalBonusMult": {
            "condition": {
              "type": "hasStatus",
              "who": "target",
              "status": "홍수"
            },
            "mult": 0.4
          }
        },
        {
          "dmgType": "책략",
          "min": 0.8,
          "max": 1.6,
          "target": "random_enemy_1",
          "conditionalBonusMult": {
            "condition": {
              "type": "hasStatus",
              "who": "target",
              "status": "홍수"
            },
            "mult": 0.4
          }
        },
        {
          "dmgType": "책략",
          "min": 0.8,
          "max": 1.6,
          "target": "random_enemy_1",
          "conditionalBonusMult": {
            "condition": {
              "type": "hasStatus",
              "who": "target",
              "status": "홍수"
            },
            "mult": 0.4
          }
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "prepTurns": 1,
    "clauses": [
      {
        "text": "1턴 동안 준비 후 랜덤 적군 단일 목표에게 80%→160%의 책략 피해를 주며",
        "impl": [
          "damage[0]",
          "damage[1]",
          "damage[2]",
          "damage[3]",
          "damage[4]",
          "prepTurns"
        ],
        "status": "ok"
      },
      {
        "text": "총 5회 시전한다",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "홍수 상태인 목표를 명중할 때마다 해당 피해가 40% 증가한다",
        "impl": [
          "damage[0].conditionalBonusMult",
          "damage[1].conditionalBonusMult",
          "damage[2].conditionalBonusMult",
          "damage[3].conditionalBonusMult",
          "damage[4].conditionalBonusMult"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「1턴 동안 준비 후 랜덤 적군 단일 목표에게 160%의 책략 피해를 주며」
    c.damage(0);   // 책략 80%→160%, 대상 random_enemy_1
    c.damage(1);   // 책략 80%→160%, 대상 random_enemy_1
    c.damage(2);   // 책략 80%→160%, 대상 random_enemy_1
    c.damage(3);   // 책략 80%→160%, 대상 random_enemy_1
    c.damage(4);   // 책략 80%→160%, 대상 random_enemy_1
  },
});
