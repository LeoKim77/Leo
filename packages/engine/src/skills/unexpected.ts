// 출기불의 · 전법 · 액티브 55%
// 원문: 랜덤 적군 단일 목표에게 350%의 책략 피해를 주며, 목표가 디버프 상태를 보유한 경우, 이번 피해 수치가 25% 증가한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "unexpected",
  name: "출기불의",
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
      "text": "랜덤 적군 단일 목표에게 350%의 책략 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "목표가 디버프 상태를 보유한 경우, 이번 피해 수치가 25% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "legacyId": "skill_29",
    "legacyName": "출기불의",
    "legacyType": "액티브",
    "legacyProcRate": "55%",
    "raw": "랜덤 적군 단일 목표에게 175%→350%의 책략 피해를 주며, 목표가 디버프 상태를 보유한 경우, 이번 피해 수치가 25% 증가한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.75,
          "max": 3.5,
          "target": "random_enemy_1",
          "conditionalBonusMult": {
            "condition": {
              "type": "hasAnyDebuff",
              "who": "target"
            },
            "mult": 0.25
          }
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "specialApplied": true,
    "clauses": [
      {
        "text": "랜덤 적군 단일 목표에게 175%→350%의 책략 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 디버프 상태를 보유한 경우",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "이번 피해 수치가 25% 증가한다",
        "impl": [
          "damage[0].conditionalBonusMult"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「랜덤 적군 단일 목표에게 350%의 책략 피해를 주며」
    c.damage(0);   // 책략 175%→350%, 대상 random_enemy_1
  },
});
