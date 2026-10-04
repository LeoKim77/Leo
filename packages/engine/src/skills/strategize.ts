// 전략 계획 · 전법 · 액티브 45%
// 원문: 2턴 동안 랜덤 적군 2명의 무력, 지력, 통솔, 선공이 25 감소한다(지력의 영향 받음), 2회 중첩될 수 있다.
// 원문 절 구현: ok / ok / ok / approx / note
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "strategize",
  name: "전략 계획",
  kind: "액티브",
  isUnique: false,
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
      "status": "approx",
      "reviewed": "지력 영향 반영(infMult)"
    },
    {
      "text": "2회 중첩될 수 있다",
      "status": "note"
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
          "maxStacks": 2
        },
        {
          "stat": "지력",
          "min": -25,
          "max": -25,
          "target": "random_enemy_n",
          "duration": 2,
          "maxStacks": 2
        },
        {
          "stat": "통솔",
          "min": -25,
          "max": -25,
          "target": "random_enemy_n",
          "duration": 2,
          "maxStacks": 2
        },
        {
          "stat": "선공",
          "min": -25,
          "max": -25,
          "target": "random_enemy_n",
          "duration": 2,
          "maxStacks": 2
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
    // (원문 절 매핑 없음)
    c.statMod(0);   // 무력 -25, 대상 random_enemy_n, 2턴, 최대 2중첩
    c.statMod(1);   // 지력 -25, 대상 random_enemy_n, 2턴, 최대 2중첩
    c.statMod(2);   // 통솔 -25, 대상 random_enemy_n, 2턴, 최대 2중첩
    c.statMod(3);   // 선공 -25, 대상 random_enemy_n, 2턴, 최대 2중첩
  },
});
