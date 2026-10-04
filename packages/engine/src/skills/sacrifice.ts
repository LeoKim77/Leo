// 정의의 희생 · 전법 · 지휘 100%
// 원문: 전투 시작 후 2턴 동안 전체 아군의 연타 확률이 30% 증가하며, 2턴 동안 무력이 가장 높은 아군 단일 목표가 정신 회복을(를) 획득하고, 자신이 무장해제을(를) 획득한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "sacrifice",
  name: "정의의 희생",
  kind: "지휘",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "원문 대조 결과 이미 구현돼 있음 — 절 상태 표시만 바로잡음 (v1.12b 절 매칭이 낡음)"
    }
  ],
  clauses: [
    {
      "text": "전투 시작 후 2턴 동안 전체 아군의 연타 확률이 30% 증가하며",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "2턴 동안 무력이 가장 높은 아군 단일 목표가 정신 회복을(를) 획득하고",
      "status": "ok",
      "impl": [
        "statusEffects[1]"
      ]
    },
    {
      "text": "자신이 무장해제을(를) 획득한다",
      "status": "ok"
    }
  ],
  def: {
    "legacyId": "skill_8",
    "legacyName": "정의의 희생",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "전투 시작 후 2턴 동안 전체 아군의 연타 확률이 15%→30% 증가하며, 2턴 동안 무력이 가장 높은 아군 단일 목표가 정신 회복을(를) 획득하고, 자신이 무장해제을(를) 획득한다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "연타확률",
          "min": 0.15,
          "max": 0.3,
          "duration": 2,
          "maxStacks": 1,
          "target": "all_ally"
        }
      ],
      "statMods": [],
      "targets": [
        "all_ally",
        "highest_power_ally",
        "random_ally_n",
        "self"
      ],
      "statusEffects": [
        {
          "name": "무장 해제",
          "target": "self",
          "duration": 2
        },
        {
          "name": "정신 회복",
          "target": "highest_power_ally",
          "duration": 2
        }
      ]
    },
    "clauses": [
      {
        "text": "전투 시작 후 2턴 동안 전체 아군의 연타 확률이 15%→30% 증가",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "2턴 동안 무력이 가장 높은 아군 단일 목표가 정신 회복을(를) 획득",
        "impl": [
          "statusEffects[1]"
        ],
        "status": "ok"
      },
      {
        "text": "자신이 무장해제을(를) 획득한다",
        "impl": [],
        "status": "MISSING"
      }
    ],
    "overrideNote": {
      "date": "2026-10-04",
      "found": "공용 규칙 R-028 대상 정리 (자신과 우군 혼합 대상 점검)",
      "reason": "'전체 우군 연타 확률 증가'가 자신에게만, 정신 회복·무장 해제 대상이 뒤섞이던 것을 원문대로: 연타 → 전체 우군, 정신 회복 → 무력 최고 우군, 무장 해제 → 자신 (각 2턴)"
    }
  },
  run(c) {
    // 「전투 시작 후 2턴 동안 전체 아군의 연타 확률이 30% 증가하며」
    c.buff(0);   // 연타확률 +15%→30%, 대상 all_ally, 2턴, 최대 1중첩
    c.status(0);   // 무장 해제, 대상 self, 2턴
    // 「2턴 동안 무력이 가장 높은 아군 단일 목표가 정신 회복을(를) 획득하고」
    c.status(1);   // 정신 회복, 대상 highest_power_ally, 2턴
  },
});
