// 화공전술 · 전법 · 액티브 45%
// 원문(도감 2026-10-07): 전체 적군에게 80%의 책략 피해를 주고, 2턴 동안 지속되는 화공 상태를 부여한다. 이후 다시 소각을 3회 진행한다. 소각: 랜덤 적군 단일 목표에게 80%의 책략 피해를 준다. 목표가 폭풍 상태면 적진 소각의 피해 수치가 30% 증가한다.
// 원문 절 구현: ok / ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "fire-camp",
  name: "화공전술",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-07",
      "note": "도감 녹화(S1 전설): 용어만 바뀜 — \"분영\" → \"소각\"(적진 소각). 동작은 같음"
    }
  ],
  clauses: [
    {
      "text": "전체 적군에게 80%의 책략 피해를 주고",
      "status": "ok",
      "impl": [
        "damage[0]",
        "damage[1]",
        "damage[2]",
        "damage[3]"
      ]
    },
    {
      "text": "2턴 동안 지속되는 화공 상태를 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "이후 다시 소각을 3회 진행한다",
      "status": "ok",
      "impl": [
        "damage[0]",
        "damage[1]",
        "damage[2]",
        "damage[3]"
      ]
    },
    {
      "text": "소각: 랜덤 적군 단일 목표에게 80%의 책략 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]",
        "damage[1]",
        "damage[2]",
        "damage[3]"
      ]
    },
    {
      "text": "목표가 폭풍 상태면 적진 소각의 피해 수치가 30% 증가한다",
      "status": "ok",
      "impl": [
        "damage[1].conditionalBonusMult",
        "damage[2].conditionalBonusMult",
        "damage[3].conditionalBonusMult"
      ]
    }
  ],
  def: {
    "legacyId": "skill_31",
    "legacyName": "화공전술",
    "legacyType": "액티브",
    "legacyProcRate": "45%",
    "raw": "전체 적군에게 40%→80%의 책략 피해를 주고, 2턴 동안 지속되는 화공 상태를 부여한다. 이후 다시 소각을 3회 진행한다. 소각: 랜덤 적군 단일 목표에게 40%→80%의 책략 피해를 준다. 목표가 폭풍 상태면 적진 소각의 피해 수치가 30% 증가한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.4,
          "max": 0.8,
          "target": "all_enemy",
          "tag": "main"
        },
        {
          "dmgType": "책략",
          "min": 0.4,
          "max": 0.8,
          "target": "random_enemy_1",
          "conditionalBonusMult": {
            "condition": {
              "type": "hasStatus",
              "who": "target",
              "status": "폭풍"
            },
            "mult": 0.3
          }
        },
        {
          "dmgType": "책략",
          "min": 0.4,
          "max": 0.8,
          "target": "random_enemy_1",
          "conditionalBonusMult": {
            "condition": {
              "type": "hasStatus",
              "who": "target",
              "status": "폭풍"
            },
            "mult": 0.3
          }
        },
        {
          "dmgType": "책략",
          "min": 0.4,
          "max": 0.8,
          "target": "random_enemy_1",
          "conditionalBonusMult": {
            "condition": {
              "type": "hasStatus",
              "who": "target",
              "status": "폭풍"
            },
            "mult": 0.3
          }
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "화공",
          "target": "tag:main"
        }
      ],
      "targets": []
    },
    "preciseApplied": true,
    "clauses": [
      {
        "text": "전체 적군에게 40%→80%의 책략 피해를 주고",
        "impl": [
          "damage[0]",
          "damage[1]",
          "damage[2]",
          "damage[3]"
        ],
        "status": "ok"
      },
      {
        "text": "2턴 동안 지속되는 화공 상태를 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "다시 소각을 3회 진행한다. 소각: 랜덤 적군 단일 목표에게 40%→80%의 책략 피해를 준다",
        "impl": [
          "damage[0]",
          "damage[1]",
          "damage[2]",
          "damage[3]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 폭풍 상태면 적진 소각의 피해 수치가 30% 증가한다",
        "impl": [
          "damage[1].conditionalBonusMult",
          "damage[2].conditionalBonusMult",
          "damage[3].conditionalBonusMult"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「전체 적군에게 80%의 책략 피해를 주고」
    c.damage(0);   // 책략 40%→80%, 대상 all_enemy
    c.damage(1);   // 책략 40%→80%, 대상 random_enemy_1
    c.damage(2);   // 책략 40%→80%, 대상 random_enemy_1
    c.damage(3);   // 책략 40%→80%, 대상 random_enemy_1
    // 「2턴 동안 지속되는 화공 상태를 부여한다」
    c.status(0);   // 화공, 대상 tag:main
  },
});
