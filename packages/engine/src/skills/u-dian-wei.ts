// 고대의 악래 · 고유 전법 · 패시브 100%
// 원문: 자신의 반격 확률이 60% 증가하며, 자신이 피해를 받은 후, 2턴 동안 자신의 반격 피해가 20%, 통솔이 20포인트 증가한다. 5회 중첩될 수 있다.
// 원문 절 구현: ok / missing / ok / note
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-dian-wei",
  name: "고대의 악래",
  kind: "패시브",
  isUnique: true,
  clauses: [
    {
      "text": "자신의 반격 확률이 60% 증가하며",
      "status": "ok",
      "impl": [
        "alwaysOnBuffs[0]"
      ]
    },
    {
      "text": "자신이 피해를 받은 후, 2턴 동안 자신의 반격 피해가 20%",
      "status": "missing"
    },
    {
      "text": "통솔이 20포인트 증가한다",
      "status": "ok",
      "impl": [
        "statMods[0]"
      ]
    },
    {
      "text": "5회 중첩될 수 있다",
      "status": "note"
    }
  ],
  def: {
    "legacyId": "uskill_9",
    "legacyName": "고대의 악래",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "자신의 반격 확률이 30%→60% 증가하며, 자신이 피해를 받은 후, 2턴 동안 자신의 반격 피해가 10%→20%, 통솔이 10→20포인트 증가한다. 5회 중첩될 수 있다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "반격피해",
          "min": 0.1,
          "max": 0.2,
          "target": "self",
          "duration": 2,
          "maxStacks": 5
        }
      ],
      "statMods": [
        {
          "stat": "통솔",
          "min": 10,
          "max": 20,
          "duration": 2,
          "maxStacks": 5
        }
      ],
      "targets": [
        "self"
      ],
      "statusEffects": []
    },
    "trigger": {
      "event": "damage",
      "role": "taken",
      "chance": 1
    },
    "triggerApplied": true,
    "alwaysOnBuffs": [
      {
        "stat": "반격확률",
        "min": 0.3,
        "max": 0.6,
        "target": "self",
        "duration": 999,
        "maxStacks": 1
      }
    ],
    "clauses": [
      {
        "text": "자신의 반격 확률이 30%→60% 증가",
        "impl": [
          "alwaysOnBuffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "자신이 피해를 받은 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "2턴 동안 자신의 반격 피해가 10%→20%",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "통솔이 10→20포인트 증가한다",
        "impl": [
          "statMods[0]"
        ],
        "status": "ok"
      },
      {
        "text": "5회 중첩될 수 있다",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「통솔이 20포인트 증가한다」
    c.statMod(0);   // 통솔 10→20, 2턴, 최대 5중첩
    c.buff(0);   // 반격피해 +10%→20%, 대상 self, 2턴, 최대 5중첩
  },
});
