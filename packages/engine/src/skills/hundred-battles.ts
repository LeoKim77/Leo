// 백전불태 · 전법 · 지휘 100%
// 원문: 통솔/지력/무력이 가장 높은 우군 단일 목표가 피해를 받으면 60% 확률로 통솔/지력/무력이 7포인트 증가하며, 8회 중첩될 수 있고, 전투 종료까지 지속된다. 동일한 목표에게 적용될 수 있다.
// 원문 절 구현: ok / note / note / note
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "hundred-battles",
  name: "백전불태",
  kind: "지휘",
  isUnique: false,
  clauses: [
    {
      "text": "통솔/지력/무력이 가장 높은 우군 단일 목표가 피해를 받으면 60% 확률로 통솔/지력/무력이 7포인트 증가하며",
      "status": "ok",
      "impl": [
        "statMods[0]",
        "statMods[1]",
        "statMods[2]",
        "trigger"
      ]
    },
    {
      "text": "8회 중첩될 수 있고",
      "status": "note"
    },
    {
      "text": "전투 종료까지 지속된다",
      "status": "note"
    },
    {
      "text": "동일한 목표에게 적용될 수 있다",
      "status": "note"
    }
  ],
  def: {
    "legacyId": "skill_4",
    "legacyName": "백전불태",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "통솔/지력/무력이 가장 높은 아군 단일 목표가 피해를 받으면 60% 확률로 통솔/지력/무력이 3.5→7포인트 증가하며, 8회 중첩될 수 있고, 전투 종료까지 지속된다. 동일한 목표에게 적용될 수 있다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "통솔",
          "min": 3.5,
          "max": 7,
          "target": "highest_command_ally",
          "duration": 999,
          "maxStacks": 8
        },
        {
          "stat": "지력",
          "min": 3.5,
          "max": 7,
          "target": "highest_intel_ally",
          "duration": 999,
          "maxStacks": 8
        },
        {
          "stat": "무력",
          "min": 3.5,
          "max": 7,
          "target": "highest_power_ally",
          "duration": 999,
          "maxStacks": 8
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "trigger": {
      "event": "damage",
      "role": "ally_taken",
      "chance": 0.6
    },
    "triggerApplied": true,
    "preciseApplied": true,
    "clauses": [
      {
        "text": "통솔/지력/무력이 가장 높은 아군 단일 목표가 피해를 받으면 60% 확률로 통솔/지력/무력이 3.5→7포인트 증가",
        "impl": [
          "statMods[0]",
          "statMods[1]",
          "statMods[2]",
          "trigger"
        ],
        "status": "ok"
      },
      {
        "text": "8회 중첩될 수 있고",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "전투 종료까지 지속된다",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "동일한 목표에게 적용될 수 있다",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「통솔/지력/무력이 가장 높은 우군 단일 목표가 피해를 받으면 60% 확률로 통솔/지력/무력이 7포인트 증가하며」
    c.statMod(0);   // 통솔 3.5→7, 대상 highest_command_ally, 전투 종료까지, 최대 8중첩
    c.statMod(1);   // 지력 3.5→7, 대상 highest_intel_ally, 전투 종료까지, 최대 8중첩
    c.statMod(2);   // 무력 3.5→7, 대상 highest_power_ally, 전투 종료까지, 최대 8중첩
  },
});
