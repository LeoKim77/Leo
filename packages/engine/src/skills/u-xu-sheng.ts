// 백리의성 · 고유 전법 · 지휘 100%
// 원문: 전투 시작 후 4턴 동안 전체 우군이 피해를 받기 직전 25% 확률로(통솔의 영향 받음) 1스택의 방어을(를) 획득한다. 4번째 턴 시작 시, 자신의 통솔이 40포인트 증가하며, 전체 적군에게 2턴 동안 지속되는 홍수 상태를 부여한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-xu-sheng",
  name: "백리의성",
  kind: "지휘",
  isUnique: true,
  clauses: [
    {
      "text": "전투 시작 후 4턴 동안 전체 우군이 피해를 받기 직전 25% 확률로(통솔의 영향 받음) 1스택의 방어을(를) 획득한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "4번째 턴 시작 시, 자신의 통솔이 40포인트 증가하며",
      "status": "ok",
      "impl": [
        "statMods[0]"
      ]
    },
    {
      "text": "전체 적군에게 2턴 동안 지속되는 홍수 상태를 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[1]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_33",
    "legacyName": "백리의성",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "전투 시작 후 4턴 동안 전체 아군이 피해를 받기 직전 12.5%→25% 확률로(통솔의 영향 받음) 1스택의 방어을(를) 획득한다. 4번째 턴 시작 시, 자신의 통솔이 20→40포인트 증가하며, 전체 적군에게 2턴 동안 지속되는 홍수 상태를 부여한다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "통솔",
          "min": 20,
          "max": 40,
          "target": "self",
          "duration": 999,
          "turnCond": {
            "turns": [
              4
            ]
          }
        }
      ],
      "statusEffects": [
        {
          "name": "방어",
          "target": "all_ally",
          "chance": 0.25,
          "turnCond": {
            "maxTurn": 4
          }
        },
        {
          "name": "홍수",
          "target": "all_enemy",
          "turnCond": {
            "turns": [
              4
            ]
          }
        }
      ],
      "targets": []
    },
    "preciseApplied": true,
    "clauses": [
      {
        "text": "전투 시작 후 4턴 동안 전체 아군이 피해를 받기 직전 12.5%→25% 확률로(통솔의 영향 받음) 1스택의 방어을(를) 획득한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "4번째 턴 시작 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "자신의 통솔이 20→40포인트 증가",
        "impl": [
          "statMods[0]"
        ],
        "status": "ok"
      },
      {
        "text": "전체 적군에게 2턴 동안 지속되는 홍수 상태를 부여한다",
        "impl": [
          "statusEffects[1]"
        ],
        "status": "ok"
      }
    ],
    "trigger": {
      "event": "damage",
      "role": "ally_taken",
      "chance": 0.25
    }
  },
  run(c) {
    // 「4번째 턴 시작 시, 자신의 통솔이 40포인트 증가하며」
    c.statMod(0);   // 통솔 20→40, 대상 self, 전투 종료까지
    // 「전투 시작 후 4턴 동안 전체 우군이 피해를 받기 직전 25% 확률로(통솔의 영향 받음) 1스택의 방어을(를) 획득한다」
    c.status(0);   // 방어, 대상 all_ally, 확률 25%
    // 「전체 적군에게 2턴 동안 지속되는 홍수 상태를 부여한다」
    c.status(1);   // 홍수, 대상 all_enemy
  },
});
