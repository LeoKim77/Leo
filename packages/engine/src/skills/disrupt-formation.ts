// 적진 교란 · 전법 · 추격 35%
// 원문: 일반 공격 후, 공격 목표에게 220%의 병기 피해를 주며, 1턴 동안 지속되는 혼란을(를) 부여한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "disrupt-formation",
  name: "적진 교란",
  kind: "추격",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "'공격 목표'에게 피해·혼란 1턴 (예전엔 랜덤 적)"
    }
  ],
  clauses: [
    {
      "text": "일반 공격 후, 공격 목표에게 220%의 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "1턴 동안 지속되는 혼란을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_57",
    "legacyName": "적진 교란",
    "legacyType": "추격",
    "legacyProcRate": "35%",
    "raw": "일반 공격 후, 공격 목표에게 110%→220%의 병기 피해를 주며, 1턴 동안 지속되는 혼란을(를) 부여한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.1,
          "max": 2.2,
          "target": "trigger_defender"
        }
      ],
      "statusEffects": [
        {
          "name": "혼란",
          "target": "trigger_defender",
          "duration": 1
        }
      ],
      "targets": []
    },
    "clauses": [
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "공격 목표에게 110%→220%의 병기 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "1턴 동안 지속되는 혼란을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「일반 공격 후, 공격 목표에게 220%의 병기 피해를 주며」
    c.damage(0);   // 병기 110%→220%, 대상 trigger_defender
    // 「1턴 동안 지속되는 혼란을(를) 부여한다」
    c.status(0);   // 혼란, 대상 trigger_defender, 1턴
  },
});
