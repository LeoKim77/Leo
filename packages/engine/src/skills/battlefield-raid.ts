// 순간 돌습 · 전법 · 추격 40%
// 원문: 일반 공격 후, 2턴 동안 목표의 통솔을 30포인트 감소시키며, 이후 해당 목표에게 250%의 병기 피해를 준다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "battlefield-raid",
  name: "순간 돌습",
  kind: "추격",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "'목표' = 일반 공격 목표 (예전엔 통솔 감소·피해가 랜덤 적에게)"
    }
  ],
  clauses: [
    {
      "text": "일반 공격 후, 2턴 동안 목표의 통솔을 30포인트 감소시키며",
      "status": "ok",
      "impl": [
        "statMods[0]"
      ]
    },
    {
      "text": "이후 해당 목표에게 250%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_56",
    "legacyName": "순간 돌습",
    "legacyType": "추격",
    "legacyProcRate": "40%",
    "raw": "일반 공격 후, 2턴 동안 목표의 통솔을 15→30포인트 감소시키며, 이후 해당 목표에게 125%→250%의 병기 피해를 준다.",
    "effects": {
      "statMods": [
        {
          "stat": "통솔",
          "min": -15,
          "max": -30,
          "target": "trigger_defender",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.25,
          "max": 2.5,
          "target": "trigger_defender"
        }
      ]
    },
    "clauses": [
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "2턴 동안 목표의 통솔을 15→30포인트 감소시키며",
        "impl": [
          "statMods[0]"
        ],
        "status": "ok"
      },
      {
        "text": "해당 목표에게 125%→250%의 병기 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「일반 공격 후, 2턴 동안 목표의 통솔을 30포인트 감소시키며」
    c.statMod(0);   // 통솔 -15→-30, 대상 trigger_defender, 2턴, 최대 1중첩
    // 「이후 해당 목표에게 250%의 병기 피해를 준다」
    c.damage(0);   // 병기 125%→250%, 대상 trigger_defender
  },
});
