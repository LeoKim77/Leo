// 백전불태 · 전법 · 지휘 100%
// 원문: 통솔/지력/무력이 가장 높은 우군 단일 목표가 피해를 받으면 60% 확률로 통솔/지력/무력이 7포인트 증가하며, 8회 중첩될 수 있고, 전투 종료까지 지속된다. 동일한 목표에게 적용될 수 있다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "hundred-battles",
  name: "백전불태",
  kind: "지휘",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-05",
      "note": "그 능력치가 가장 높은 우군이 맞았을 때만 그 능력치 +7(각 60%) — 예전엔 누가 맞든 세 능력치 모두"
    }
  ],
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
      "status": "ok"
    },
    {
      "text": "전투 종료까지 지속된다",
      "status": "ok"
    },
    {
      "text": "동일한 목표에게 적용될 수 있다",
      "status": "ok"
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
          "target": "trigger_defender",
          "duration": 999,
          "maxStacks": 8
        },
        {
          "stat": "지력",
          "min": 3.5,
          "max": 7,
          "target": "trigger_defender",
          "duration": 999,
          "maxStacks": 8
        },
        {
          "stat": "무력",
          "min": 3.5,
          "max": 7,
          "target": "trigger_defender",
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
      "chance": 1
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
    const d = c.eventCtx && c.eventCtx.defender;
    if (!d) return;
    [['highest_command_ally', 0], ['highest_intel_ally', 1], ['highest_power_ally', 2]].forEach(([code, i]) => {
      if (c.targets(code as string)[0] === d && c.chance(0.6)) c.statMod(i as number);
    });
  },
});
