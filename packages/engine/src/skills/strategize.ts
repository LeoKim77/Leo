// 전략 계획 · 전법 · 액티브 45%
// 원문: 2턴 동안 랜덤 적군 2명의 무력, 지력, 통솔, 선공이 25 감소한다(지력의 영향 받음), 2회 중첩될 수 있다.
// 원문 절 구현: ok / ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "strategize",
  name: "전략 계획",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "4가지 능력치 감소가 같은 랜덤 적 2명에게 (예전엔 능력치마다 대상을 따로 뽑음), 지력 영향"
    }
  ],
  clauses: [
    {
      "text": "2턴 동안 랜덤 적군 2명의 무력",
      "status": "ok",
      "reviewed": "검토됨"
    },
    {
      "text": "지력",
      "status": "ok",
      "reviewed": "검토됨"
    },
    {
      "text": "통솔",
      "status": "ok",
      "reviewed": "검토됨"
    },
    {
      "text": "선공이 25 감소한다(지력의 영향 받음)",
      "status": "ok",
      "reviewed": "지력 영향 반영(infMult)"
    },
    {
      "text": "2회 중첩될 수 있다",
      "status": "ok"
    }
  ],
  def: {
    "legacyId": "skill_40",
    "legacyName": "전략 계획",
    "legacyType": "액티브",
    "legacyProcRate": "45%",
    "raw": "2턴 동안 랜덤 적군 2명의 무력, 지력, 통솔, 선공이 12.5→25 감소한다(지력의 영향 받음), 2회 중첩될 수 있다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "무력",
          "min": -25,
          "max": -25,
          "target": "random_enemy_n",
          "duration": 2,
          "maxStacks": 2,
          "inf": {
            "stats": [
              "지력"
            ],
            "who": "self"
          },
          "tag": "two"
        },
        {
          "stat": "지력",
          "min": -25,
          "max": -25,
          "target": "tag:two",
          "duration": 2,
          "maxStacks": 2,
          "inf": {
            "stats": [
              "지력"
            ],
            "who": "self"
          }
        },
        {
          "stat": "통솔",
          "min": -25,
          "max": -25,
          "target": "tag:two",
          "duration": 2,
          "maxStacks": 2,
          "inf": {
            "stats": [
              "지력"
            ],
            "who": "self"
          }
        },
        {
          "stat": "선공",
          "min": -25,
          "max": -25,
          "target": "tag:two",
          "duration": 2,
          "maxStacks": 2,
          "inf": {
            "stats": [
              "지력"
            ],
            "who": "self"
          }
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "manualOverride": true,
    "preciseApplied": true,
    "clauses": [
      {
        "text": "2턴 동안 랜덤 적군 2명의 무력",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "선공이 12.5→25 감소한다(지력의 영향 받음)",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "2회 중첩될 수 있다",
        "impl": [],
        "status": "NOTE"
      }
    ],
    "overrideNote": {
      "date": "2026-10-02",
      "found": "감사 S09 / 절 검토",
      "reason": "레벨 보간이 뒤집혀(25→12.5) 10레벨에서 12.5만 감소했다. 원문 10레벨 25 감소."
    }
  },
  run(c) {
    // 「2턴 동안 랜덤 적군 2명의 무력」
    // 「선공이 25 감소한다(지력의 영향 받음)」
    c.statMod(0); c.statMod(1); c.statMod(2); c.statMod(3);   // 랜덤 적 2명(같은 2명) 무력·지력·통솔·선공 −25, 2턴, 2중첩
  },
});
