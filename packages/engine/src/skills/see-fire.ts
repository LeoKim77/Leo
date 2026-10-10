// 예리한 판단 · 전법 · 액티브 50%
// 원문(도감 2026-10-07): 랜덤 아군 단일 목표(전열 우선)의 병력을 회복시키고(치유율 260%, 지력의 영향 받음), 해당 목표에게 2턴 동안 정신 회복을(를) 부여한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "see-fire",
  name: "예리한 판단",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-07",
      "note": "도감 녹화(S1 전설): 대상 \"랜덤 아군 단일 목표(전열 우선)\" — 전열 우선 반영"
    },
    {
      "date": "2026-10-04",
      "note": "'랜덤 아군 단일 목표' 1명 회복 + 그 목표에게 정신 회복 2턴 (예전엔 2명 회복)"
    }
  ],
  clauses: [
    {
      "text": "랜덤 아군 단일 목표(전열 우선)의 병력을 회복시키고(치유율 260%, 지력의 영향 받음)",
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
    "raw": "랜덤 아군 단일 목표(전열 우선)의 병력을 회복시키고(치유율 130%→260%, 지력의 영향 받음), 해당 목표에게 2턴 동안 정신 회복을(를) 부여한다.",
    "effects": {
      "heal": [
        {
          "min": 1.3,
          "max": 2.6,
          "target": "tag:one"
        }
      ],
      "statusEffects": [
        {
          "name": "정신 회복",
          "target": "tag:one",
          "duration": 2
        }
      ],
      "targets": [
        "random_ally_one"
      ]
    },
    "clauses": [
      {
        "text": "랜덤 아군 단일 목표(전열 우선)의 병력을 회복시키고(치유율 130%→260%",
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
    c.tag('one', c.targets('random_ally_front'));   // 「랜덤 아군 단일 목표(전열 우선)」
    // 「랜덤 아군 단일 목표(전열 우선)의 병력을 회복시키고(치유율 260%, 지력의 영향 받음)」
    c.heal(0);
    // 「해당 목표에게 2턴 동안 정신 회복을(를) 부여한다」
    c.status(0);
  },
});
