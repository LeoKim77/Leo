// 비분시 · 고유 전법 · 액티브 65%
// 원문: 전체 우군의 병력을 회복하고(치유율 120%, 지력의 영향 받음), 1스택의 방어을(를) 부여한다. 목표가 전열이면 추가로 병력을 회복한다(치유율 50%, 지력의 영향 받음).
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-cai-wenji",
  name: "비분시",
  kind: "액티브",
  isUnique: true,
  clauses: [
    {
      "text": "전체 우군의 병력을 회복하고(치유율 120%, 지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]",
        "heal[1]"
      ]
    },
    {
      "text": "1스택의 방어을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "목표가 전열이면 추가로 병력을 회복한다(치유율 50%, 지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]",
        "heal[1]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_34",
    "legacyName": "비분시",
    "legacyType": "액티브",
    "legacyProcRate": "65%",
    "raw": "전체 아군의 병력을 회복하고(치유율 60%→120%, 지력의 영향 받음), 1스택의 방어을(를) 부여한다. 목표가 전열이면 추가로 병력을 회복한다(치유율 25%→50%, 지력의 영향 받음).",
    "effects": {
      "damage": [],
      "heal": [
        {
          "min": 0.6,
          "max": 1.2,
          "target": "all_ally"
        },
        {
          "min": 0.25,
          "max": 0.5,
          "target": "all_ally",
          "condition": {
            "type": "position",
            "who": "target",
            "pos": "front"
          }
        }
      ],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "방어",
          "target": "all_ally"
        }
      ],
      "targets": []
    },
    "preciseApplied": true,
    "clauses": [
      {
        "text": "전체 아군의 병력을 회복",
        "impl": [
          "heal[0]",
          "heal[1]"
        ],
        "status": "ok"
      },
      {
        "text": "(치유율 60%→120%",
        "impl": [
          "heal[0]",
          "heal[1]"
        ],
        "status": "ok"
      },
      {
        "text": "지력의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "1스택의 방어을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 전열이면 추가로 병력을 회복한다(치유율 25%→50%",
        "impl": [
          "heal[0]",
          "heal[1]"
        ],
        "status": "ok"
      },
      {
        "text": "지력의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「전체 우군의 병력을 회복하고(치유율 120%, 지력의 영향 받음)」
    c.heal(0);   // 치유율 60%→120%, 대상 all_ally
    c.heal(1);   // 치유율 25%→50%, 대상 all_ally, 조건 position
    // 「1스택의 방어을(를) 부여한다」
    c.status(0);   // 방어, 대상 all_ally
  },
});
