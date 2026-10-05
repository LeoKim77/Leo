// 백리의성 · 고유 전법 · 지휘 100%
// 원문: 전투 시작 후 4턴 동안 전체 아군이 피해를 받기 직전 25% 확률로(통솔의 영향 받음) 1스택의 방어을(를) 획득한다. 4번째 턴 시작 시, 자신의 통솔이 40포인트 증가하며, 전체 적군에게 2턴 동안 지속되는 홍수 상태를 부여한다.
// 원문 절 구현: approx / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-xu-sheng",
  name: "백리의성",
  kind: "지휘",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "'피해를 받기 직전' 25%로 그 우군이 방어 1스택(4턴까지) — 예전엔 피해 뒤 전원 25%씩(사실상 6%), 4번째 턴 통솔 +40·홍수는 턴 시작에"
    }
  ],
  clauses: [
    {
      "text": "전투 시작 후 4턴 동안 전체 우군이 피해를 받기 직전 25% 확률로(통솔의 영향 받음) 1스택의 방어을(를) 획득한다",
      "status": "approx",
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
      "statusEffects": [
        {
          "name": "방어",
          "target": "trigger_defender"
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
      "event": "pre_damage",
      "role": "ally_taken",
      "chance": 0.25,
      "turnCond": {
        "maxTurn": 4
      }
    },
    "parts": [
      {
        "_timing": "turnStart",
        "onlyTurns": [
          4
        ],
        "effects": {
          "statMods": [
            {
              "stat": "통솔",
              "min": 20,
              "max": 40,
              "target": "self",
              "duration": 999,
              "maxStacks": 1
            }
          ],
          "statusEffects": [
            {
              "name": "홍수",
              "target": "all_enemy",
              "duration": 2
            }
          ]
        }
      }
    ]
  },
  run(c) {
    // 「전투 시작 후 4턴 동안 전체 우군이 피해를 받기 직전 25% 확률로(통솔의 영향 받음) 1스택의 방어을(를) 획득한다」
    c.status(0);   // 방어, 대상 trigger_defender
  },
});
