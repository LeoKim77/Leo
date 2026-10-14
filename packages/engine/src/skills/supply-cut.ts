// 보급 차단 · 전법 · 지휘 100%
// 원문: 턴 시작 시 적군 단일 목표에게 2턴 동안 지속되는 군량 고갈을(를) 부여한다. 턴 종료 시 군량 고갈 상태를 보유한 적군에게 110%의 책략 피해를 준다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "supply-cut",
  name: "보급 차단",
  kind: "지휘",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "피해를 원문대로 '턴 종료 시'로 (예전엔 턴 시작 시 군량 고갈과 함께)"
    }
  ],
  clauses: [
    {
      "text": "턴 시작 시 적군 단일 목표에게 2턴 동안 지속되는 군량 고갈을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "턴 종료 시 군량 고갈 상태를 보유한 적군에게 110%의 책략 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]",
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_1",
    "legacyName": "보급 차단",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "턴 시작 시 적군 단일 목표에게 2턴 동안 지속되는 군량 고갈을(를) 부여한다. 턴 종료 시 군량 고갈 상태를 보유한 적군에게 55%→110%의 책략 피해를 준다.",
    "effects": {
      "statusEffects": [
        {
          "name": "군량 고갈",
          "target": "random_enemy_1",
          "duration": 2
        }
      ],
      "targets": [
        "random_enemy_1"
      ]
    },
    "preciseApplied": true,
    "clauses": [
      {
        "text": "턴 시작 시 적군 단일 목표에게 2턴 동안 지속되는 군량 고갈을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "턴 종료 시 군량 고갈 상태를 보유한 적군에게 55%→110%의 책략 피해를 준다",
        "impl": [
          "damage[0]",
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ],
    "_timing": "turnStart",
    "parts": [
      {
        "_timing": "turnEnd",
        "effects": {
          "damage": [
            {
              "dmgType": "책략",
              "min": 0.55,
              "max": 1.1,
              "target": "all_enemy",
              "condition": {
                "type": "hasStatus",
                "who": "target",
                "status": "군량 고갈"
              }
            }
          ]
        }
      }
    ]
  },
  run(c) {
    // 「턴 시작 시 적군 단일 목표에게 2턴 동안 지속되는 군량 고갈을(를) 부여한다」
    c.status(0);   // 군량 고갈, 대상 random_enemy_1, 2턴
  },
});
