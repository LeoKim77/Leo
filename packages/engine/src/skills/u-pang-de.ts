// 필사의 돌격 · 고유 전법 · 패시브 100%
// 원문: 전투 3번째, 5번째 턴에 자신이 행동 시, 2턴 동안 전체 적군의 통솔과 지력을 30포인트 감소시킨다(무력의 영향 받음). 이어서 340%의 병기 피해를 준다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-pang-de",
  name: "필사의 돌격",
  kind: "패시브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "능력치 감소에 무력 영향 반영"
    }
  ],
  clauses: [
    {
      "text": "전투 3번째",
      "status": "ok"
    },
    {
      "text": "5번째 턴에 자신이 행동 시, 2턴 동안 전체 적군의 통솔과 지력을 30포인트 감소시킨다(무력의 영향 받음)",
      "status": "ok",
      "impl": [
        "statMods[0]",
        "statMods[1]"
      ]
    },
    {
      "text": "이어서 340%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_36",
    "legacyName": "필사의 돌격",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "전투 3번째, 5번째 턴에 자신이 행동 시, 2턴 동안 전체 적군의 통솔과 지력을 15→30포인트 감소시킨다(무력의 영향 받음). 이어서 170%→340%의 병기 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.7,
          "max": 3.4
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "통솔",
          "min": -15,
          "max": -30,
          "target": "all_enemy",
          "duration": 2,
          "maxStacks": 1,
          "inf": {
            "stats": [
              "무력"
            ],
            "who": "self"
          }
        },
        {
          "stat": "지력",
          "min": -15,
          "max": -30,
          "target": "all_enemy",
          "duration": 2,
          "maxStacks": 1,
          "inf": {
            "stats": [
              "무력"
            ],
            "who": "self"
          }
        }
      ],
      "targets": [
        "all_enemy",
        "self"
      ],
      "statusEffects": []
    },
    "onlyTurns": [
      3,
      5
    ],
    "clauses": [
      {
        "text": "전투 3번째",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "5번째 턴에 자신이 행동 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "2턴 동안 전체 적군의 통솔과 지력을 15→30포인트 감소시킨다(무력의 영향 받음)",
        "impl": [
          "statMods[0]",
          "statMods[1]"
        ],
        "status": "ok"
      },
      {
        "text": "이어서 170%→340%의 병기 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「5번째 턴에 자신이 행동 시, 2턴 동안 전체 적군의 통솔과 지력을 30포인트 감소시킨다(무력의 영향 받음)」
    c.statMod(0);   // 통솔 -15→-30, 대상 all_enemy, 2턴, 최대 1중첩
    c.statMod(1);   // 지력 -15→-30, 대상 all_enemy, 2턴, 최대 1중첩
    // 「이어서 340%의 병기 피해를 준다」
    c.damage(0);   // 병기 170%→340%
  },
});
