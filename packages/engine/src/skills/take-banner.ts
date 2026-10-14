// 압도적 승리 · 전법 · 액티브 55%
// 원문: 통솔이 가장 낮은 적군 단일 목표에게 220%의 병기 피해를 주며, 2턴 동안 지속되는 군량 고갈을(를) 부여한다. 목표가 군량 고갈 상태를 보유한 경우, 추가로 80%의 병기 피해를 준다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "take-banner",
  name: "압도적 승리",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "원문 순서: 220% → 군량 고갈 2턴 → '군량 고갈이면' 추가 80%"
    }
  ],
  clauses: [
    {
      "text": "통솔이 가장 낮은 적군 단일 목표에게 220%의 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "2턴 동안 지속되는 군량 고갈을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "목표가 군량 고갈 상태를 보유한 경우, 추가로 80%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_15",
    "legacyName": "압도적 승리",
    "legacyType": "액티브",
    "legacyProcRate": "55%",
    "raw": "통솔이 가장 낮은 적군 단일 목표에게 110%→220%의 병기 피해를 주며, 2턴 동안 지속되는 군량 고갈을(를) 부여한다. 목표가 군량 고갈 상태를 보유한 경우, 추가로 40%→80%의 병기 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.1,
          "max": 2.2,
          "target": "lowest_control_enemy",
          "tag": "main"
        },
        {
          "dmgType": "병기",
          "min": 0.4,
          "max": 0.8,
          "target": "tag:main",
          "condition": {
            "type": "hasStatus",
            "who": "target",
            "status": "군량 고갈"
          }
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "군량 고갈",
          "target": "tag:main",
          "duration": 2
        }
      ],
      "targets": []
    },
    "specialApplied": true,
    "clauses": [
      {
        "text": "통솔이 가장 낮은 적군 단일 목표에게 110%→220%의 병기 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "2턴 동안 지속되는 군량 고갈을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 군량 고갈 상태를 보유한 경우",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "추가로 40%→80%의 병기 피해를 준다",
        "impl": [
          "damage[1]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「통솔이 가장 낮은 적군 단일 목표에게 220%의 병기 피해를 주며」
    c.damage(0);
    // 「2턴 동안 지속되는 군량 고갈을(를) 부여한다」
    c.status(0);
    // 「목표가 군량 고갈 상태를 보유한 경우, 추가로 80%의 병기 피해를 준다」
    c.damage(1);
  },
});
