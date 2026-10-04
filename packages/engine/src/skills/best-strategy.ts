// 충신의 기재 · 전법 · 패시브 100%
// 원문: 자신의 묘책이(가) 24% 증가한다(지력의 영향 받음). 책략 피해를 준 후, 50% 확률로 2턴 동안 자신의 지력이 10포인트 증가하며, 4회 중첩될 수 있다.
// 원문 절 구현: ok / ok / note
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "best-strategy",
  name: "충신의 기재",
  kind: "패시브",
  isUnique: false,
  clauses: [
    {
      "text": "자신의 묘책이(가) 24% 증가한다(지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "alwaysOnBuffs[0]"
      ]
    },
    {
      "text": "책략 피해를 준 후, 50% 확률로 2턴 동안 자신의 지력이 10포인트 증가하며",
      "status": "ok",
      "impl": [
        "statMods[0]",
        "trigger"
      ]
    },
    {
      "text": "4회 중첩될 수 있다",
      "status": "note"
    }
  ],
  def: {
    "legacyId": "skill_69",
    "legacyName": "충신의 기재",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "자신의 묘책이(가) 12%→24% 증가한다(지력의 영향 받음). 책략 피해를 준 후, 50% 확률로 2턴 동안 자신의 지력이 5→10포인트 증가하며, 4회 중첩될 수 있다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "지력",
          "min": 5,
          "max": 10,
          "duration": 2,
          "maxStacks": 4
        }
      ],
      "targets": [
        "self"
      ],
      "statusEffects": []
    },
    "trigger": {
      "event": "damage",
      "role": "dealt",
      "filterDmgType": "책략",
      "chance": 0.5
    },
    "triggerApplied": true,
    "alwaysOnBuffs": [
      {
        "stat": "묘책",
        "min": 0.12,
        "max": 0.24,
        "target": "self",
        "duration": 999,
        "maxStacks": 1
      }
    ],
    "clauses": [
      {
        "text": "자신의 묘책이(가) 12%→24% 증가한다(지력의 영향 받음)",
        "impl": [
          "alwaysOnBuffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "책략 피해를 준 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "50% 확률로 2턴 동안 자신의 지력이 5→10포인트 증가",
        "impl": [
          "statMods[0]",
          "trigger"
        ],
        "status": "ok"
      },
      {
        "text": "4회 중첩될 수 있다",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「책략 피해를 준 후, 50% 확률로 2턴 동안 자신의 지력이 10포인트 증가하며」
    c.statMod(0);   // 지력 5→10, 2턴, 최대 4중첩
  },
});
