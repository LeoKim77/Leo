// 기문둔갑 · 전법 · 액티브 40%
// 원문: 1턴 동안 준비 후 전체 적군에게 250%의 책략 피해를 주며, 25% 확률로 1턴 동안 지속되는 공포을(를) 부여한다. 목표가 보유 중인 기타 이상 상태 하나 당 책략 피해 계수가 25% 증가하고, 공포 부여 확률이 8% 증가한다. 5회까지 증가할 수 있다.
// 원문 절 구현: ok / ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "qimen",
  name: "기문둔갑",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "기타 이상 상태(공포 제외 12종) 1개당 피해 +25%·공포 확률 +8% (최대 5) — 예전엔 방어 등 기능성 상태까지 셌고 공포 확률 증가 없음"
    }
  ],
  clauses: [
    {
      "text": "1턴 동안 준비 후 전체 적군에게 250%의 책략 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]",
        "prepTurns"
      ]
    },
    {
      "text": "25% 확률로 1턴 동안 지속되는 공포을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "목표가 보유 중인 기타 이상 상태 하나 당 책략 피해 계수가 25% 증가하고",
      "status": "ok"
    },
    {
      "text": "공포 부여 확률이 8% 증가한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "5회까지 증가할 수 있다",
      "status": "ok"
    }
  ],
  def: {
    "legacyId": "skill_30",
    "legacyName": "기문둔갑",
    "legacyType": "액티브",
    "legacyProcRate": "40%",
    "raw": "1턴 동안 준비 후 전체 적군에게 125%→250%의 책략 피해를 주며, 12.5%→25% 확률로 1턴 동안 지속되는 공포을(를) 부여한다. 목표가 보유 중인 기타 이상 상태 하나 당 책략 피해 계수가 25% 증가하고, 공포 부여 확률이 8% 증가한다. 5회까지 증가할 수 있다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.25,
          "max": 2.5,
          "target": "all_enemy",
          "tag": "main",
          "scaleBy": {
            "kind": "targetAbnormal",
            "per": 0.25,
            "cap": 5,
            "except": [
              "공포"
            ]
          }
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "공포",
          "target": "tag:main",
          "chance": 0.25,
          "duration": 1,
          "chanceScaleBy": {
            "per": 0.08,
            "cap": 5,
            "except": [
              "공포"
            ]
          }
        }
      ],
      "targets": []
    },
    "preciseApplied": true,
    "prepTurns": 1,
    "clauses": [
      {
        "text": "1턴 동안 준비 후 전체 적군에게 125%→250%의 책략 피해를 주며",
        "impl": [
          "damage[0]",
          "prepTurns"
        ],
        "status": "ok"
      },
      {
        "text": "12.5%→25% 확률로 1턴 동안 지속되는 공포을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 보유 중인 기타 이상 상태 하나 당 책략 피해 계수가 25% 증가",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "공포 부여 확률이 8% 증가한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "5회까지 증가할 수 있다",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「1턴 동안 준비 후 전체 적군에게 250%의 책략 피해를 주며」
    c.damage(0);   // 책략 125%→250%, 대상 all_enemy
    // 「25% 확률로 1턴 동안 지속되는 공포을(를) 부여한다」
    c.status(0);   // 공포, 대상 tag:main, 확률 25%, 1턴
  },
});
