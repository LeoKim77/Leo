// 무쌍의 용사 · 고유 전법 · 액티브 22%~ 40%
// 원문: 전체 적군과 서로 1회의 일반 공격을 진행한다(서로 일반 공격 진행 시 자신의 무장 해제 상태 면역). 자신의 무력 수치가 목표보다 높으면 추가로 100%의 병기 피해를 준다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-lü-bu",
  name: "무쌍의 용사",
  kind: "액티브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "원문 대조 결과 이미 구현돼 있음 — 절 상태 표시만 바로잡음 (v1.12b 절 매칭이 낡음)"
    }
  ],
  clauses: [
    {
      "text": "전체 적군과 서로 1회의 일반 공격을 진행한다(서로 일반 공격 진행 시 자신의 무장 해제 상태 면역)",
      "status": "ok"
    },
    {
      "text": "자신의 무력 수치가 목표보다 높으면 추가로 100%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]",
        "damage[1]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_14",
    "legacyName": "무쌍의 용사",
    "legacyType": "액티브",
    "legacyProcRate": "22%~ 40%",
    "raw": "전체 적군과 서로 1회의 일반 공격을 진행한다(서로 일반 공격 진행 시 자신의 무장 해제 상태 면역). 자신의 무력 수치가 목표보다 높으면 추가로 50%→100%의 병기 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1,
          "max": 1,
          "target": "all_enemy",
          "reciprocal": true,
          "tag": "main",
          "asBasicAttack": true
        },
        {
          "dmgType": "병기",
          "min": 0.5,
          "max": 1,
          "target": "tag:main",
          "condition": {
            "type": "statCompareUnits",
            "who1": "attacker",
            "who2": "target",
            "stat": "무력",
            "op": ">"
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
        "text": "전체 적군과 서로 1회의 일반 공격을 진행한다(서로 일반 공격 진행 시 자신의 무장 해제 상태 면역)",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "자신의 무력 수치가 목표보다 높으면 추가로 50%→100%의 병기 피해를 준다",
        "impl": [
          "damage[0]",
          "damage[1]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「자신의 무력 수치가 목표보다 높으면 추가로 100%의 병기 피해를 준다」
    c.damage(0);   // 병기 100%, 대상 all_enemy
    c.damage(1);   // 병기 50%→100%, 대상 tag:main, 조건 statCompareUnits
  },
});
