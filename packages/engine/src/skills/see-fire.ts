// 예리한 판단 · 전법 · 액티브 50%
// 원문: 랜덤 아군 단일 목표의 병력을 회복시키고(치유율 260%, 지력의 영향 받음), 해당 목표에게 2턴 동안 정신 회복을(를) 부여한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "see-fire",
  name: "예리한 판단",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "랜덤 아군 단일 목표의 병력을 회복시키고(치유율 260%, 지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]"
      ]
    },
    {
      "text": "해당 목표에게 2턴 동안 정신 회복을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_43",
    "legacyName": "예리한 판단",
    "legacyType": "액티브",
    "legacyProcRate": "50%",
    "raw": "랜덤 아군 단일 목표의 병력을 회복시키고(치유율 130%→260%, 지력의 영향 받음), 해당 목표에게 2턴 동안 정신 회복을(를) 부여한다.",
    "effects": {
      "damage": [],
      "heal": [
        {
          "min": 1.3,
          "max": 2.6
        }
      ],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_ally_n",
        "random_ally_n"
      ],
      "statusEffects": [
        "정신 회복"
      ]
    },
    "clauses": [
      {
        "text": "랜덤 아군 단일 목표의 병력을 회복시키고(치유율 130%→260%",
        "impl": [
          "heal[0]"
        ],
        "status": "ok"
      },
      {
        "text": "지력의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "해당 목표에게 2턴 동안 정신 회복을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「랜덤 아군 단일 목표의 병력을 회복시키고(치유율 260%, 지력의 영향 받음)」
    c.heal(0);   // 치유율 130%→260%
    // 「해당 목표에게 2턴 동안 정신 회복을(를) 부여한다」
    c.status(0);   // 정신 회복
  },
});
